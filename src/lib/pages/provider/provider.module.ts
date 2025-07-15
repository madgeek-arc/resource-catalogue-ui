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
import {TrainingResourceForm} from "../training-resources/training-resource-form";
import {UpdateTrainingResource} from "../training-resources/update-training-resource";
import {AddFirstTrainingResourceComponent} from "../training-resources/add-first-training-resource.component";
import {DatasourcesListComponent} from "../admin/datasources-list.component";
import {SelectSubprofileComponent} from "../provider-resources/service-subprofiles/select-subprofile.component";
import {DatasourceMetricsComponent} from "../provider-resources/service-subprofiles/datasource-metrics.component";
import {CatalogueUiModule} from "../../../dynamic-catalogue/catalogue-ui.module";
import {DeployableServicesListComponent} from "../admin/deployable-services-list.component";


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
    CatalogueUiModule
  ],
  declarations: [
    MyServiceProvidersComponent,
    AddFirstServiceComponent,
    AddFirstTrainingResourceComponent,
    ServiceProviderFormComponent,
    ServiceProviderInfoComponent,
    UpdateServiceProviderComponent,
    ServiceProvidersListComponent,
    ResourcesListComponent,
    DatasourcesListComponent,
    TrainingListComponent,
    DeployableServicesListComponent,
    SelectSubprofileComponent,
    DatasourceMetricsComponent,
    // FORMS
    ServiceEditComponent,
    ServiceFormComponent,
    ServiceUploadComponent,
    ProviderFormToPdfComponent,
    ResourceFormToPdfComponent,
    MonitoringExtensionFormComponent,
    HelpdeskExtensionFormComponent,
    TrainingResourceForm,
    UpdateTrainingResource
  ]
})

export class ProviderModule {
}
