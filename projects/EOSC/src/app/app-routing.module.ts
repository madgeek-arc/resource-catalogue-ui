import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BecomeAProviderComponent } from './pages/serviceprovider/become-a-provider.component';
import {SearchExtendedComponent} from './pages/search/search.extended.component';
import {ServiceLandingPageExtendedComponent} from './pages/landingpages/service/service-landing-page.extended.component';
import {HomeEoscComponent} from './pages/home/home-eosc.component';


const routes: Routes = [
  {
    path: '**',
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
  // {
  //   path: 'search',
  //   component: SearchExtendedComponent,
  //   data: {
  //     breadcrumb : 'Search'
  //   }
  // },
  // {
  //   path: 'service/:id',
  //   component: ServiceLandingPageExtendedComponent,
  //   data: {
  //     breadcrumb : 'Service'
  //   }
  // },
  // {
  //   path: 'service/:id/:version',
  //   component: ServiceLandingPageExtendedComponent,
  //   data: {
  //     breadcrumb : 'Service'
  //   }
  // },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
