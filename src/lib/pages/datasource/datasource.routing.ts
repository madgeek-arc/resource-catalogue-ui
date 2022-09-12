import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CanActivateViaAuthGuard} from '../../services/can-activate-auth-guard.service';
import {DatasourceFormComponent} from "./datasource-form.component";
import {UpdateDatasourceComponent} from "./update-datasource.component";
import {ServiceUploadComponent} from "../provider-resources/service-upload.component";
import {environment} from "../../../environments/environment";
import {DatasourceSelectComponent} from "../provider/dashboard/datasources/datasource-select.component";


const datasourceRoutes: Routes = [

  {
    path: 'add', //just for testing
    component: DatasourceFormComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'New Datasource'
    }
  },
  // {
  //   path: 'add/:datasourceId',
  //   component: UpdateServiceProviderComponent,
  //   canActivate: [CanActivateViaAuthGuard],
  //   data: {
  //     breadcrumb: 'New Datasource'
  //   }
  // },
  // {
  //   path: ':providerId/datasource/select',
  //   component: DatasourceSelectComponent,
  //   canActivate: [CanActivateViaAuthGuard],
  //   data: {
  //     breadcrumb: 'Add Datasource'
  //   }
  // },
  // {
  //   path: ':providerId/datasource/add',
  //   component: DatasourceFormComponent,
  //   canActivate: [CanActivateViaAuthGuard],
  //   data: {
  //     breadcrumb: 'Add Datasource'
  //   }
  // },
  // {
  //   path: 'provider/:providerId/datasource/update/:datasourceId',
  //   component: UpdateDatasourceComponent,
  //   canActivate: [CanActivateViaAuthGuard],
  //   data: {
  //     breadcrumb: 'Edit Datasource'
  //   }
  // },
];

@NgModule({
  imports: [RouterModule.forChild(datasourceRoutes)],
  exports: [RouterModule]
})

export class DatasourceRouting {
}
