import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeCatrisComponent } from './pages/home/home-catris.component';
import { ServiceLandingPageExtendedComponent } from './pages/landingpages/service/service-landing-page.extended.component';
import { SearchExtendedComponent } from './pages/search/search.extended.component';
import {CompareServicesComponent} from '../../../../src/app/pages/compare/compare-services.component';
import {CompareServicesExtendedComponent} from './pages/compare/compare-services.extended.component';

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
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
