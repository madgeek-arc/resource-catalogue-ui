import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HighchartsChartModule } from 'highcharts-angular';
import {SharedModule} from '../../shared/shared.module';
import {ProviderRouting} from './provider.routing';
import {ReusableComponentsModule} from '../../shared/reusablecomponents/reusable-components.module';
import {MyServiceProvidersComponent} from './my-service-providers.component';
import {AddFirstServiceComponent} from '../provider-resources/add-first-service.component';
import {ServiceProviderFormComponent} from './service-provider-form.component';
import {ServiceProviderInfoComponent} from './service-provider-info.component';
import {UpdateServiceProviderComponent} from './update-service-provider.component';
import {ServiceProvidersListComponent} from '../admin/service-providers-list.component';
import {ResourcesListComponent} from '../admin/resources-list.component';
import {TrainingListComponent} from '../admin/training-list.component';
import {ServiceEditComponent} from '../provider-resources/service-edit.component';
import {ServiceUploadComponent} from '../provider-resources/service-upload.component';
import {ServiceFormComponent} from '../provider-resources/service-form.component';
import { ProviderFormToPdfComponent } from './provider-form-to-pdf/provider-form-to-pdf.component';
import { ResourceFormToPdfComponent } from '../provider-resources/resource-form-to-pdf/resource-form-to-pdf.component';
import {MonitoringExtensionFormComponent} from "../provider-resources/monitoring-extension/monitoring-extension-form.component";
import {HelpdeskExtensionFormComponent} from "../provider-resources/helpdesk-extension/helpdesk-extension-form.component";
import {NgSelectModule} from '@ng-select/ng-select';
import {LMarkdownEditorModule} from 'ngx-markdown-editor';
import {AddFirstDatasourceComponent} from "../datasource/add-first-datasource.component";
import {ResourceGuidelinesFormComponent} from "../provider-resources/resource-guidelines/resource-guidelines-form.component";
import {DatasourceGuidelinesFormComponent} from "../datasource/datasource-guidelines/datasource-guidelines-form.component";
import {TrainingResourceForm} from "../training-resources/training-resource-form";
import {UpdateTrainingResource} from "../training-resources/update-training-resource";
import {AddFirstTrainingResourceComponent} from "../training-resources/add-first-training-resource.component";


@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    LMarkdownEditorModule,
    ReactiveFormsModule,
    ProviderRouting,
    ReusableComponentsModule,
    HighchartsChartModule,
    NgSelectModule,

  ],
  declarations: [
    MyServiceProvidersComponent,
    AddFirstServiceComponent,
    AddFirstTrainingResourceComponent,
    AddFirstDatasourceComponent,
    ServiceProviderFormComponent,
    ServiceProviderInfoComponent,
    UpdateServiceProviderComponent,
    ServiceProvidersListComponent,
    ResourcesListComponent,
    TrainingListComponent,
    // FORMS
    ServiceEditComponent,
    ServiceFormComponent,
    ServiceUploadComponent,
    ProviderFormToPdfComponent,
    ResourceFormToPdfComponent,
    MonitoringExtensionFormComponent,
    HelpdeskExtensionFormComponent,
    ResourceGuidelinesFormComponent,
    DatasourceGuidelinesFormComponent,
    TrainingResourceForm,
    UpdateTrainingResource
  ]
})

export class ProviderModule {
}
