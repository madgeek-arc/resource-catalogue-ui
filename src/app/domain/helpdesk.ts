export interface HelpdeskTicket {
  id?: string;
  title: string;
  group: string;
  customer: {
    firstname: string;
    lastname: string;
    email: string;
  };
  status?: string;
  created_at?: string;
  updated_at?: string;
  article: {
    subject?: string;
    body: string;
    type?: string;
    internal?: boolean;
  };
}

export interface HelpdeskUser {
  id?: string;
  firstname: string;
  lastname: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export interface HelpdeskTicketResponse {
  id: string;
  title: string;
  group: string;
  customer: {
    firstname: string;
    lastname: string;
    email: string;
  };
  status: string;
  created_at: string;
  updated_at: string;
  articles: HelpdeskArticle[];
}

export interface HelpdeskArticle {
  id: string;
  subject: string;
  body: string;
  type: string;
  internal: boolean;
  created_at: string;
  updated_at: string;
  from: string;
  to: string;
}

export interface CreateTicketRequest {
  title: string;
  group?: string;
  customer: {
    firstname: string;
    lastname: string;
    email: string;
  };
  article: {
    subject?: string;
    body: string;
    type?: string;
    internal?: boolean;
  };
  userToken?: string; // User's ID token for backend authentication
}

export interface CreateUserRequest {
  firstname: string;
  lastname: string;
  email: string;
} 