import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { HelpdeskService } from "../../../services/helpdesk.service";
import { CreateTicketRequest } from "../../../../lib/domain/eic-model";

@Component({
  selector: "app-create-ticket",
  templateUrl: "./create-ticket.component.html",
  styleUrls: ["./create-ticket.component.css"],
})
export class CreateTicketComponent implements OnInit {
  ticketForm: FormGroup;
  loading = false;
  success = false;
  // successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private helpdeskService: HelpdeskService,
    public router: Router
  ) {
    this.ticketForm = this.fb.group({
      title: ["", [Validators.required, Validators.minLength(5)]],
      status: ["new"], // Default status for new tickets
      articleBody: ["", [Validators.required, Validators.minLength(10)]],
    });
  }

  ngOnInit(): void {
    // GDPR compliance: Customer data is collected for UX but not sent in payload
    // Backend handles user identification via access token
  }

  onSubmit(): void {
    if (this.ticketForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      // Create payload without customer data for GDPR compliance
      // Customer data is collected for UX but not sent to backend
      const ticketData: CreateTicketRequest = {
        title: this.ticketForm.value.title,
        status: this.ticketForm.value.status,
        article: {
          subject: this.ticketForm.value.title, // Use title as subject if not provided
          body: this.ticketForm.value.articleBody,
        },
      };

      console.debug(
        "Submitting ticket with data:",
        JSON.stringify(ticketData, null, 2)
      );
      console.debug("Sending to KIT webhook via helpdesk service");

      this.helpdeskService.createTicket(ticketData).subscribe({
        next: (response) => {
          console.debug(" Ticket submitted successfully:", response);
          this.loading = false;
          this.success = true;
          // Reset form after successful submission
          this.ticketForm.reset();
          // Don't navigate away to avoid routing issues with ticket list
          // User can manually navigate to "My Tickets" if needed
        },
        error: (err) => {
          console.error("Error submitting ticket:", err);
          console.error("Full error details:", {
            status: err.status,
            statusText: err.statusText,
            url: err.url,
            error: err.error,
            message: err.message,
          });
          this.loading = false;
          this.errorMessage = `${err.error.message || 'Failed to create ticket.'}`;
        }
      });
    } else {
      this.errorMessage = 'Please fill in all required fields marked with an asterisk (*).';
    }
  }

  getErrorMessage(field: string): string {
    const control = this.ticketForm.get(field);
    if (control?.hasError("required")) {
      // Customer field error messages - commented out as per request
      // if (field === 'customerFirstname') return 'First name is required';
      // if (field === 'customerLastname') return 'Last name is required';
      // if (field === 'customerEmail') return 'Customer email is required';
      if (field === "title") return "Title is required";
      if (field === "articleBody") return "Message body is required";
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
    if (control?.hasError("minlength")) {
      const requiredLength = control.errors?.["minlength"].requiredLength;
      if (field === "articleBody") {
        return `Message should be at least ${requiredLength} characters`;
      }
      return `${
        field.charAt(0).toUpperCase() + field.slice(1)
      } must be at least ${requiredLength} characters`;
    }
    if (control?.hasError("email")) {
      return "Please enter a valid email address";
    }
    return "";
  }
}
