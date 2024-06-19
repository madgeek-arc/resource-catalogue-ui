import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CanActivateViaAuthGuard} from '../../../../services/can-activate-auth-guard.service';
import {ServiceStatsComponent} from './service-stats.component';
import {ServiceHistoryComponent} from './service-history.component';
import {ServiceFullHistoryComponent} from './service-full-history.component';
import {ResourceDashboardComponent} from './resource-dashboard.component';
import {environment} from '../../../../../environments/environment';
import {MonitoringInfoComponent} from "./monitoring-info.component";

const resourceDashboardRoutes: Routes = [
  {
    path: ':resourceId',
    component: ResourceDashboardComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: environment.serviceORresource + ' Dashboard'
      // breadcrumb: 'My Service Providers',
      // link: '/provider/my'
    },
    children : [
      {
        path: '',
        redirectTo: 'stats',
        pathMatch: 'full',
        // data: {
        //   breadcrumb: 'Provider Dashboard'
        // }
      },
      {
        path: 'stats',
        component: ServiceStatsComponent
      },
      {
        path: 'history',
        component: ServiceHistoryComponent
      },
      {
        path: 'fullHistory',
        component: ServiceFullHistoryComponent
      },
      {
        path: 'monitoringInfo',
        component: MonitoringInfoComponent
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(resourceDashboardRoutes)],
  exports: [RouterModule]
})

export class ResourceDashboardRouting {
}
