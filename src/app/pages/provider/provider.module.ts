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


@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ProviderRouting,
    ReusableComponentsModule,
    ChartModule,

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
  ]
})

export class ProviderModule {
}
