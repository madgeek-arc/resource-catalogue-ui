import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CanActivateViaAuthGuard} from '../../services/can-activate-auth-guard.service';
import {ServiceProviderFormComponent} from './service-provider-form.component';
import {AddFirstServiceComponent} from './add-first-service.component';
import {MyServiceProvidersComponent} from './my-service-providers.component';
import {UpdateServiceProviderComponent} from './update-service-provider.component';
import {PendingServicesComponent} from './dashboard/pendingservices/pending-services.component';
import {ServiceProvidersListComponent} from '../admin/service-providers-list.component';
import {ServiceEditComponent} from '../provider-resources/service-edit.component';
import {ServiceUploadComponent} from '../provider-resources/service-upload.component';

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
    path: 'info/:providerId',
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
      breadcrumb: 'Draft Resources'
    }
  },
  {
    path: ':providerId/add-resource-template',
    component: AddFirstServiceComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Add Resource Template'
    }
  },
  {
    path: ':providerId/resource/update-template/:resourceId',
    component: AddFirstServiceComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Edit Resource Template'
    }
  },
  {
    path: ':providerId/draft-resource/update/:resourceId',
    component: ServiceEditComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Edit Draft Resource'
    }
  },
  {
    path: ':providerId/resource/add',
    component: ServiceUploadComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Add Resource'
    }
  },
  {
    path: ':providerId/resource/update/:resourceId',
    component: ServiceEditComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Edit Resource'
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
];

@NgModule({
  imports: [RouterModule.forChild(providerRoutes)],
  exports: [RouterModule]
})

export class ProviderRouting {
}
