import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CanActivateViaAuthGuard } from '../../../lib/services/can-activate-auth-guard.service';

import { HelpdeskComponent } from './helpdesk.component';
import { CreateTicketComponent } from './create-ticket/create-ticket.component';
import { TicketListComponent } from './ticket-list/ticket-list.component';
import { TicketDetailComponent } from './ticket-detail/ticket-detail.component';

const routes: Routes = [
  {
    path: '',
    component: HelpdeskComponent,
    canActivate: [CanActivateViaAuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'create',
        pathMatch: 'full'
      },
      {
        path: 'tickets',
        component: TicketListComponent,
        data: {
          breadcrumb: 'My Tickets'
        }
      },
      {
        path: 'create',
        component: CreateTicketComponent,
        data: {
          breadcrumb: 'Create Ticket'
        }
      },
      {
        path: 'ticket/:id',
        component: TicketDetailComponent,
        data: {
          breadcrumb: 'Ticket Details'
        }
      }
    ],
    data: {
      breadcrumb: 'Helpdesk'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HelpdeskRoutingModule { } 