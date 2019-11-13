import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BecomeAProviderComponent } from './pages/serviceprovider/become-a-provider.component';
import {SearchExtendedComponent} from './pages/search/search.extended.component';
import {ServiceLandingPageExtendedComponent} from './pages/landingpages/service/service-landing-page.extended.component';
import {HomeEoscComponent} from './pages/home/home-eosc.component';
import {MyServiceProvidersComponent} from '../../../../src/app/pages/serviceprovider/my-service-providers.component';
import {CanActivateViaAuthGuard} from '../../../../src/app/services/can-activate-auth-guard.service';
import {ServiceProvidersListComponent} from '../../../../src/app/pages/admin/service-providers-list.component';
import {OpenAPIComponent} from '../../../../src/app/pages/support/openapi/openapi.component';
import {DevelopersComponent} from '../../../../src/app/pages/support/developers/developers.component';
import {NewServiceProviderComponent} from '../../../../src/app/pages/serviceprovider/new-service-provider.component';
import {AddFirstServiceComponent} from '../../../../src/app/pages/serviceprovider/add-first-service.component';
import {ServiceLandingPageComponent} from '../../../../src/app/pages/landingpages/service/service-landing-page.component';
import {ServiceEditComponent} from '../../../../src/app/pages/eInfraServices/service-edit.component';
import {UpdateServiceProviderComponent} from '../../../../src/app/pages/serviceprovider/update-service-provider.component';
import {DashboardComponent} from '../../../../src/app/pages/user/dashboard/dashboard.component';
import {ServiceDashboardComponent} from '../../../../src/app/pages/user/dashboard/service-dashboard.component';
import {ServiceUploadComponent} from '../../../../src/app/pages/eInfraServices/service-upload.component';


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
  {
    path: 'becomeAProvider',
    component: BecomeAProviderComponent,
    data: {
      breadcrumb : 'Become A Provider'
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
    path: 'service/:id',
    component: ServiceLandingPageExtendedComponent,
    data: {
      breadcrumb : 'Service'
    }
  },
  {
    path: 'service/:id/:version',
    component: ServiceLandingPageExtendedComponent,
    data: {
      breadcrumb : 'Service'
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
    path: 'dashboard/:provider',
    component: DashboardComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Provider dashboard'
    }
  },
  {
    path: 'dashboard/:provider/:id',
    component: ServiceDashboardComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Service dashboard'
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
  //   path: 'search',
  //   component: SearchExtendedComponent,
  //   data: {
  //     breadcrumb : 'Search'
  //   }
  // },
  {
    path: '**',
    redirectTo: 'becomeAProvider',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
