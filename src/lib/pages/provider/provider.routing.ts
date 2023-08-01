import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CanActivateViaAuthGuard} from '../../services/can-activate-auth-guard.service';
import {ServiceProviderFormComponent} from './service-provider-form.component';
import {AddFirstServiceComponent} from '../provider-resources/add-first-service.component';
import {MyServiceProvidersComponent} from './my-service-providers.component';
import {UpdateServiceProviderComponent} from './update-service-provider.component';
import {PendingServicesComponent} from './dashboard/pendingservices/pending-services.component';
import {ServiceProvidersListComponent} from '../admin/service-providers-list.component';
import {ResourcesListComponent} from '../admin/resources-list.component';
import {DatasourcesListComponent} from '../admin/datasources-list.component';
import {ServiceEditComponent} from '../provider-resources/service-edit.component';
import {ServiceUploadComponent} from '../provider-resources/service-upload.component';
import {ProviderFormToPdfComponent} from './provider-form-to-pdf/provider-form-to-pdf.component';
import {ResourceFormToPdfComponent} from '../provider-resources/resource-form-to-pdf/resource-form-to-pdf.component';
import {MonitoringExtensionFormComponent} from "../provider-resources/monitoring-extension/monitoring-extension-form.component";
import {HelpdeskExtensionFormComponent} from "../provider-resources/helpdesk-extension/helpdesk-extension-form.component";
import {environment} from '../../../environments/environment';
import {RejectedServicesComponent} from './dashboard/rejectedServices/rejected-services.component';
import {DatasourceSelectComponent} from "./dashboard/datasources/datasource-select.component";
import {DatasourceFormComponent} from "../datasource/datasource-form.component";
import {UpdateDatasourceComponent} from "../datasource/update-datasource.component";
import {AddFirstDatasourceComponent} from "../datasource/add-first-datasource.component";
import {RejectedDatasourcesComponent} from "./dashboard/rejectedDatasources/rejected-datasources.component";
import {ResourceGuidelinesFormComponent} from "../provider-resources/resource-guidelines/resource-guidelines-form.component";
import {DatasourceGuidelinesFormComponent} from "../datasource/datasource-guidelines/datasource-guidelines-form.component";
import {PendingDatasourcesComponent} from "./dashboard/pendingDatasources/pending-datasources.component";
import {TrainingResourceForm} from "../training-resources/training-resource-form";
import {UpdateTrainingResource} from "../training-resources/update-training-resource";
import {TrainingListComponent} from "../admin/training-list.component";
import {AddFirstTrainingResourceComponent} from "../training-resources/add-first-training-resource.component";


