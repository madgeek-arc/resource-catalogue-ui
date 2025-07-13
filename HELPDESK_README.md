# EOSC Beyond Helpdesk Integration

This document describes the helpdesk functionality integrated into the EOSC Beyond Providers Portal.

## Overview

The helpdesk interface allows users to create support tickets and communicate with the EOSC Beyond support team through the Zammad helpdesk system.

## Features

### 1. Create New Tickets
- Users can create new support tickets with title and description
- Form validation ensures required fields are completed
- Automatic user information pre-filling from authentication service

### 2. View Ticket List
- Display all user's tickets with filtering by status
- Status indicators (Open, Pending, Closed, Escalated)
- Ticket preview with creation date and message count
- Responsive grid layout

### 3. Ticket Timeline
- Detailed view of individual tickets
- Timeline showing all messages in chronological order
- Visual distinction between user messages and support responses
- Ability to add replies to open tickets

### 4. User Authentication Integration
- Leverages existing authentication service
- Pre-fills user information (name, email) in ticket creation
- Only authenticated users can access helpdesk features

## Technical Implementation

### Architecture
- **Module**: `HelpdeskModule` - Lazy-loaded Angular module
- **Service**: `HelpdeskService` - Handles API communication
- **Components**: 
  - `HelpdeskComponent` - Main container
  - `CreateTicketComponent` - Ticket creation form
  - `TicketListComponent` - Ticket listing and filtering
  - `TicketDetailComponent` - Ticket timeline and replies

### API Integration
- **Webhook URL**: `https://helpdesk-adapter.scc.kit.edu/webhook/c22d4068-5112-4a1e-bb81-7abc12726fc6`
- **Group**: All tickets are assigned to "EPOT" group
- **User Creation**: Automatic user creation if not exists in Zammad

### Data Models
```typescript
interface CreateTicketRequest {
  title: string;
  customer: string;
  article: {
    body: string;
  };
}

interface HelpdeskTicketResponse {
  id: string;
  title: string;
  group: string;
  customer: string;
  status: string;
  created_at: string;
  updated_at: string;
  articles: HelpdeskArticle[];
}
```

## Navigation

The helpdesk is accessible through:
- **Main Navigation**: "For Providers" → "Helpdesk" (when logged in)
- **Direct URL**: `/helpdesk`

## Routing Structure

```
/helpdesk
├── /tickets (default) - List all tickets
├── /create - Create new ticket
└── /ticket/:id - View ticket details
```

## Styling

The interface uses:
- Modern gradient backgrounds
- Card-based layouts
- Responsive design
- Status color coding
- Timeline visualization
- Consistent with existing EOSC Beyond design

## Security

- Authentication guard protection
- User-specific ticket access
- Form validation
- Error handling

## Future Enhancements

1. **File Attachments**: Support for uploading screenshots or documents
2. **Ticket Categories**: Predefined categories for better organization
3. **Email Notifications**: Notify users of ticket updates
4. **Search Functionality**: Search through ticket history
5. **Ticket Templates**: Predefined templates for common issues

## Dependencies

- Angular Reactive Forms
- Angular Router
- HTTP Client for API calls
- Existing Authentication Service
- Font Awesome for icons

## Testing

The helpdesk functionality should be tested for:
- Ticket creation with various inputs
- Error handling scenarios
- Authentication integration
- Responsive design on different screen sizes
- Form validation
- API communication 