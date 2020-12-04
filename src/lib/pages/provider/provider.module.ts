import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ChartModule} from 'angular2-highcharts';
import {SharedModule} from '../../shared/shared.module';
import {ProviderRouting} from './provider.routing';
import {ReusableComponentsModule} from '../../shared/reusablecomponents/reusable-components.module';
import {MyServiceProvidersComponent} from './my-service-providers.component';
import {AddFirstServiceComponent} from './add-first-service.component';
import {ServiceProviderFormComponent} from './service-provider-form.component';
import {ServiceProviderInfoComponent} from './service-provider-info.component';
import {UpdateServiceProviderComponent} from './update-service-provider.component';
import {ServiceProvidersListComponent} from '../admin/service-providers-list.component';
import {ServiceEditComponent} from '../provider-resources/service-edit.component';
import {ServiceUploadComponent} from '../provider-resources/service-upload.component';
import {ServiceFormComponent} from '../provider-resources/service-form.component';
import { ProviderFormToPdfComponent } from './provider-form-to-pdf/provider-form-to-pdf.component';
import { ResourceFormToPdfComponent } from '../provider-resources/resource-form-to-pdf/resource-form-to-pdf.component';
import {NgSelectModule} from '@ng-select/ng-select';


@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ProviderRouting,
    ReusableComponentsModule,
    ChartModule,
    NgSelectModule,

  ],
  declarations: [
    MyServiceProvidersComponent,
    AddFirstServiceComponent,
    ServiceProviderFormComponent,
    ServiceProviderInfoComponent,
    UpdateServiceProviderComponent,
    ServiceProvidersListComponent,
    // FORMS
    ServiceEditComponent,
    ServiceFormComponent,
    ServiceUploadComponent,
    ProviderFormToPdfComponent,
    ResourceFormToPdfComponent
  ]
})

export class ProviderModule {
}
