import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { Router } from "@angular/router";
import { HelpdeskService } from "../../../services/helpdesk.service";
import { HelpdeskNotificationService } from "../../../services/helpdesk-notification.service";
import { HelpdeskTicketResponse } from "../../../../lib/domain/eic-model";
import { TicketModalComponent } from "../ticket-modal/ticket-modal.component";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-ticket-list",
  templateUrl: "./ticket-list.component.html",
  styleUrls: ["./ticket-list.component.css"],
  standalone: true,
  imports: [TicketModalComponent, CommonModule],
})
export class TicketListComponent implements OnInit {
  tickets: HelpdeskTicketResponse[] = [];
  loading = true;
  error = "";
  selectedStatus = "all";

  // Pagination properties
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;

  // Modal properties
  selectedTicket: HelpdeskTicketResponse | null = null;
  isModalOpen = false;

  // Cached filtered tickets to prevent multiple evaluations
  private _cachedFilteredTickets: HelpdeskTicketResponse[] = [];
  private _lastFilterStatus = "";

  constructor(
    private helpdeskService: HelpdeskService,
    private notificationService: HelpdeskNotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.loading = true;
    this.error = "";
    this._cachedFilteredTickets = [];
    this._lastFilterStatus = "";

    this.helpdeskService.getUserTickets().subscribe({
      next: (tickets) => {
        this.tickets = tickets ?? [];
        this.tickets.forEach((t) => this.notificationService.initIfUnseen(t));
        this.notificationService.updateTotals(this.tickets);
        this.currentPage = 1;
        this.updatePagination();
      },
      error: (err) => {
        this.error = "Failed to load tickets. Please try again.";
        this.loading = false;
        console.error("Error loading tickets:", err);
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  getUnreadCount(ticket: HelpdeskTicketResponse): number {
    return this.notificationService.getUnreadCount(ticket);
  }

  getFilteredTickets(): HelpdeskTicketResponse[] {
    if (
      this._lastFilterStatus === this.selectedStatus &&
      this._cachedFilteredTickets.length > 0
    ) {
      return this._cachedFilteredTickets;
    }

    const tickets = this.tickets ?? [];
    let filtered: HelpdeskTicketResponse[];
    if (this.selectedStatus === "all") {
      filtered = tickets;
    } else {
      filtered = tickets.filter(
        (ticket) => this.getTicketState(ticket) === this.selectedStatus,
      );
    }

    this._cachedFilteredTickets = filtered;
    this._lastFilterStatus = this.selectedStatus;

    console.debug(
      `Filtered tickets for status "${this.selectedStatus}":`,
      filtered.length,
    );
    return filtered;
  }

  get sortedTickets(): HelpdeskTicketResponse[] {
    return [...this.getFilteredTickets()].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }

  get paginatedTickets(): HelpdeskTicketResponse[] {
    const sorted = this.sortedTickets;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return sorted.slice(startIndex, endIndex);
  }

  updatePagination(): void {
    const filteredTickets = this.getFilteredTickets();
    this.totalPages = Math.ceil(filteredTickets.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = 1;
    }
  }

  onStatusChange(): void {
    this.currentPage = 1;
    this.updatePagination();
    this.cdr.detectChanges();
  }

  setStatusFilter(status: string): void {
    console.debug(
      "Changing status filter from",
      this.selectedStatus,
      "to",
      status,
    );
    this.selectedStatus = status;
    this.onStatusChange();
    console.debug(
      "After filter change - paginated tickets:",
      this.paginatedTickets.map((t) => ({
        number: t.number,
        state_id: t.state_id,
        state: this.getTicketState(t),
      })),
    );
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.cdr.detectChanges();
      console.debug("Navigated to page:", page);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(
      1,
      this.currentPage - Math.floor(maxVisiblePages / 2),
    );
    const endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  getStatusClass(statusOrState: string | undefined): string {
    const status = statusOrState?.toLowerCase() || "";
    switch (status) {
      case "new":
        return "uk-label-info";
      case "open":
        return "uk-label-danger";
      case "pending close":
      case "pending reminder":
        return "uk-label-warning";
      case "closed":
        return "uk-label-success";
      default:
        return "uk-label-gray";
    }
  }

  getStatusIcon(statusOrState: string | undefined): string {
    const status = statusOrState?.toLowerCase() || "";
    switch (status) {
      case "new":
        return "add_circle";
      case "open":
        return "error";
      case "pending close":
        return "schedule";
      case "pending reminder":
        return "notifications";
      case "closed":
        return "check_circle";
      default:
        return "help";
    }
  }

  /**
   * Converts state_id to state name
   * state_id: 1 --> "new"
   * state_id: 2 --> "open"
   * state_id: 3 --> "pending reminder"
   * state_id: 4 --> "closed"
   * state_id: 7 --> "pending close"
   */
  getStateFromId(stateId: number | undefined): string {
    if (!stateId) {
      return "";
    }
    switch (stateId) {
      case 1:
        return "new";
      case 2:
        return "open";
      case 3:
        return "pending reminder";
      case 4:
        return "closed";
      case 7:
        return "pending close";
      default:
        return "";
    }
  }

  getTicketState(ticket: HelpdeskTicketResponse): string {
    if (ticket.state_id !== undefined) {
      return this.getStateFromId(ticket.state_id);
    }
    return ticket.state || "";
  }

  formatDate(dateString: string): string {
    if (!dateString) {
      return "";
    }
    const date = new Date(dateString);
    const day = date.getUTCDate();
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = monthNames[date.getUTCMonth()];
    const year = date.getUTCFullYear();
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    return `${month} ${day}, ${year}, ${hours}:${minutes}`;
  }

  viewTicket(ticketNumber: string): void {
    console.log("Viewing ticket with number:", ticketNumber);

    let ticketFromList = this.paginatedTickets.find(
      (t) => t.number === ticketNumber,
    );

    if (!ticketFromList) {
      ticketFromList = this.tickets.find((t) => t.number === ticketNumber);
    }

    if (!ticketFromList) {
      console.error("Ticket not found with number:", ticketNumber);
      return;
    }

    if (!ticketFromList.id) {
      console.error("Ticket ID is missing for ticket:", ticketNumber);
      return;
    }

    const ticketIdForApi = String(ticketFromList.id);
    console.log("Calling API with ticket ID:", ticketIdForApi);
    this.helpdeskService.getTicket(ticketIdForApi).subscribe({
      next: (fullTicket) => {
        console.debug("Full ticket details (raw):", fullTicket);

        let ticketData: HelpdeskTicketResponse;
        if (Array.isArray(fullTicket)) {
          ticketData = fullTicket[0];
          console.debug("API returned array, using first element:", ticketData);
        } else {
          ticketData = fullTicket;
        }

        console.debug("Processed ticket data:", ticketData);
        this.notificationService.markAsRead(ticketData);
        this.notificationService.updateTotals(this.tickets);
        this.selectedTicket = ticketData;
        this.isModalOpen = true;
        this.cdr.detectChanges();
        console.debug("Modal opened for ticket:", ticketData.number);
      },
      error: (err) => {
        console.error("Error fetching ticket details:", err);
        this.selectedTicket = ticketFromList;
        this.isModalOpen = true;
        this.cdr.detectChanges();
      },
    });
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedTicket = null;
    this.cdr.detectChanges();
  }

  onTicketUpdated(ticket: HelpdeskTicketResponse): void {
    const idx = this.tickets.findIndex((t) => t.id === ticket.id);
    if (idx !== -1) {
      this.tickets[idx] = ticket;
    }
    this.notificationService.updateTotals(this.tickets);
    this.cdr.detectChanges();
  }

  createNewTicket(): void {
    this.router.navigate(["/helpdesk/create"]);
  }

  getTicketCount(status: string): number {
    if (status === "all") {
      return this.tickets?.length ?? 0;
    }
    return (this.tickets ?? []).filter(
      (ticket) => this.getTicketState(ticket) === status,
    ).length;
  }

  getEndIndex(): number {
    const filteredLength = this.getFilteredTickets().length;
    return Math.min(this.currentPage * this.itemsPerPage, filteredLength);
  }
}
