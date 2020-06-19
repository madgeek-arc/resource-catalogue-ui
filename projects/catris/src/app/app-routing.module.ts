import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeCatrisComponent} from './pages/home/home-catris.component';
import {CanActivateViaAuthGuard} from '../../../../src/app/services/can-activate-auth-guard.service';
import {AddFirstServiceComponent} from '../../../../src/app/pages/serviceProvider/add-first-service.component';
import {ServiceUploadComponent} from '../../../../src/app/pages/eInfraServices/service-upload.component';
import {ServiceEditComponent} from '../../../../src/app/pages/eInfraServices/service-edit.component';
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
