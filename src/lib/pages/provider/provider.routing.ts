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
import {ServiceEditComponent} from '../provider-resources/service-edit.component';
import {ServiceUploadComponent} from '../provider-resources/service-upload.component';
import {MonitoringExtensionFormComponent} from "../provider-resources/monitoring-extension/monitoring-extension-form.component";
import {HelpdeskExtensionFormComponent} from "../provider-resources/helpdesk-extension/helpdesk-extension-form.component";
import {DatasourceSubprofileFormComponent} from "../provider-resources/service-subprofiles/datasource-subprofile-form.component";
import {environment} from '../../../environments/environment';
import {RejectedServicesComponent} from './dashboard/rejectedServices/rejected-services.component';
import {DatasourceSelectComponent} from "./dashboard/datasources/datasource-select.component";
import {RejectedTrainingResourcesComponent} from "./dashboard/rejectedTrainingResources/rejected-training-resources.component";
// import {ResourceGuidelinesFormComponent} from "../provider-resources/resource-guidelines/resource-guidelines-form.component";
import {TrainingResourceForm} from "../training-resources/training-resource-form";
import {UpdateTrainingResource} from "../training-resources/update-training-resource";
import {TrainingListComponent} from "../admin/training-list.component";
import {AddFirstTrainingResourceComponent} from "../training-resources/add-first-training-resource.component";
import {DatasourcesListComponent} from "../admin/datasources-list.component";
import {SelectSubprofileComponent} from "../provider-resources/service-subprofiles/select-subprofile.component";
import {DatasourceMetricsComponent} from "../provider-resources/service-subprofiles/datasource-metrics.component";
import {DeployableServicesListComponent} from "../admin/deployable-services-list.component";
import {DeployableServiceForm} from "../deployable-services/deployable-service-form";
import {AddFirstDeployableServiceComponent} from "../deployable-services/add-first-deployable-service.component";
import {UpdateDeployableService} from "../deployable-services/update-deployable-service";
import {
  RejectedDeployableServicesComponent
} from "./dashboard/rejectedDeployableServices/rejected-deployable-services.component";

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
    path: 'rejected-resources/:providerId',
    component: RejectedServicesComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Rejected ' + environment.serviceORresource + 's'
    }
  },
  {
    path: 'rejected-training-resources/:providerId',
    component: RejectedTrainingResourcesComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Rejected Training Resources'
    }
  },
  {
    path: 'rejected-deployable-services/:providerId',
    component: RejectedDeployableServicesComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Rejected Deployable Services'
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
    path: ':providerId/add-first-deployable-service',
    component: AddFirstDeployableServiceComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Add Deployable Service Template'
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
    path: ':providerId/draft-resource/update/:resourceId',
    component: ServiceEditComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Edit Draft ' + environment.serviceORresource
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
    path: ':providerId/deployable-service/add',
    component: DeployableServiceForm,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Add Deployable Service'
    }
  },
  {
    path: ':providerId/service/:resourceId/select-subprofile', //for eosc only
    component: SelectSubprofileComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Select Subprofile'
    }
  },
  {
    path: ':providerId/resource/:resourceId/datasource/select',
    component: DatasourceSelectComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Select Datasource'
    }
  },
  {
    path: ':providerId/resource/:resourceId/subprofile/datasource',
    component: DatasourceSubprofileFormComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Add Datasource'
    }
  },
  {
    path: ':providerId/resource/:resourceId/subprofile/datasource/addOpenAIRE/:openaireId',
    component: DatasourceSubprofileFormComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Add Datasource'
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
    path: ':providerId/training-resource/add/use-template/:trainingResourceId',
    component: UpdateTrainingResource,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Add Training Resource'
    }
  },
  {
    path: ':providerId/deployable-service/add/use-template/:deployableServiceId',
    component: UpdateDeployableService,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Add Deployable Service Resource'
    }
  },
  {
    path: ':providerId/resource/:resourceId/datasource/metrics', // TODO: datasourceId maybe needed
    component: DatasourceMetricsComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Datasource Metrics'
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
    path: ':providerId/deployable-service/update/:deployableServiceId',
    component: UpdateDeployableService,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Edit Deployable Service'
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
    path: ':catalogueId/:providerId/training-resource/view/:trainingResourceId',
    component: UpdateTrainingResource,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'View Training Resource'
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
  // {
  //   path: ':providerId/resource/guidelines/:resourceId',
  //   component: ResourceGuidelinesFormComponent,
  //   canActivate: [CanActivateViaAuthGuard],
  //   data: {
  //     breadcrumb: 'Resource Guidelines'
  //   }
  // },
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
      breadcrumb: 'All Datasource Subprofiles'
    }
  },
  {
    path: 'training/all',
    component: TrainingListComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'All Training Resources'
    }
  },
  {
    path: 'deployable-service/all',
    component: DeployableServicesListComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'All Deployable Services'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(providerRoutes)],
  exports: [RouterModule]
})

export class ProviderRouting {
}
