import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SearchAireComponent} from './pages/search/search.aire.component';
import {CanActivateViaAuthGuard} from '../../../../src/app/services/can-activate-auth-guard.service';
import {ServiceEditComponent} from '../../../../src/app/pages/provider-resources/service-edit.component';
import {ServiceUploadComponent} from '../../../../src/app/pages/provider-resources/service-upload.component';
import {ServiceLandingPageComponent} from '../../../../src/app/pages/landingpages/service/service-landing-page.component';

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
    component: ServiceLandingPageComponent
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
  {
    path: '**',
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
