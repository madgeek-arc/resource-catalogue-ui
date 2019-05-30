import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {SearchAireComponent} from './pages/search/search.aire.component';
import {ServiceLandingPageExtendedComponent} from './pages/landingpages/service/service-landing-page-extended.component';
import {CanActivateViaAuthGuard} from '../../../../src/app/services/can-activate-auth-guard.service';
import {ServiceUploadComponent} from '../../../../src/app/pages/eInfraServices/service-upload.component';
import {ServiceEditComponent} from '../../../../src/app/pages/eInfraServices/service-edit.component';

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
    component: ServiceUploadComponent,
    canActivate: [CanActivateViaAuthGuard]
  },
  {
    path: 'edit/:id',
    component: ServiceEditComponent,
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
