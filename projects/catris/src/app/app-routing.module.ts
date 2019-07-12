import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeCatrisComponent } from './pages/home/home-catris.component';
import { ServiceLandingPageExtendedComponent } from './pages/landingpages/service/service-landing-page.extended.component';
import { SearchExtendedComponent } from './pages/search/search.extended.component';

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
  // {
  //   path: 'becomeAProvider',
  //   component: BecomeAProviderComponent,
  //   data: {
  //     breadcrumb : 'Become A Provider'
  //   }
  // },
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
