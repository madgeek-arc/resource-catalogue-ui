import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HelpdeskService } from '../../../services/helpdesk.service';
import { CreateTicketRequest } from '../../../domain/helpdesk';

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
    // Pre-fill with user info if available
    const userInfo = this.helpdeskService.getCurrentUserInfo();
    if (userInfo.email) {
      this.ticketForm.patchValue({
        customerFirstname: userInfo.firstname,
        customerLastname: userInfo.lastname,
        customerEmail: userInfo.email
      });
    }
  }

  onSubmit(): void {
    if (this.ticketForm.valid) {
      this.loading = true;
      this.error = '';

      const ticketData: any = {
        customer: {
          firstname: this.ticketForm.value.customerFirstname,
          lastname: this.ticketForm.value.customerLastname,
          email: this.ticketForm.value.customerEmail
        },
        title: this.ticketForm.value.title,
        group: this.ticketForm.value.group,
        article: {
          subject: this.ticketForm.value.articleSubject,
          body: this.ticketForm.value.articleBody,
          type: this.ticketForm.value.articleType,
          internal: this.ticketForm.value.articleInternal
        }
      };

      this.helpdeskService.createTicket(ticketData).subscribe({
        next: (response) => {
          this.loading = false;
          this.success = true;
          setTimeout(() => {
            this.router.navigate(['/helpdesk/tickets']);
          }, 2000);
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Failed to create ticket. Please try again.';
          console.error('Error creating ticket:', err);
        }
      });
    } else {
      this.error = 'Please fill in all required fields: Title, Customer Email, and Message Body.';
    }
  }

  getErrorMessage(field: string): string {
    const control = this.ticketForm.get(field);
    if (control?.hasError('required')) {
      if (field === 'customerFirstname') return 'First name is required';
      if (field === 'customerLastname') return 'Last name is required';
      if (field === 'customerEmail') return 'Customer email is required';
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