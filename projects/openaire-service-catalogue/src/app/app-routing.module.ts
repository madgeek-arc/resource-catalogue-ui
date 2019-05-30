import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {SearchAireComponent} from './pages/search/search.aire.component';
import {ServiceLandingPageExtendedComponent} from './pages/landingpages/service/service-landing-page-extended.component';
import {CanActivateViaAuthGuard} from '../../../../src/app/services/can-activate-auth-guard.service';
import {ServiceUploadExtendedComponent} from './pages/eInfraServices/service-upload-extended.component';
import {ServiceEditExtendedComponent} from './pages/eInfraServices/service-edit-extended.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/search',
    pathMatch: 'full'
  },
  {
    path: 'search',
    component: SearchAireComponent,
  },
  {
    path: 'service/:id',
    component: ServiceLandingPageExtendedComponent
  },
  {
    path: 'upload',
    component: ServiceUploadExtendedComponent,
    canActivate: [CanActivateViaAuthGuard]
  },
  {
    path: 'edit/:id',
    component: ServiceEditExtendedComponent,
    canActivate: [CanActivateViaAuthGuard]
  },
  { path: '**',
    redirectTo: '/search',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule {
}
