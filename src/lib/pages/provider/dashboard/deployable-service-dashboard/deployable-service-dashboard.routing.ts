import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CanActivateViaAuthGuard} from '../../../../services/can-activate-auth-guard.service';
import {DeployableServiceHistoryComponent} from './deployable-service-history.component';
import {DeployableServiceFullHistoryComponent} from './deployable-service-full-history.component';
import {DeployableServiceDashboardComponent} from './deployable-service-dashboard.component';

const deployableServiceDashboardRoutes: Routes = [
  {
    path: ':deployableServiceId',
    component: DeployableServiceDashboardComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Deployable Service Dashboard'
    },
    children : [
      {
        path: '',
        redirectTo: 'history',
        pathMatch: 'full',
        // data: {
        //   breadcrumb: 'Statistics'
        // }
      },
      {
        path: 'history',
        component: DeployableServiceHistoryComponent
      },
      {
        path: 'fullHistory',
        component: DeployableServiceFullHistoryComponent
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(deployableServiceDashboardRoutes)],
  exports: [RouterModule]
})

export class DeployableServiceDashboardRouting {
}
