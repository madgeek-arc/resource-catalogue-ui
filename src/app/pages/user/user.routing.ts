import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CanActivateViaAuthGuard} from '../../services/can-activate-auth-guard.service';
import {DashboardComponent} from './dashboard/dashboard.component';
import {ServiceDashboardComponent} from './dashboard/service-dashboard.component';
import {MessagesComponent} from './dashboard/messages/messages.component';
import {ProviderStatsComponent} from './dashboard/providerStats/provider-stats.component';
import {ServicesComponent} from './dashboard/services/services.component';

const userRoutes: Routes = [
  // {
  //   path: 'dashboard',
  //   component: DashboardComponent,
  //   canActivate: [CanActivateViaAuthGuard]
  // },
  {
    path: 'dashboard/:provider',
    component: DashboardComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Provider dashboard'
    },
    children : [
      {path: '', redirectTo: 'stats', pathMatch: 'full'},
      {path: 'stats', component: ProviderStatsComponent},
      {path: 'activeServices', component: ServicesComponent},
      {path: 'pendingServices', component: ServicesComponent},
      {path: 'messages', component: MessagesComponent}
    ]
  },
  // {
  //   path: 'dashboard/:provider/stats',
  //   component: ProviderStatsComponent,
  //   canActivate: [CanActivateViaAuthGuard],
  //   data: {
  //     breadcrumb: 'Provider statistics'
  //   }
  // },
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
