/**
 * Created by stefania on 6/7/17.
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

import {SupportRouting} from './support.routing';
import {ReusableComponentsModule} from '../../../../../../src/app/shared/reusablecomponents/reusable-components.module';
import {SharedModule} from '../../../../../../src/app/shared/shared.module';
import {DevelopersComponent} from '../../../../../../src/app/pages/support/developers/developers.component';
import {FAQsComponent} from '../../../../../../src/app/pages/support/faqs/faqs.component';
import {OpenAPIComponent} from '../../../../../../src/app/pages/support/openapi/openapi.component';
import {FAQService} from '../../../../../../src/app/services/faq.service';
import {PrivacyPolicyComponent} from './privacypolicy/privacy-policy.component';

@NgModule({
  imports: [
    CommonModule,
    SupportRouting,
    ReusableComponentsModule,
    SharedModule,
  ],
  declarations: [
    DevelopersComponent,
    FAQsComponent,
    OpenAPIComponent,
    PrivacyPolicyComponent
  ],
  providers: [
    FAQService
  ]
})
export class SupportModule {
}
