import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CanActivateViaAuthGuard} from '../../../../services/can-activate-auth-guard.service';
import {DatasourceStatsComponent} from './datasource-stats.component';
import {DatasourceHistoryComponent} from './datasource-history.component';
import {DatasourceFullHistoryComponent} from './datasource-full-history.component';
import {SharedDatasourceDashboardComponent} from './shared-datasource-dashboard.component';

const sharedResourceDashboardRoutes: Routes = [
  {
    path: ':resourceId',
    component: SharedDatasourceDashboardComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Shared Datasource Dashboard'
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
        component: DatasourceStatsComponent
      },
      {
        path: 'history',
        component: DatasourceHistoryComponent
      },
      {
        path: 'fullHistory',
        component: DatasourceFullHistoryComponent
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(sharedResourceDashboardRoutes)],
  exports: [RouterModule]
})

export class SharedDatasourceDashboardRouting {
}
