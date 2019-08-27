import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeCatrisComponent } from './pages/home/home-catris.component';
import { ServiceLandingPageExtendedComponent } from './pages/landingpages/service/service-landing-page.extended.component';
import { SearchExtendedComponent } from './pages/search/search.extended.component';
import {CompareServicesExtendedComponent} from './pages/compare/compare-services.extended.component';
import {CanActivateViaAuthGuard} from '../../../../src/app/services/can-activate-auth-guard.service';
import {ServiceUploadExtendedComponent} from './pages/catrisService/service-upload-extended.component';
import {ServiceEditExtendedComponent} from './pages/catrisService/service-edit-extended.component';

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
    component: SearchExtendedComponent,
    data: {
      breadcrumb : 'Search'
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
    path: 'compare',
    component: CompareServicesExtendedComponent,
    data: {
      breadcrumb: 'Compare'
    }
  },
  {
    path: 'upload',
    component: ServiceUploadExtendedComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Upload'
    }
  },
  {
    path: 'edit/:id',
    component: ServiceEditExtendedComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Edit'
    }
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
