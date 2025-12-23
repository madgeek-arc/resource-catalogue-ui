import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { HelpdeskTicketResponse } from "../../../../lib/domain/eic-model";
import { CommonModule } from '@angular/common';

@Component({
  selector: "app-ticket-modal",
  templateUrl: "./ticket-modal.component.html",
  styleUrls: ["./ticket-modal.component.css"],
  standalone: true,
  imports: [CommonModule]
})
export class TicketModalComponent implements OnInit, OnChanges {
  @Input() ticket: HelpdeskTicketResponse | null = null;
  @Input() isOpen: boolean = false;
  @Output() closeModal = new EventEmitter<void>();

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["isOpen"]) {
      console.debug("Modal isOpen changed:", changes["isOpen"].currentValue);
    }
    if (changes["ticket"]) {
      const ticket = changes["ticket"].currentValue;
      console.debug("Modal ticket changed:", ticket);
      if (ticket) {
        console.debug("Ticket timestamps:", {
          created_at: ticket.created_at,
          updated_at: ticket.updated_at,
          close_at: ticket.close_at,
        });
      }
    }
  }

  onClose(): void {
    console.debug(" Modal close requested");
    this.closeModal.emit();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  getStatusClass(status: string | undefined): string {
    const statusLower = status?.toLowerCase() || "";
    switch (statusLower) {
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

  getStatusIcon(status: string | undefined): string {
    const statusLower = status?.toLowerCase() || "";
    switch (statusLower) {
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

  formatDate(dateString: string | undefined): string {
    if (!dateString) {
      return "";
    }
    const date = new Date(dateString);
    // Use UTC methods to get the time as it appears in the ISO string (UTC timezone)
    const day = date.getUTCDate();
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const month = monthNames[date.getUTCMonth()];
    const year = date.getUTCFullYear();
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    return `${day} ${month} ${year} at ${hours}:${minutes}`;
  }

  formatTime(dateString: string | undefined): string {
    if (!dateString) {
      return "";
    }
    const date = new Date(dateString);
    // Use UTC methods to get the time as it appears in the ISO string (UTC timezone)
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
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
  getTicketState(ticket: HelpdeskTicketResponse | null): string {
    if (!ticket) {
      return "";
    }
    if (ticket.state_id !== undefined) {
      return this.getStateFromId(ticket.state_id);
    }
    return ticket.state || "";
  }

  /**
   * Strips leading <br> tags from HTML content
   */
  cleanBodyHtml(html: string | undefined): string {
    if (!html) {
      return "";
    }
    // Remove leading <br> or <br/> tags (case insensitive, with optional attributes)
    return html.replace(/^(<br\s*\/?>)+/i, "");
  }
}
