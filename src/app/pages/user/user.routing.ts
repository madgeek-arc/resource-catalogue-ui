import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CanActivateViaAuthGuard} from '../../services/can-activate-auth-guard.service';
import {DashboardComponent} from './dashboard/dashboard.component';
import {ServiceDashboardComponent} from './dashboard/service-dashboard.component';

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
