import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CanActivateViaAuthGuard} from '../../../../services/can-activate-auth-guard.service';
import {ServiceStatsComponent} from './service-stats.component';
import {ServiceHistoryComponent} from './service-history.component';
import {ServiceFullHistoryComponent} from './service-full-history.component';
import {SharedResourceDashboardComponent} from './shared-resource-dashboard.component';
import {environment} from '../../../../../environments/environment';

const sharedResourceDashboardRoutes: Routes = [
  {
    path: ':resourceId',
    component: SharedResourceDashboardComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Shared ' + environment.serviceORresource + ' Dashboard'
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
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(sharedResourceDashboardRoutes)],
  exports: [RouterModule]
})

export class SharedResourceDashboardRouting {
}
