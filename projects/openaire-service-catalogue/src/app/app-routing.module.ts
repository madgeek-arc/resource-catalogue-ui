import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {SearchAireComponent} from './pages/search/search.aire.component';
import {ServiceLandingPageExtendedComponent} from './pages/landingpages/service/service-landing-page-extended.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/search',
    pathMatch: 'full'
  },
  {
    path: 'search',
    component: SearchAireComponent,
    data: {
      breadcrumb: 'Home'
    }
  },
  {
    path: 'service/:id',
    component: ServiceLandingPageExtendedComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule {
}
