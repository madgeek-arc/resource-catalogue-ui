import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {BecomeAProviderComponent} from './pages/serviceprovider/become-a-provider.component';
import {HomeEoscComponent} from './pages/home/home-eosc.component';
import {SearchComponent} from '../../../../src/app/pages/search/search.component';
import {ServiceLandingPageComponent} from '../../../../src/app/pages/landingpages/service/service-landing-page.component';
import {UpdateServiceProviderComponent} from '../../../../src/app/pages/serviceProvider/update-service-provider.component';
import {CanActivateViaAuthGuard} from '../../../../src/app/services/can-activate-auth-guard.service';
import {AddFirstServiceComponent} from '../../../../src/app/pages/serviceProvider/add-first-service.component';
import {ServiceProviderInfoComponent} from '../../../../src/app/pages/serviceProvider/service-provider-info.component';
import {ServiceUploadComponent} from '../../../../src/app/pages/eInfraServices/service-upload.component';
import {ServiceEditComponent} from '../../../../src/app/pages/eInfraServices/service-edit.component';
import {MyServiceProvidersComponent} from '../../../../src/app/pages/serviceProvider/my-service-providers.component';
import {ServiceProvidersListComponent} from '../../../../src/app/pages/admin/service-providers-list.component';
import {DashboardComponent} from '../../../../src/app/pages/user/dashboard/dashboard.component';
import {ServiceDashboardComponent} from '../../../../src/app/pages/user/dashboard/service-dashboard.component';
import {DevelopersComponent} from '../../../../src/app/pages/support/developers/developers.component';
import {OpenAPIComponent} from '../../../../src/app/pages/support/openapi/openapi.component';
import {ServiceProviderFormComponent} from '../../../../src/app/pages/serviceProvider/service-provider-form.component';
import {ServicesComponent} from '../../../../src/app/pages/user/dashboard/services/services.component';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'becomeAProvider',
    pathMatch: 'full'
  },
  // {
  //   path: 'home',
  //   component: HomeEoscComponent,
  //   data: {
  //     breadcrumb: 'Home'
  //   }
  // },
  // {
  //   path: 'search',
  //   component: SearchComponent,
  //   data: {
  //     breadcrumb: 'Search'
  //   }
  // },
  {
    path: 'becomeAProvider',
    component: BecomeAProviderComponent,
    data: {
      breadcrumb: 'Become A Provider'
    }
  },
  {
    path: 'newServiceProvider',
    component: ServiceProviderFormComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'New Service Provider'
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
    path: 'serviceProviderInfo/:id',
    component: ServiceProviderInfoComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Service Provider Info'
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
    path: 'editPendingService/:id',
    component: ServiceEditComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Edit Pending Service'
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
    path: 'myServiceProviders',
    component: MyServiceProvidersComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'My Service Providers'
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
  // {
  //   path: '**',
  //   redirectTo: 'becomeAProvider',
  //   pathMatch: 'full'
  // },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
