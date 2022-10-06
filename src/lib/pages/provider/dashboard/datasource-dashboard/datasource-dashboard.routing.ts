import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CanActivateViaAuthGuard} from '../../../../services/can-activate-auth-guard.service';
import {DatasourceStatsComponent} from './datasource-stats.component';
import {DatasourceHistoryComponent} from './datasource-history.component';
import {DatasourceFullHistoryComponent} from './datasource-full-history.component';
import {DatasourceDashboardComponent} from './datasource-dashboard.component';

const datasourceDashboardRoutes: Routes = [
  {
    path: ':datasourceId',
    component: DatasourceDashboardComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Datasource Dashboard'
    },
    children : [
      {
        path: '',
        redirectTo: 'stats',
        pathMatch: 'full',
        // data: {
        //   breadcrumb: 'Statistics'
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
  imports: [RouterModule.forChild(datasourceDashboardRoutes)],
  exports: [RouterModule]
})

export class DatasourceDashboardRouting {
}
