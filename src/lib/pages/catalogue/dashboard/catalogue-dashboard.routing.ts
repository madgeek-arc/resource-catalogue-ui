import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CanActivateViaAuthGuard} from '../../../services/can-activate-auth-guard.service';
import {CatalogueInfoComponent} from './catalogueInfo/catalogue-info.component';
import {CatalogueDashboardComponent} from "./catalogue-dashboard.component";
import {CatalogueServicesComponent} from "./catalogueServices/catalogue-services.component";
import {CatalogueProvidersComponent} from "./catalogueProviders/catalogue-providers.component";
import {CatalogueTrainingResourcesComponent} from "./catalogueTrainingResources/catalogue-training-resources.component";
import {
  CatalogueDeployableServicesComponent
} from "./catalogueDeployableServices/catalogue-deployable-services.component";
// import {ProviderStatsComponent} from './providerStats/provider-stats.component';
// import {ServiceStatsComponent} from './resource-dashboard/service-stats.component';
// import {ResourceDashboardModule} from './resource-dashboard/resource-dashboard.module';
// import {ProviderHistoryComponent} from './providerHistory/provider-history.component';
// import {ProviderFullHistoryComponent} from './providerHistory/provider-full-history.component';

const catalogueDashboardRoutes: Routes = [
  {
    path: ':catalogue',
    component: CatalogueDashboardComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Catalogue dashboard'
    },
    children : [
      // {
      //   path: '',
      //   redirectTo: 'history',
      //   pathMatch: 'full',
      //   data: {
      //     isResource: false
      //   }
      // },
      // {
      //   path: 'stats',
      //   component: ProviderStatsComponent,
      //   data: {
      //     isResource: false
      //   }
      // },
      // {
      //   path: 'history',
      //   component: ProviderHistoryComponent,
      //   data: {
      //     isResource: false
      //   }
      // },
      // {
      //   path: 'fullHistory',
      //   component: ProviderFullHistoryComponent,
      //   data: {
      //     isResource: false
      //   }
      // },
      {
        path: 'info',
        component: CatalogueInfoComponent,
        data: {
          isResource: false
        }
      },
      {
        path: 'providers',
        component: CatalogueProvidersComponent,
        data: {
          isResource: false
        }
      },
      {
        path: 'services',
        component: CatalogueServicesComponent,
        data: {
          isResource: false
        }
      },
      {
        path: 'training-resources',
        component: CatalogueTrainingResourcesComponent,
        data: {
          isResource: false
        }
      },
      {
        path: 'deployable-services',
        component: CatalogueDeployableServicesComponent,
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
  imports: [RouterModule.forChild(catalogueDashboardRoutes)],
  exports: [RouterModule]
})

export class CatalogueDashboardRouting {
}
