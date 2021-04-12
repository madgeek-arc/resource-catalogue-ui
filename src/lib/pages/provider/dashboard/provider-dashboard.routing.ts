import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DashboardComponent} from './dashboard.component';
import {CanActivateViaAuthGuard} from '../../../services/can-activate-auth-guard.service';
import {ProviderStatsComponent} from './providerStats/provider-stats.component';
import {ProviderInfoComponent} from './providerInfo/provider-info.component';
import {ServicesComponent} from './services/services.component';
import {PendingServicesComponent} from './pendingservices/pending-services.component';
import {MessagesComponent} from './messages/messages.component';
import {ServiceStatsComponent} from './resource-dashboard/service-stats.component';
import {ResourceDashboardModule} from './resource-dashboard/resource-dashboard.module';
import {ProviderHistoryComponent} from './providerHistory/provider-history.component';
import {ProviderFullHistoryComponent} from './providerHistory/provider-full-history.component';

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
        redirectTo: 'stats',
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
        component: ProviderHistoryComponent
      },
      {
        path: 'fullHistory',
        component: ProviderFullHistoryComponent
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
        path: 'draft-resources',
        component: PendingServicesComponent,
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
      // fixme den mou kanoun edw giati den thelw na exoun dashboard route
      // {
      //   path: 'resource/add',
      //   component: ServiceUploadComponent
      // },
      // {
      //   path: 'resource/update/:resourceId',
      //   component: ServiceEditComponent
      // },
      // {
      //   path: 'resource/dashboard/:resourceId',
      //   redirectTo: 'resource/dashboard/:resourceId/stats',
      // },
      // {
      //   path: 'resource/dashboard/:resourceId/stats',
      //   component: ServiceStatsComponent,
      //   data: {
      //     isResource: true
      //   }
      // },
      // fixme do it with lazy loading?
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
