import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CommonModule} from '@angular/common';
import {CanActivateViaAuthGuard} from '../lib/services/can-activate-auth-guard.service';
import {ProvidersStatsComponent} from '../lib/pages/stats/providers-stats.component';
import {ResourcesStatsComponent} from '../lib/pages/stats/resources-stats.component';
import {ForbiddenPageComponent} from '../lib/shared/forbidden-page/forbidden-page.component';
import {NotFoundPageComponent} from '../lib/shared/not-found-page/not-found-page.component';
import {DevelopersComponent} from '../lib/pages/support/developers/developers.component';
import {OpenAPIComponent} from '../lib/pages/support/openapi/openapi.component';
import {BecomeAProviderComponent} from './pages/serviceprovider/become-a-provider.component';
import {VocabularyRequestsComponent} from '../lib/pages/admin/vocabulary-requests.component';
import {HomeComponent} from './pages/home/home.component';
import {ComingSoonPageComponent} from "../lib/shared/coming-soon-page/coming-soon-page.component";

const appRoutes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent,
    // canActivate: [CanActivateViaAuthGuard],
    // redirectTo: 'becomeAProvider',
    // pathMatch: 'full'
  },
  {
    path: 'becomeAProvider',
    component: BecomeAProviderComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Become A Provider'
    }
  },
  {
    path: 'stats/providers',
    component: ProvidersStatsComponent,
    canActivate: [CanActivateViaAuthGuard],
    pathMatch: 'full',
    data: {
      breadcrumb: 'Providers Statistics'
    }
  },
  {
    path: 'stats/resources',
    component: ResourcesStatsComponent,
    canActivate: [CanActivateViaAuthGuard],
    pathMatch: 'full',
    data: {
      breadcrumb: 'Resources Statistics'
    }
  },
  {
    path: 'provider',
    loadChildren: () => import('../lib/pages/provider/provider.module').then(m => m.ProviderModule),
    canActivate: [CanActivateViaAuthGuard]
  },
  {
    path: 'catalogue',
    loadChildren: () => import('../lib/pages/catalogue/catalogue.module').then(m => m.CatalogueModule),
    canActivate: [CanActivateViaAuthGuard]
  },
  {
    path: 'datasource',
    loadChildren: () => import('../lib/pages/datasource/datasource.module').then(m => m.DatasourceModule),
    canActivate: [CanActivateViaAuthGuard]
  },
  {
    path: 'dashboard/:catalogueId/:providerId/resource-dashboard',
    loadChildren: () => import('../lib/pages/provider/dashboard/resource-dashboard/resource-dashboard.module').then(m => m.ResourceDashboardModule),
    canActivate: [CanActivateViaAuthGuard]
  },
  {
    path: 'dashboard/:catalogueId/:providerId/shared-resource-dashboard',
    loadChildren: () => import('../lib/pages/provider/dashboard/resource-dashboard/shared-resource-dashboard.module').then(m => m.SharedResourceDashboardModule),
    canActivate: [CanActivateViaAuthGuard]
  },
  {
    path: 'dashboard/:catalogueId/:providerId/training-resource-dashboard',
    loadChildren: () => import('../lib/pages/provider/dashboard/training-resource-dashboard/training-resource-dashboard.module').then(m => m.TrainingResourceDashboardModule),
    canActivate: [CanActivateViaAuthGuard]
  },
  {
    path: 'dashboard/:catalogueId',
    loadChildren: () => import('../lib/pages/provider/dashboard/provider-dashboard.module').then(m => m.ProviderDashboardModule),
    canActivate: [CanActivateViaAuthGuard]
  },
  {
    path: 'catalogue-dashboard',
    loadChildren: () => import('../lib/pages/catalogue/dashboard/catalogue-dashboard.module').then(m => m.CatalogueDashboardModule),
    canActivate: [CanActivateViaAuthGuard]
  },
  {
    path: 'guidelines',
    loadChildren: () => import('../lib/pages/guidelines/guidelines.module').then(m => m.GuidelinesModule),
    canActivate: [CanActivateViaAuthGuard]
  },
  {
    path: 'vocabulary-requests',
    component: VocabularyRequestsComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Vocabulary Requests'
    }
  },
  {
    path: 'developers',
    component: DevelopersComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Developers'
    }
  },
  {
    path: 'openapi',
    component: OpenAPIComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Open API'
    }
  },
  {
    path: 'assets/files/:fileName',
    children: [ ]
  },
  {
    path: 'forbidden',
    component: ForbiddenPageComponent,
    data: {
      breadcrumb: 'Forbidden'
    }
  },
  {
    path: 'notFound',
    component: NotFoundPageComponent,
    data: {
      breadcrumb: 'Not Found'
    }
  },
  {
    path: 'comingSoon',
    component: ComingSoonPageComponent,
    data: {
      breadcrumb: 'Coming Soon'
    }
  },
  {
    path: '**',
    redirectTo: 'notFound',
    pathMatch: 'full',
    data: {
      breadcrumb: 'Not Found'
    }
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(appRoutes, {})
  ],
  declarations: [],
  exports: [RouterModule]
})

export class AppRoutingModule {
}
