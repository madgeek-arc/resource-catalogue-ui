import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

import {CatrisSupportRoutingModule} from './catris-support-routing.module';
import {PrivacyPolicyComponent} from './privacypolicy/privacy-policy.component';
import {SupportModule} from '../../../../../../src/app/pages/support/support.module';

@NgModule({
  imports: [
    CommonModule,
    SupportModule,
    CatrisSupportRoutingModule,
  ],
  declarations: [
    PrivacyPolicyComponent
  ],
  providers: []
})
export class CatrisSupportModule {
}
