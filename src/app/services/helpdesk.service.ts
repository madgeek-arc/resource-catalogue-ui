import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import {
  HelpdeskTicketResponse,
  CreateTicketRequest,
} from "../../lib/domain/eic-model";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class HelpdeskService {
  private webhookUrl = environment.API_ENDPOINT + "/helpdesk";

  constructor(private http: HttpClient) {}

  /**
   * Create a new ticket in the helpdesk
   * Backend handles user identification via access token
   */
  createTicket(
    ticket: CreateTicketRequest
  ): Observable<HelpdeskTicketResponse> {
    const payload = {
      ...ticket,
      group: ticket.group || "EPOT", // Use provided group or default to EPOT
    };

    console.log("🔧 HelpdeskService: Sending POST via proxy to KIT webhook");
    console.log("🌐 Proxy route: /api/helpdesk → KIT webhook");
    console.log(
      "📦 Payload (GDPR compliant - no customer data):",
      JSON.stringify(payload, null, 2)
    );

    return this.http.post<HelpdeskTicketResponse>(this.webhookUrl, payload);
  }

  /**
   * Get all tickets for the current user
   * Backend handles user identification via access token
   */
  getUserTickets(): Observable<HelpdeskTicketResponse[]> {
    console.log(
      "🔧 HelpdeskService: Getting user tickets via proxy to KIT webhook"
    );
    return this.http.get<HelpdeskTicketResponse[]>(
      `${this.webhookUrl}/tickets`
    );
  }

  /**
   * Get a specific ticket by ID
   * Backend handles user identification via access token
   */
  getTicket(ticketId: string): Observable<HelpdeskTicketResponse> {
    console.log("🔧 HelpdeskService: Getting ticket via proxy to KIT webhook");
    return this.http.get<HelpdeskTicketResponse>(
      `${this.webhookUrl}/tickets/${ticketId}`
    );
  }

  // Note: User management methods removed as backend handles user identification
  // via access token authentication

  /**
   * Add a reply to an existing ticket
   * Backend handles user identification via access token
   */
  addReply(ticketId: string, body: string): Observable<HelpdeskTicketResponse> {
    const payload = {
      article: {
        body: body,
        type: "note",
        internal: false,
      },
    };

    console.log("🔧 HelpdeskService: Adding reply via proxy to KIT webhook");
    return this.http.post<HelpdeskTicketResponse>(
      `${this.webhookUrl}/tickets/${ticketId}/articles`,
      payload
    );
  }

  // Note: User info and token methods removed as backend handles user identification
  // via access token authentication. No personal data is sent in requests for GDPR compliance.
}
