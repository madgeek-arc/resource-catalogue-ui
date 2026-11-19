import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import {
  HelpdeskTicketResponse,
  HelpdeskArticle,
} from "../../../../lib/domain/eic-model";
import { HelpdeskService } from "../../../services/helpdesk.service";
import { HelpdeskNotificationService } from "../../../services/helpdesk-notification.service";

@Component({
  selector: "app-ticket-modal",
  templateUrl: "./ticket-modal.component.html",
  styleUrls: ["./ticket-modal.component.css"],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class TicketModalComponent implements OnInit, OnChanges {
  @Input() ticket: HelpdeskTicketResponse | null = null;
  @Input() isOpen: boolean = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() ticketUpdated = new EventEmitter<HelpdeskTicketResponse>();

  replyForm: FormGroup;
  submittingReply: boolean = false;
  replyError: string = "";

  constructor(
    private formBuilder: FormBuilder,
    private helpdeskService: HelpdeskService,
    private notificationService: HelpdeskNotificationService
  ) {
    this.replyForm = this.formBuilder.group({
      body: ["", [Validators.required]],
    });
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["isOpen"]) {
      console.log("🔄 Modal isOpen changed:", changes["isOpen"].currentValue);
      if (!changes["isOpen"].currentValue) {
        this.replyForm.reset();
        this.replyError = "";
      }
    }
    if (changes["ticket"]) {
      const ticket = changes["ticket"].currentValue;
      console.log("🎫 Modal ticket changed:", ticket);
      this.replyForm.reset();
      this.replyError = "";
      if (ticket) {
        console.log("📅 Ticket timestamps:", {
          created_at: ticket.created_at,
          updated_at: ticket.updated_at,
          close_at: ticket.close_at,
        });
      }
    }
  }

  onClose(): void {
    console.log("❌ Modal close requested");
    this.replyForm.reset();
    this.replyError = "";
    this.submittingReply = false;
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
      case "new": return "status-new";
      case "open": return "status-open";
      case "pending close": return "status-pending-close";
      case "pending reminder": return "status-pending-reminder";
      case "closed": return "status-closed";
      default: return "status-default";
    }
  }

  getStatusLabelClass(status: string | undefined): string {
    const statusLower = status?.toLowerCase() || "";
    switch (statusLower) {
      case "new": return "uk-label-info";
      case "open": return "uk-label-danger";
      case "pending close":
      case "pending reminder": return "uk-label-warning";
      case "closed": return "uk-label-success";
      default: return "uk-label-gray";
    }
  }

  getStatusIcon(status: string | undefined): string {
    const statusLower = status?.toLowerCase() || "";
    switch (statusLower) {
      case "new": return "fa fa-plus-circle";
      case "open": return "fa fa-exclamation-circle";
      case "pending close": return "fa fa-clock";
      case "pending reminder": return "fa fa-bell";
      case "closed": return "fa fa-check-circle";
      default: return "fa fa-question-circle";
    }
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getUTCDate();
    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const month = monthNames[date.getUTCMonth()];
    const year = date.getUTCFullYear();
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    return `${day} ${month} ${year} at ${hours}:${minutes}`;
  }

  formatTime(dateString: string | undefined): string {
    if (!dateString) return "";
    const date = new Date(dateString);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  /**
   * Converts state_id to state name
   * state_id: 1 --> "new", 2 --> "open", 3 --> "pending reminder",
   * state_id: 4 --> "closed", 7 --> "pending close"
   */
  getStateFromId(stateId: number | undefined): string {
    if (!stateId) return "";
    switch (stateId) {
      case 1: return "new";
      case 2: return "open";
      case 3: return "pending reminder";
      case 4: return "closed";
      case 7: return "pending close";
      default: return "";
    }
  }

  getTicketState(ticket: HelpdeskTicketResponse | null): string {
    if (!ticket) return "";
    if (ticket.state_id !== undefined) return this.getStateFromId(ticket.state_id);
    return ticket.state || "";
  }

  cleanBodyHtml(html: string | undefined): string {
    if (!html) return "";
    return html.replace(/^(<br\s*\/?>)+/i, "");
  }

  isEpotMessage(article: HelpdeskArticle): boolean {
    return article.sender === "Agent";
  }

  getMessageOriginator(article: HelpdeskArticle): string {
    return this.isEpotMessage(article) ? "EPOT" : "USER";
  }

  isTicketClosed(): boolean {
    if (!this.ticket) return false;
    return this.getTicketState(this.ticket).toLowerCase() === "closed";
  }

  onSubmitReply(): void {
    if (this.replyForm.valid && this.ticket && this.ticket.id) {
      this.submittingReply = true;
      this.replyError = "";

      const ticketId = String(this.ticket.id);
      const replyBody = this.replyForm.value.body;

      this.helpdeskService.addReply(ticketId, replyBody).subscribe({
        next: () => {
          console.log("✅ Reply submitted successfully");
          this.replyForm.reset();

          this.helpdeskService.getTicket(ticketId).subscribe({
            next: (fullTicket) => {
              const ticketData = Array.isArray(fullTicket) ? fullTicket[0] : fullTicket;
              this.ticket = ticketData;
              this.submittingReply = false;
              // Mark as read immediately so the user's own reply does not
              // trigger a false notification badge on the next list load.
              this.notificationService.markAsRead(ticketData);
              this.ticketUpdated.emit(ticketData);
              console.log("✅ Ticket refreshed with updated conversation");
            },
            error: (fetchErr) => {
              console.error("⚠️ Reply sent but failed to refresh ticket:", fetchErr);
              this.submittingReply = false;
            }
          });
        },
        error: (err) => {
          console.error("❌ Error submitting reply:", err);
          if (err.status === 500) {
            this.replyError = "Server error. Please contact support if the issue persists.";
          } else if (err.status === 404) {
            this.replyError = "Ticket not found. Please refresh and try again.";
          } else if (err.status === 400) {
            this.replyError = "Invalid request. Please check your message and try again.";
          } else {
            this.replyError = "Failed to send reply. Please try again.";
          }
          this.submittingReply = false;
        },
      });
    }
  }

  getErrorMessage(field: string): string {
    const control = this.replyForm.get(field);
    if (control?.hasError("required")) return `${field} is required`;
    return "";
  }
}
