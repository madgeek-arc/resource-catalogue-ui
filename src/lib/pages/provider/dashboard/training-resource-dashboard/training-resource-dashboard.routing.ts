import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CanActivateViaAuthGuard} from '../../../../services/can-activate-auth-guard.service';
import {TrainingResourceStatsComponent} from './training-resource-stats.component';
import {TrainingResourceHistoryComponent} from './training-resource-history.component';
import {TrainingResourceFullHistoryComponent} from './training-resource-full-history.component';
import {TrainingResourceDashboardComponent} from './training-resource-dashboard.component';

const trainingResourceDashboardRoutes: Routes = [
  {
    path: ':training_prefix/:training_suffix',
    component: TrainingResourceDashboardComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Training Resource Dashboard'
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
        component: TrainingResourceStatsComponent
      },
      {
        path: 'history',
        component: TrainingResourceHistoryComponent
      },
      {
        path: 'fullHistory',
        component: TrainingResourceFullHistoryComponent
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(trainingResourceDashboardRoutes)],
  exports: [RouterModule]
})

export class TrainingResourceDashboardRouting {
}
