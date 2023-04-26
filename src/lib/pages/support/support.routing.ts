import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DevelopersComponent} from './developers/developers.component';
import {FAQsComponent} from './faqs/faqs.component';
import {OpenAPIComponent} from './openapi/openapi.component';
import {AboutComponent} from "./about/about.component";

const supportRoutes: Routes = [
  {
    path: 'support/faqs',
    component: FAQsComponent,
    data: {
      breadcrumb: 'FAQs'
    }
  },
  {
    path: 'about',
    component: AboutComponent,
    data: {
      breadcrumb: 'about'
    }
  },
  {
    path: 'developers',
    component: DevelopersComponent,
    data: {
      breadcrumb: 'Developers'
    }
  },
  {
    path: 'openapi',
    component: OpenAPIComponent,
    data: {
      breadcrumb: 'Open API'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(supportRoutes)],
  exports: [RouterModule]
})

export class SupportRouting {
}
