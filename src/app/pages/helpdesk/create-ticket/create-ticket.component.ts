import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HelpdeskService } from '../../../services/helpdesk.service';
import { CreateTicketRequest } from '../../../../lib/domain/eic-model';

@Component({
  selector: 'app-create-ticket',
  templateUrl: './create-ticket.component.html',
  styleUrls: ['./create-ticket.component.css']
})
export class CreateTicketComponent implements OnInit {
  ticketForm: FormGroup;
  loading = false;
  error = '';
  success = false;

  constructor(
    private fb: FormBuilder,
    private helpdeskService: HelpdeskService,
    public router: Router
  ) {
    this.ticketForm = this.fb.group({
      customerFirstname: ['', [Validators.required]],
      customerLastname: ['', [Validators.required]],
      customerEmail: ['', [Validators.required, Validators.email]],
      title: ['', [Validators.required, Validators.minLength(5)]],
      group: [''], // Optional field
      articleSubject: [''],
      articleBody: ['', [Validators.required, Validators.minLength(10)]],
      articleType: ['note'],
      articleInternal: [false]
    });
  }

  ngOnInit(): void {
    // GDPR compliance: Customer data is collected for UX but not sent in payload
    // Backend handles user identification via access token
  }

  onSubmit(): void {
    if (this.ticketForm.valid) {
      this.loading = true;
      this.error = '';

      // Create payload without customer data for GDPR compliance
      // Customer data is collected for UX but not sent to backend
      const ticketData: CreateTicketRequest = {
        title: this.ticketForm.value.title,
        group: this.ticketForm.value.group,
        article: {
          subject: this.ticketForm.value.articleSubject,
          body: this.ticketForm.value.articleBody,
          type: this.ticketForm.value.articleType,
          internal: this.ticketForm.value.articleInternal
        }
      };

      console.log('🎫 Submitting ticket with data:', JSON.stringify(ticketData, null, 2));

      this.helpdeskService.createTicket(ticketData).subscribe({
        next: (response) => {
          console.log('✅ Ticket submitted successfully:', response);
          this.loading = false;
          this.success = true;
          // Reset form after successful submission
          this.ticketForm.reset();
          // Don't navigate away to avoid routing issues with ticket list
          // User can manually navigate to "My Tickets" if needed
        },
        error: (err) => {
          console.error('❌ Error submitting ticket:', err);
          this.loading = false;
          this.error = `Failed to create ticket. Error: ${err.status} - ${err.message || 'Unknown error'}`;
        }
      });
    } else {
      this.error = 'Please fill in all required fields: Customer Firstname, Customer Lastname, Customer Email, Title, and Message Body.';
    }
  }

  getErrorMessage(field: string): string {
    const control = this.ticketForm.get(field);
    if (control?.hasError('required')) {
      if (field === 'customerFirstname') return 'First name is required';
      if (field === 'customerLastname') return 'Last name is required';
      if (field === 'customerEmail') return 'Customer email is required';
      if (field === 'title') return 'Title is required';
      if (field === 'articleBody') return 'Message body is required';
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
    if (control?.hasError('minlength')) {
      const requiredLength = control.errors?.['minlength'].requiredLength;
      return `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${requiredLength} characters`;
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    return '';
  }
}
