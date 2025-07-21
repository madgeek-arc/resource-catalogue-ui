import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DashboardComponent} from './dashboard.component';
import {CanActivateViaAuthGuard} from '../../../services/can-activate-auth-guard.service';
import {ProviderStatsComponent} from './providerStats/provider-stats.component';
import {ProviderInfoComponent} from './providerInfo/provider-info.component';
import {ServicesComponent} from './services/services.component';
import {PendingServicesComponent} from './pendingservices/pending-services.component';
import {SharedServicesComponent} from "./sharedServices/shared-services.component";
import {MessagesComponent} from './messages/messages.component';
import {ServiceStatsComponent} from './resource-dashboard/service-stats.component';
import {ResourceDashboardModule} from './resource-dashboard/resource-dashboard.module';
import {ProviderHistoryComponent} from './providerHistory/provider-history.component';
import {ProviderFullHistoryComponent} from './providerHistory/provider-full-history.component';
import {TrainingResourcesComponent} from "./trainingResources/training-resources.component";
import {GuidelinesComponent} from "./guidelines/guidelines.component";
import {DeployableServicesComponent} from "./deployable-services/deployable-services.component";

const providerDashboardRoutes: Routes = [
  {
    path: ':provider',
    component: DashboardComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Provider dashboard'
      // breadcrumb: 'My Service Providers',
      // link: '/provider/my'
    },
    children : [
      {
        path: '',
        redirectTo: 'history',
        pathMatch: 'full',
        data: {
          isResource: false
        }
      },
      {
        path: 'stats',
        component: ProviderStatsComponent,
        data: {
          isResource: false
        }
      },
      {
        path: 'history',
        component: ProviderHistoryComponent,
        data: {
          isResource: false
        }
      },
      {
        path: 'fullHistory',
        component: ProviderFullHistoryComponent,
        data: {
          isResource: false
        }
      },
      {
        path: 'info',
        component: ProviderInfoComponent,
        data: {
          isResource: false
        }
      },
      {
        path: 'resources',
        component: ServicesComponent,
        data: {
          isResource: false
        }
      },
      {
        path: 'shared-resources',
        component: SharedServicesComponent,
        data: {
          isResource: false
        }
      },
      {
        path: 'draft-resources',
        component: PendingServicesComponent,
        data: {
          isResource: false
        }
      },
      {
        path: 'training-resources',
        component: TrainingResourcesComponent,
        data: {
          isResource: false
        }
      },
      {
        path: 'deployable-services',
        component: DeployableServicesComponent,
        data: {
          isResource: false
        }
      },
      {
        path: 'guidelines',
        component: GuidelinesComponent,
        data: {
          isResource: false
        }
      },
      {
        path: 'messages',
        component: MessagesComponent,
        data: {
          isResource: false
        }
      },
      // do it with lazy loading?
      // {
      //   path: 'resource/dashboard',
      //   loadChildren: './resource-dashboard.module#ResourceDashboardModule',
      //   canActivate: [CanActivateViaAuthGuard],
      // }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(providerDashboardRoutes)],
  exports: [RouterModule]
})

export class ProviderDashboardRouting {
}
