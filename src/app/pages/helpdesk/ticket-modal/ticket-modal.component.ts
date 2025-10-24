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

@Component({
  selector: "app-ticket-modal",
  templateUrl: "./ticket-modal.component.html",
  styleUrls: ["./ticket-modal.component.css"],
})
export class TicketModalComponent implements OnInit, OnChanges {
  @Input() ticket: HelpdeskTicketResponse | null = null;
  @Input() isOpen: boolean = false;
  @Output() closeModal = new EventEmitter<void>();

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["isOpen"]) {
      console.log("🔄 Modal isOpen changed:", changes["isOpen"].currentValue);
    }
    if (changes["ticket"]) {
      console.log("🎫 Modal ticket changed:", changes["ticket"].currentValue);
    }
  }

  onClose(): void {
    console.log("❌ Modal close requested");
    this.closeModal.emit();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
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

  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
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
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  isUserMessage(article: any): boolean {
    // Assuming user messages have a specific type or from field
    return article.type === "note" && !article.internal;
  }
}
