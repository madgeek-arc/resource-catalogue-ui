import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CommonModule} from '@angular/common';
import {CanActivateViaAuthGuard} from '../lib/services/can-activate-auth-guard.service';
import {ServiceLandingPageComponent} from '../lib/pages/landingpages/service/service-landing-page.component';
import {ProvidersStatsComponent} from '../lib/pages/stats/providers-stats.component';
import {ResourcesStatsComponent} from '../lib/pages/stats/resources-stats.component';
import {ForbiddenPageComponent} from '../lib/shared/forbidden-page/forbidden-page.component';
import {NotFoundPageComponent} from '../lib/shared/not-found-page/not-found-page.component';
import {DevelopersComponent} from '../lib/pages/support/developers/developers.component';
import {OpenAPIComponent} from '../lib/pages/support/openapi/openapi.component';
import {BecomeAProviderComponent} from './pages/serviceprovider/become-a-provider.component';
import {VocabularyRequestsComponent} from '../lib/pages/admin/vocabulary-requests.component';
import {HomeComponent} from './pages/home/home.component';

const appRoutes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent,
    // redirectTo: 'becomeAProvider',
    // pathMatch: 'full'
  },
  {
    path: 'becomeAProvider',
    component: BecomeAProviderComponent,
    data: {
      breadcrumb: 'Become A Provider'
    }
  },
  {
    path: 'stats/providers',
    component: ProvidersStatsComponent,
    pathMatch: 'full',
    data: {
      breadcrumb: 'Providers Statistics'
    }
  },
  {
    path: 'stats/resources',
    component: ResourcesStatsComponent,
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
    path: 'dashboard/:providerId/resource-dashboard',
    loadChildren: () => import('../lib/pages/provider/dashboard/resource-dashboard/resource-dashboard.module').then(m => m.ResourceDashboardModule),
    canActivate: [CanActivateViaAuthGuard]
  },
  {
    path: 'dashboard/:providerId/shared-resource-dashboard',
    loadChildren: () => import('../lib/pages/provider/dashboard/resource-dashboard/shared-resource-dashboard.module').then(m => m.SharedResourceDashboardModule),
    canActivate: [CanActivateViaAuthGuard]
  },
  {
    path: 'dashboard',
    loadChildren: () => import('../lib/pages/provider/dashboard/provider-dashboard.module').then(m => m.ProviderDashboardModule),
    canActivate: [CanActivateViaAuthGuard]
  },
  {
    path: 'service/:id',
    component: ServiceLandingPageComponent,
    data: {
      breadcrumb: 'Service'
    }
  },
  {
    path: 'service/:id/:version',
    component: ServiceLandingPageComponent,
    data: {
      breadcrumb: 'Service'
    }
  },
  {
    path: 'vocabulary-requests',
    component: VocabularyRequestsComponent,
    data: {
      breadcrumb: 'Vocabulary Requests'
    }
  },
  {
    path: 'developers',
    component: DevelopersComponent,
    data: {
      breadcrumb: 'Developers'
    }
  },
  {
    path: 'openapi',
    component: OpenAPIComponent,
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
    RouterModule.forRoot(appRoutes, { relativeLinkResolution: 'legacy' })
  ],
  declarations: [],
  exports: [RouterModule]
})

export class AppRoutingModule {
}
