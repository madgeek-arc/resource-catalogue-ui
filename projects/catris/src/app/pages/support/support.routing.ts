import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {FAQsComponent} from '../../../../../../src/app/pages/support/faqs/faqs.component';
import {PrivacyPolicyComponent} from './privacypolicy/privacy-policy.component';

const supportRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'faqs',
        component: FAQsComponent,
        data: {
          breadcrumb: 'FAQs'
        }
      },
      {
        path: 'privacy-policy',
        component: PrivacyPolicyComponent,
        data: {
          breadcrumb: 'Privacy Policy'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(supportRoutes)],
  exports: [RouterModule]
})

export class SupportRouting {
}
