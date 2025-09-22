import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HelpdeskService } from '../../../services/helpdesk.service';
import { HelpdeskTicketResponse, HelpdeskArticle } from '../../../../lib/domain/eic-model';

@Component({
  selector: 'app-ticket-detail',
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.css']
})
export class TicketDetailComponent implements OnInit {
  ticket: HelpdeskTicketResponse | null = null;
  loading = true;
  error = '';
  replyForm: FormGroup;
  submittingReply = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private helpdeskService: HelpdeskService,
    private fb: FormBuilder
  ) {
    this.replyForm = this.fb.group({
      body: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    const ticketId = this.route.snapshot.paramMap.get('id');
    if (ticketId) {
      this.loadTicket(ticketId);
    }
  }

  loadTicket(ticketId: string): void {
    this.loading = true;
    this.error = '';

    this.helpdeskService.getTicket(ticketId).subscribe({
      next: (ticket) => {
        this.ticket = ticket;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load ticket. Please try again.';
        this.loading = false;
        console.error('Error loading ticket:', err);
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'open':
        return 'status-open';
      case 'pending':
        return 'status-pending';
      case 'closed':
        return 'status-closed';
      case 'escalated':
        return 'status-escalated';
      default:
        return 'status-default';
    }
  }

  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'open':
        return 'fas fa-exclamation-circle';
      case 'pending':
        return 'fas fa-clock';
      case 'closed':
        return 'fas fa-check-circle';
      case 'escalated':
        return 'fas fa-arrow-up';
      default:
        return 'fas fa-question-circle';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isUserMessage(article: HelpdeskArticle): boolean {
    // Check if the message is from the current user
    const userEmail = this.helpdeskService.getCurrentUserInfo().email;
    return article.from === userEmail;
  }

  onSubmitReply(): void {
    if (this.replyForm.valid && this.ticket) {
      this.submittingReply = true;

      this.helpdeskService.addReply(this.ticket.id, this.replyForm.value.body).subscribe({
        next: (updatedTicket) => {
          this.ticket = updatedTicket;
          this.replyForm.reset();
          this.submittingReply = false;
        },
        error: (err) => {
          this.error = 'Failed to send reply. Please try again.';
          this.submittingReply = false;
          console.error('Error sending reply:', err);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/helpdesk/tickets']);
  }

  getErrorMessage(field: string): string {
    const control = this.replyForm.get(field);
    if (control?.hasError('required')) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
    if (control?.hasError('minlength')) {
      const requiredLength = control.errors?.['minlength'].requiredLength;
      return `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${requiredLength} characters`;
    }
    return '';
  }
}
