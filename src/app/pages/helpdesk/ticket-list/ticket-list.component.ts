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
        (ticket) => (ticket.status || ticket.state) === this.selectedStatus
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
        status: t.status || t.state,
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

  getStatusClass(statusOrState: string): string {
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

  getStatusIcon(statusOrState: string): string {
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

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  viewTicket(ticketId: string): void {
    console.log("🔍 Viewing ticket:", ticketId);
    // First try to find in the current paginated tickets (most reliable)
    let ticket = this.paginatedTickets.find(
      (t) => t.id === ticketId || t.number === ticketId
    );

    // If not found in paginated, try the full tickets array
    if (!ticket) {
      ticket = this.tickets.find(
        (t) => t.id === ticketId || t.number === ticketId
      );
    }

    console.log("🎫 Found ticket:", ticket);
    if (ticket) {
      this.selectedTicket = ticket;
      this.isModalOpen = true;
      this.cdr.detectChanges();
      console.log("✅ Modal opened for ticket:", ticket.number);
    } else {
      console.error("❌ Ticket not found:", ticketId);
      console.log(
        "Available tickets:",
        this.paginatedTickets.map((t) => t.number)
      );
    }
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
      (ticket) => (ticket.status || ticket.state) === status
    ).length;
  }

  getEndIndex(): number {
    const filteredLength = this.getFilteredTickets().length;
    return Math.min(this.currentPage * this.itemsPerPage, filteredLength);
  }
}
