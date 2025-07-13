import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { HelpdeskComponent } from './helpdesk.component';
import { CreateTicketComponent } from './create-ticket/create-ticket.component';
import { TicketListComponent } from './ticket-list/ticket-list.component';
import { TicketDetailComponent } from './ticket-detail/ticket-detail.component';
import { HelpdeskRoutingModule } from './helpdesk-routing.module';
import { HelpdeskService } from '../../services/helpdesk.service';

@NgModule({
  declarations: [
    HelpdeskComponent,
    CreateTicketComponent,
    TicketListComponent,
    TicketDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    HelpdeskRoutingModule
  ],
  providers: [
    HelpdeskService
  ]
})
export class HelpdeskModule { } 