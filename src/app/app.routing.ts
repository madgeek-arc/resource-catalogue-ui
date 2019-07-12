import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {BrowseCategoriesComponent} from './pages/browsecategories/browse-categories.component';
import {CompareServicesComponent} from './pages/compare/compare-services.component';
import {ServiceUploadComponent} from './pages/eInfraServices/service-upload.component';
import {HomeComponent} from './pages/home/home.component';
import {CommonModule} from '@angular/common';
import {SearchComponent} from './pages/search/search.component';
import {CanActivateViaAuthGuard} from './services/can-activate-auth-guard.service';
import {ServiceLandingPageComponent} from './pages/landingpages/service/service-landing-page.component';
import {NewServiceProviderComponent} from './pages/serviceprovider/new-service-provider.component';
import {ServiceProvidersListComponent} from './pages/admin/service-providers-list.component';
import {AddFirstServiceComponent} from './pages/serviceprovider/add-first-service.component';
import {MyServiceProvidersComponent} from './pages/serviceprovider/my-service-providers.component';
import {UpdateServiceProviderComponent} from './pages/serviceprovider/update-service-provider.component';
import {ServiceProviderInfoComponent} from './pages/serviceprovider/service-provider-info.component';
import {FundersDashboardComponent} from './pages/funders/funders-dashboard.component';
import {MyFavouritesComponent} from './pages/user/favourites/my-favourites.component';
import {ServiceEditComponent} from './pages/eInfraServices/service-edit.component';
import {MeasurementsComponent} from './pages/indicators/measurements.component';
import {IndicatorFromComponent} from './pages/indicators/indicator-from.component';
import {ForbiddenPageComponent} from './shared/forbidden-page/forbidden-page.component';
import {NotFoundPageComponent} from './shared/not-found-page/not-found-page.component';

const appRoutes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent,
    data: {
      breadcrumb: 'Home'
    }
  },
  {
    path: 'search',
    component: SearchComponent,
    data: {
      breadcrumb: 'Search'
    }
  },
  {
    path: 'compare',
    component: CompareServicesComponent,
    data: {
      breadcrumb: 'Compare'
    }
  },
  {
    path: 'browseCategories',
    component: BrowseCategoriesComponent,
    data: {
      breadcrumb: 'Browse'
    }
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
    path: 'upload',
    component: ServiceUploadComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Upload'
    }
  },
  {
    path: 'edit/:id',
    component: ServiceEditComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Edit'
    }
  },
  {
    path: 'newServiceProvider',
    component: NewServiceProviderComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'New Service Provider'
    }
  },
  {
    path: 'serviceProviderInfo/:id',
    component: ServiceProviderInfoComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Service Provider Info'
    }
  },
  {
    path: 'updateServiceProvider/:id',
    component: UpdateServiceProviderComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Update Service Provider'
    }
  },
  {
    path: 'newServiceProvider/:id/addFirstService',
    component: AddFirstServiceComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'First Service Form'
    }
  },
  {
    path: 'newServiceProvider/:id/editFirstService/:serviceId',
    component: AddFirstServiceComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Edit First Service'
    }
  },
  {
    path: 'myServiceProviders',
    component: MyServiceProvidersComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'My Service Providers'
    }
  },
  {
    path: 'myFavourites',
    component: MyFavouritesComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'My Favourites'
    }
  },
  {
    path: 'serviceProvidersList',
    component: ServiceProvidersListComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Service Providers'
    }
  },
  {
    path: 'fundersDashboard',
    component: FundersDashboardComponent,
    data: {
      breadcrumb: 'Funders Dashboard'
    }
  },
  {
    path: 'measurements/service/:id',
    component: MeasurementsComponent,
    data: {
      breadcrumb: 'Service Measurements'
    }
  },
  {
    path: 'newIndicator',
    component: IndicatorFromComponent,
    data: {
      breadcrumb: 'New Indicator'
    }
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
    RouterModule.forRoot(appRoutes)
  ],
  declarations: [],
  exports: [RouterModule]
})

export class AppRoutingModule {
}

// export const appRoutingProviders: any[] = [];
// export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
