import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PrivacyPolicyComponent} from './privacypolicy/privacy-policy.component';

const supportRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadChildren: '../../../../../../src/app/pages/support/support.module#SupportModule'
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

export class CatrisSupportRoutingModule {
}
