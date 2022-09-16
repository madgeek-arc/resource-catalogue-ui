import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CanActivateViaAuthGuard} from '../../services/can-activate-auth-guard.service';
import {DatasourceFormComponent} from "./datasource-form.component";
import {UpdateDatasourceComponent} from "./update-datasource.component";
import {DatasourceSubmittedComponent} from "./datasource-submitted.component";


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
  {
    path: 'submitted/:datasourceId',
    component: DatasourceSubmittedComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Datasource Submitted'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(datasourceRoutes)],
  exports: [RouterModule]
})

export class DatasourceRouting {
}
