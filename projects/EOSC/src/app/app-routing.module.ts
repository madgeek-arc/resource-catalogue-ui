import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {BecomeAProviderComponent} from './pages/serviceprovider/become-a-provider.component';
import {DevelopersComponent} from '../../../../src/app/pages/support/developers/developers.component';
import {OpenAPIComponent} from '../../../../src/app/pages/support/openapi/openapi.component';
import {CanActivateViaAuthGuard} from '../../../../src/app/services/can-activate-auth-guard.service';


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
  // {
  //   path: 'provider',
  //   loadChildren: '../../../../src/app/pages/provider/provider.module#ProviderModule',
  //   canActivate: [CanActivateViaAuthGuard]
  // },
  // {
  //   path: 'dashboard',
  //   loadChildren: '../../../../src/app/pages/provider/dashboard/provider-dashboard.module#ProviderDashboardModule',
  //   canActivate: [CanActivateViaAuthGuard]
  // },
  // {
  //   path: 'resource-dashboard',
  //   loadChildren: '../../../../src/app/pages/provider/dashboard/resource-dashboard/resource-dashboard.module#ResourceDashboardModule',
  //   canActivate: [CanActivateViaAuthGuard]
  // },

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