const providerRoutes: Routes = [

  {
    path: 'add',
    component: ServiceProviderFormComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'New Provider'
    }
  },
  {
    path: 'add/:providerId',
    component: UpdateServiceProviderComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'New Provider'
    }
  },
  // fixme move this to the dashboard module when no longer in form
  {
    path: 'view/:catalogueId/:providerId',
    component: UpdateServiceProviderComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Provider Info'
    }
  },
  {
    path: 'update/:providerId',
    component: UpdateServiceProviderComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Update Provider'
    }
  },
  {
    path: 'my',
    component: MyServiceProvidersComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'My Providers'
    }
  },
  {
    path: 'draft-resources/:providerId',
    component: PendingServicesComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Draft ' + environment.serviceORresource + 's'
    }
  },
  {
    path: 'draft-datasources/:providerId',
    component: PendingDatasourcesComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Draft Datasources'
    }
  },
  {
    path: 'rejected-resources/:providerId',
    component: RejectedServicesComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Rejected ' + environment.serviceORresource + 's'
    }
  },
  {
    path: 'rejected-datasources/:providerId',
    component: RejectedDatasourcesComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Rejected Datasources'
    }
  },
  {
    path: ':providerId/add-first-service',
    component: AddFirstServiceComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Add ' + environment.serviceORresource + ' Template'
    }
  },
  {
    path: ':providerId/add-first-training-resource',
    component: AddFirstTrainingResourceComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Add Training Resource Template'
    }
  },
  {
    path: ':providerId/resource/update-template/:resourceId',
    component: AddFirstServiceComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Edit ' + environment.serviceORresource + ' Template'
    }
  },
  {
    path: ':providerId/add-first-datasource',
    component: AddFirstDatasourceComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Add Datasource Template'
    }
  },
  {
    path: ':providerId/draft-resource/update/:resourceId',
    component: ServiceEditComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Edit Draft ' + environment.serviceORresource
    }
  },
  {
    path: ':providerId/draft-datasource/update/:datasourceId',
    component: UpdateDatasourceComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Edit Draft Datasource'
    }
  },
  {
    path: ':providerId/resource/add',
    component: ServiceUploadComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Add ' + environment.serviceORresource
    }
  },
  {
    path: ':providerId/training-resource/add',
    component: TrainingResourceForm,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Add Training Resource'
    }
  },
  {
    path: ':providerId/datasource/select',
    component: DatasourceSelectComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Select Datasource'
    }
  },
  {
    path: ':providerId/datasource/add',
    component: DatasourceFormComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Add Datasource'
    }
  },
  {
    path: ':providerId/datasource/addOpenAIRE/:datasourceId',
    component: UpdateDatasourceComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Add Datasource from OpenAIRE'
    }
  },
  {
    path: ':providerId/resource/add/use-template/:resourceId',
    component: ServiceEditComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Add ' + environment.serviceORresource
    }
  },
  {
    path: ':providerId/resource/update/:resourceId',
    component: ServiceEditComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Edit ' + environment.serviceORresource
    }
  },
  {
    path: ':providerId/training-resource/update/:trainingResourceId',
    component: UpdateTrainingResource,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Edit Training Resource'
    }
  },
  {
    path: ':providerId/datasource/update/:datasourceId',
    component: UpdateDatasourceComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Edit Datasource'
    }
  },
  {
    path: ':catalogueId/:providerId/resource/view/:resourceId',
    component: ServiceEditComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'View ' + environment.serviceORresource
    }
  },
  {
    path: ':catalogueId/:providerId/datasource/view/:datasourceId',
    component: UpdateDatasourceComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'View Datasource'
    }
  },
  {
    path: ':catalogueId/:providerId/training-resource/view/:trainingResourceId',
    component: UpdateTrainingResource,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'View Training Resource'
    }
  },
  {
    path: 'provider2pdf',
    component: ProviderFormToPdfComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Provider Form To PDF'
    }
  },
  {
    path: 'resource2pdf',
    component: ResourceFormToPdfComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Provider Form To PDF'
    }
  },
  {
    path: ':providerId/resource/monitoring/:resourceId',
    component: MonitoringExtensionFormComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Monitoring Extension'
    }
  },
  {
    path: ':providerId/resource/helpdesk/:resourceId',
    component: HelpdeskExtensionFormComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Helpdesk Extension'
    }
  },
  {
    path: ':providerId/datasource/monitoring/:datasourceId',
    component: MonitoringExtensionFormComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Monitoring Extension'
    }
  },
  {
    path: ':providerId/datasource/helpdesk/:datasourceId',
    component: HelpdeskExtensionFormComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Helpdesk Extension'
    }
  },
  {
    path: ':providerId/training-resource/monitoring/:trainingResourceId',
    component: MonitoringExtensionFormComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Monitoring Extension'
    }
  },
  {
    path: ':providerId/training-resource/helpdesk/:trainingResourceId',
    component: HelpdeskExtensionFormComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Helpdesk Extension'
    }
  },
  {
    path: ':providerId/resource/guidelines/:resourceId',
    component: ResourceGuidelinesFormComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Resource Guidelines'
    }
  },
  {
    path: ':providerId/datasource/guidelines/:datasourceId',
    component: DatasourceGuidelinesFormComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Datasource Guidelines'
    }
  },
  {
    path: 'all',
    component: ServiceProvidersListComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'All Providers'
    }
  },
  {
    path: 'resource/all',
    component: ResourcesListComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'All ' + environment.serviceORresource + 's'
    }
  },
  {
    path: 'datasource/all',
    component: DatasourcesListComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'All Datasources'
    }
  },
  {
    path: 'training/all',
    component: TrainingListComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'All Training Resources'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(providerRoutes)],
  exports: [RouterModule]
})

export class ProviderRouting {
}
