import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  HelpdeskTicket, 
  HelpdeskUser, 
  HelpdeskTicketResponse, 
  CreateTicketRequest, 
  CreateUserRequest 
} from '../domain/helpdesk';
import { AuthenticationService } from '../../lib/services/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class HelpdeskService {
  private webhookUrl = 'https://helpdesk-adapter.scc.kit.edu/webhook/c22d4068-5112-4a1e-bb81-7abc12726fc6';

  constructor(
    private http: HttpClient,
    private authService: AuthenticationService
  ) {}

  /**
   * Create a new ticket in the helpdesk
   */
  createTicket(ticket: CreateTicketRequest): Observable<HelpdeskTicketResponse> {
    const payload = {
      ...ticket,
      group: 'EPOT'
    };
    
    return this.http.post<HelpdeskTicketResponse>(this.webhookUrl, payload);
  }

  /**
   * Get all tickets for the current user
   */
  getUserTickets(): Observable<HelpdeskTicketResponse[]> {
    const userEmail = this.authService.getUserEmail();
    
    // For now, return empty array since the webhook endpoint might not support GET requests
    // TODO: Replace with actual API endpoint when available
    return new Observable<HelpdeskTicketResponse[]>(observer => {
      setTimeout(() => {
        observer.next([]);
        observer.complete();
      }, 1000); // Simulate network delay
    });
    
    // Uncomment when proper API endpoint is available:
    // return this.http.get<HelpdeskTicketResponse[]>(`${this.webhookUrl}/tickets?customer=${userEmail}`);
  }

  /**
   * Get a specific ticket by ID
   */
  getTicket(ticketId: string): Observable<HelpdeskTicketResponse> {
    return this.http.get<HelpdeskTicketResponse>(`${this.webhookUrl}/tickets/${ticketId}`);
  }

  /**
   * Create a new user in the helpdesk
   */
  createUser(user: CreateUserRequest): Observable<HelpdeskUser> {
    return this.http.post<HelpdeskUser>(`${this.webhookUrl}/users`, user);
  }

  /**
   * Get user information
   */
  getUser(email: string): Observable<HelpdeskUser> {
    return this.http.get<HelpdeskUser>(`${this.webhookUrl}/users?email=${email}`);
  }

  /**
   * Add a reply to an existing ticket
   */
  addReply(ticketId: string, body: string): Observable<HelpdeskTicketResponse> {
    const payload = {
      article: {
        body: body,
        type: 'note',
        internal: false
      }
    };
    
    return this.http.post<HelpdeskTicketResponse>(`${this.webhookUrl}/tickets/${ticketId}/articles`, payload);
  }

  /**
   * Get current user info for ticket creation
   */
  getCurrentUserInfo(): { firstname: string; lastname: string; email: string } {
    return {
      firstname: this.authService.getUserName(),
      lastname: this.authService.getUserSurname(),
      email: this.authService.getUserEmail()
    };
  }
} 