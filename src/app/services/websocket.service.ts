import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { BehaviorSubject, Subject } from "rxjs";
import { UserActivity } from "../domain/userInfo";

declare var SockJS;
declare var Stomp;

const URL = environment.WS_ENDPOINT;

export interface Revision {
  field: string;
  value: string;
  action?: Action;
  sessionId?: string;
  date?: string;
}

interface Action {
  type: string;
  index?: number;
}

@Injectable({
  providedIn: 'root'  // Ensures the service is available globally
})
export class WebsocketService {
  private userSessionId: string | null = null;

  stompClient: Promise<typeof Stomp>;
  activeUsers: BehaviorSubject<UserActivity[]> = new BehaviorSubject<UserActivity[]>(null);
  edit: Subject<Revision> = new Subject<Revision>();

  count = 0;

  constructor() {}

  initializeWebSocketConnection(id: string, resourceType: string) {
  };

  WsLeave(action: string) { // {} is for headers
  }

  WsJoin(action: string) {
  }

  WsFocus(field?: string, value?: string) {
  }

  WsEdit(value: { field: string; value: any; action?: Action; }) {
  }

  closeWs() {
  }

  get userId() {
    return this.userSessionId;
  }
}
