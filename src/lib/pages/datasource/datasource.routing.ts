import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CanActivateViaAuthGuard} from '../../services/can-activate-auth-guard.service';
import {DatasourceFormComponent} from "./datasource-form.component";
import {UpdateDatasourceComponent} from "./update-datasource.component";


const datasourceRoutes: Routes = [

  {
    path: 'add',
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
    path: 'update/:datasourceId',
    component: UpdateDatasourceComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Update Datasource'
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(datasourceRoutes)],
  exports: [RouterModule]
})

export class DatasourceRouting {
}
