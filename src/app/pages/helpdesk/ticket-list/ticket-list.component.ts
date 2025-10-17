import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HelpdeskService } from '../../../services/helpdesk.service';
import { HelpdeskTicketResponse } from '../../../../lib/domain/eic-model';

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.css']
})
export class TicketListComponent implements OnInit {
  tickets: HelpdeskTicketResponse[] = [];
  loading = true;
  error = '';
  selectedStatus = 'all';

  constructor(
    private helpdeskService: HelpdeskService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.loading = true;
    this.error = '';

    this.helpdeskService.getUserTickets().subscribe({
      next: (tickets) => {
        this.tickets = tickets;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load tickets. Please try again.';
        this.loading = false;
        console.error('Error loading tickets:', err);
      }
    });
  }

  getFilteredTickets(): HelpdeskTicketResponse[] {
    if (this.selectedStatus === 'all') {
      return this.tickets;
    }
    return this.tickets.filter(ticket => ticket.status === this.selectedStatus);
  }

  get sortedTickets(): HelpdeskTicketResponse[] {
    return [...this.getFilteredTickets()].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  viewTicket(ticketId: string): void {
    this.router.navigate(['/helpdesk/ticket', ticketId]);
  }

  createNewTicket(): void {
    this.router.navigate(['/helpdesk/create']);
  }

  getTicketCount(status: string): number {
    if (status === 'all') {
      return this.tickets.length;
    }
    return this.tickets.filter(ticket => ticket.status === status).length;
  }
}
