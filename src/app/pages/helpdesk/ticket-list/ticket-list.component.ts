import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { Router } from "@angular/router";
import { HelpdeskService } from "../../../services/helpdesk.service";
import { HelpdeskTicketResponse } from "../../../../lib/domain/eic-model";

@Component({
  selector: "app-ticket-list",
  templateUrl: "./ticket-list.component.html",
  styleUrls: ["./ticket-list.component.css"],
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
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.loading = true;
    this.error = "";
    // Clear cache when loading new tickets
    this._cachedFilteredTickets = [];
    this._lastFilterStatus = "";

    this.helpdeskService.getUserTickets().subscribe({
      next: (tickets) => {
        this.tickets = tickets;
        this.updatePagination();
        this.loading = false;
      },
      error: (err) => {
        this.error = "Failed to load tickets. Please try again.";
        this.loading = false;
        console.error("Error loading tickets:", err);
      },
    });
  }

  getFilteredTickets(): HelpdeskTicketResponse[] {
    // Use cache if status hasn't changed
    if (
      this._lastFilterStatus === this.selectedStatus &&
      this._cachedFilteredTickets.length > 0
    ) {
      return this._cachedFilteredTickets;
    }

    let filtered: HelpdeskTicketResponse[];
    if (this.selectedStatus === "all") {
      filtered = this.tickets;
    } else {
      filtered = this.tickets.filter(
        (ticket) => this.getTicketState(ticket) === this.selectedStatus
      );
    }

    // Cache the result
    this._cachedFilteredTickets = filtered;
    this._lastFilterStatus = this.selectedStatus;

    console.log(
      `🔍 Filtered tickets for status "${this.selectedStatus}":`,
      filtered.length
    );
    return filtered;
  }

  get sortedTickets(): HelpdeskTicketResponse[] {
    return [...this.getFilteredTickets()].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
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
    console.log(
      "🔄 Changing status filter from",
      this.selectedStatus,
      "to",
      status
    );
    this.selectedStatus = status;
    this.onStatusChange();
    console.log(
      "📊 After filter change - paginated tickets:",
      this.paginatedTickets.map((t) => ({
        number: t.number,
        state_id: t.state_id,
        state: this.getTicketState(t),
      }))
    );
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.cdr.detectChanges();
      console.log("📄 Navigated to page:", page);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(
      1,
      this.currentPage - Math.floor(maxVisiblePages / 2)
    );
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

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
        return "status-new";
      case "open":
        return "status-open";
      case "pending close":
        return "status-pending-close";
      case "pending reminder":
        return "status-pending-reminder";
      case "closed":
        return "status-closed";
      default:
        return "status-default";
    }
  }

  getStatusIcon(statusOrState: string | undefined): string {
    const status = statusOrState?.toLowerCase() || "";
    switch (status) {
      case "new":
        return "fa fa-plus-circle";
      case "open":
        return "fa fa-exclamation-circle";
      case "pending close":
        return "fa fa-clock";
      case "pending reminder":
        return "fa fa-bell";
      case "closed":
        return "fa fa-check-circle";
      default:
        return "fa fa-question-circle";
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

  /**
   * Gets the state name from a ticket, checking state_id first, then state
   */
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
    // Use UTC methods to get the time as it appears in the ISO string (UTC timezone)
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
    // Format: "Oct 31, 2025, 14:14" (24-hour format)
    return `${month} ${day}, ${year}, ${hours}:${minutes}`;
  }

  viewTicket(ticketNumber: string): void {
    console.log("🔍 Viewing ticket with number:", ticketNumber);

    // Find the ticket in our list using ticket.number (string)
    let ticketFromList = this.paginatedTickets.find(
      (t) => t.number === ticketNumber
    );

    if (!ticketFromList) {
      ticketFromList = this.tickets.find((t) => t.number === ticketNumber);
    }

    if (!ticketFromList) {
      console.error("❌ Ticket not found with number:", ticketNumber);
      return;
    }

    if (!ticketFromList.id) {
      console.error("❌ Ticket ID is missing for ticket:", ticketNumber);
      return;
    }

    // Use ticket.id (number) for API call: GET /helpdesk/tickets/{ticket_id}
    const ticketIdForApi = String(ticketFromList.id); // Convert number to string
    console.log("📞 Calling API with ticket ID:", ticketIdForApi);
    this.helpdeskService.getTicket(ticketIdForApi).subscribe({
      next: (fullTicket) => {
        console.log("🎫 Full ticket details (raw):", fullTicket);

        // Handle case where API returns an array instead of a single object
        let ticketData: HelpdeskTicketResponse;
        if (Array.isArray(fullTicket)) {
          ticketData = fullTicket[0];
          console.log(
            "📋 API returned array, using first element:",
            ticketData
          );
        } else {
          ticketData = fullTicket;
        }

        console.log("🎫 Processed ticket data:", ticketData);
        this.selectedTicket = ticketData;
        this.isModalOpen = true;
        this.cdr.detectChanges();
        console.log("✅ Modal opened for ticket:", ticketData.number);
      },
      error: (err) => {
        console.error("❌ Error fetching ticket details:", err);
        // Fallback to ticket from list if API call fails
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

  createNewTicket(): void {
    this.router.navigate(["/helpdesk/create"]);
  }

  getTicketCount(status: string): number {
    if (status === "all") {
      return this.tickets.length;
    }
    return this.tickets.filter(
      (ticket) => this.getTicketState(ticket) === status
    ).length;
  }

  getEndIndex(): number {
    const filteredLength = this.getFilteredTickets().length;
    return Math.min(this.currentPage * this.itemsPerPage, filteredLength);
  }
}
