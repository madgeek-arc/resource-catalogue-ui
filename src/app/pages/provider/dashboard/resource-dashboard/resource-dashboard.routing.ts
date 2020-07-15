import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CanActivateViaAuthGuard} from '../../../../services/can-activate-auth-guard.service';
import {ServiceStatsComponent} from './service-stats.component';
import {ResourceDashboardComponent} from './resource-dashboard.component';

const resourceDashboardRoutes: Routes = [
  {
    path: ':providerId/:resourceId',
    component: ResourceDashboardComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Service dashboard'
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
