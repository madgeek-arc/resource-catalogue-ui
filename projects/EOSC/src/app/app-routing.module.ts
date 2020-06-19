import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {BecomeAProviderComponent} from './pages/serviceprovider/become-a-provider.component';
import {HomeEoscComponent} from './pages/home/home-eosc.component';
import {SearchComponent} from '../../../../src/app/pages/search/search.component';
import {ServiceLandingPageComponent} from '../../../../src/app/pages/landingpages/service/service-landing-page.component';


const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeEoscComponent,
    data: {
      breadcrumb: 'Home'
    }
  },
  {
    path: 'becomeAProvider',
    component: BecomeAProviderComponent,
    data: {
      breadcrumb: 'Become A Provider'
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
    path: 'service/:id/:version',
    component: ServiceLandingPageComponent,
    data: {
      breadcrumb: 'Service'
    }
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
