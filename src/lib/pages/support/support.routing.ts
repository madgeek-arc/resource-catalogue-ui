import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DevelopersComponent} from './developers/developers.component';
import {FAQsComponent} from './faqs/faqs.component';
import {OpenAPIComponent} from './openapi/openapi.component';
import {AboutComponent} from "./about/about.component";
import {CanActivateViaAuthGuard} from "../../services/can-activate-auth-guard.service";

const supportRoutes: Routes = [
  {
    path: 'support/faqs',
    component: FAQsComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'FAQs'
    }
  },
  {
    path: 'about',
    component: AboutComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'About'
    }
  },
  {
    path: 'developers',
    component: DevelopersComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Developers'
    }
  },
  {
    path: 'openapi',
    component: OpenAPIComponent,
    canActivate: [CanActivateViaAuthGuard],
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
