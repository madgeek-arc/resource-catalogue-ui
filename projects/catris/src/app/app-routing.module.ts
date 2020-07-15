import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeCatrisComponent} from './pages/home/home-catris.component';
import {CanActivateViaAuthGuard} from '../../../../src/app/services/can-activate-auth-guard.service';
import {BrowseCategoriesComponent} from '../../../../src/app/pages/browsecategories/browse-categories.component';
import {SearchComponent} from '../../../../src/app/pages/search/search.component';
import {ServiceLandingPageComponent} from '../../../../src/app/pages/landingpages/service/service-landing-page.component';
import {CompareServicesComponent} from '../../../../src/app/pages/compare/compare-services.component';


const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeCatrisComponent,
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
    path: 'service/:id',
    component: ServiceLandingPageComponent,
    data: {
      breadcrumb: 'Service'
    }
  },
  {
    path: 'compare',
    component: CompareServicesComponent,
    data: {
      breadcrumb: 'Compare'
    }
  },
  // {
  //   path: 'provider',
  //   // loadChildren: '../../../../src/app/pages/provider/provider.module#ProviderModule',
  //   loadChildren: '#ProviderModule',
  //   canActivate: [CanActivateViaAuthGuard]
  // },
  // {
  //   path: 'dashboard',
  //   // loadChildren: '../../../../src/app/pages/provider/dashboard/provider-dashboard.module#ProviderDashboardModule',
  //   loadChildren: '#ProviderDashboardModule',
  //   canActivate: [CanActivateViaAuthGuard]
  // },
  // {
  //   path: 'resource-dashboard',
  //   // loadChildren: '../../../../src/app/pages/provider/dashboard/resource-dashboard/resource-dashboard.module#ResourceDashboardModule',
  //   loadChildren: '#ResourceDashboardModule',
  //   canActivate: [CanActivateViaAuthGuard]
  // },

  {
    path: 'browseSubcategories',
    component: BrowseCategoriesComponent,
    data: {
      breadcrumb: 'Browse Subcategories'
    }
  },
  {
    path: 'support',
    loadChildren: './pages/support/catris-support.module#CatrisSupportModule'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
