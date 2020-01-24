import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CanActivateViaAuthGuard} from '../../services/can-activate-auth-guard.service';
import {DashboardComponent} from './dashboard/dashboard.component';
import {ServiceDashboardComponent} from './dashboard/service-dashboard.component';
import {MessagesComponent} from './dashboard/messages/messages.component';
import {StatsComponent} from './dashboard/providerStats/stats.component';
import {ServicesComponent} from './dashboard/services/services.component';

const userRoutes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [CanActivateViaAuthGuard]
  },
  {
    path: 'dashboard/:provider',
    component: DashboardComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Provider dashboard'
    },
    children : [
      {path: '', redirectTo: 'stats', pathMatch: 'full'},
      {path: 'stats', component: StatsComponent},
      {path: 'activeServices', component: ServicesComponent},
      {path: 'pendingServices', component: ServicesComponent},
      {path: 'messages', component: MessagesComponent}
    ]
  },
  // {
  //   path: 'dashboard/:provider/stats',
  //   component: StatsComponent,
  //   canActivate: [CanActivateViaAuthGuard],
  //   data: {
  //     breadcrumb: 'Provider statistics'
  //   }
  // },
  {
    path: 'messages/:provider',
    component: MessagesComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Provider messages'
    }
  },
  {
    path: 'dashboard/:provider/:id',
    component: ServiceDashboardComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Service dashboard'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(userRoutes)],
  exports: [RouterModule]
})

export class UserRouting {
}
