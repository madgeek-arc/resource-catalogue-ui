import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CanActivateViaAuthGuard} from '../../../../services/can-activate-auth-guard.service';
import {ServiceStatsComponent} from './service-stats.component';
import {ServiceHistoryComponent} from './service-history.component';
import {ServiceFullHistoryComponent} from './service-full-history.component';
import {ResourceDashboardComponent} from './resource-dashboard.component';
import {environment} from '../../../../../environments/environment';
import {MonitoringInfoComponent} from "./monitoring-info.component";
import {ResourceGuidelinesFormComponent} from "../../../provider-resources/resource-guidelines/resource-guidelines-form.component";
import {ConfigurationTemplatesComponent} from "./configuration-templates.component";
import {ServiceAccountingStatsComponent} from "./service-accounting-stats.component";

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
        redirectTo: 'history',
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
      },
      {
        path: 'accountingStats',
        component: ServiceAccountingStatsComponent
      },
      {
        path: 'assignGuidelines',
        component: ResourceGuidelinesFormComponent

      },
      {
        path: 'templatesForGuideline/:guidelineId',
        component: ConfigurationTemplatesComponent
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
