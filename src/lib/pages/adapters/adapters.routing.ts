import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CanActivateViaAuthGuard} from '../../services/can-activate-auth-guard.service';
import {AdaptersFormComponent} from "./adapters-form.component";
import {AdaptersListComponent} from "../admin/adapters-list.component";
import {MyCataloguesComponent} from "../catalogue/my-catalogues.component";
import {MyAdaptersComponent} from "./my-adapters.component";
// import {UpdateGuidelinesFormComponent} from "./update-adapters-form.component";


const adaptersRoutes: Routes = [

  {
    path: 'add',
    component: AdaptersFormComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'New Adapter'
    }
  },
  {
    path: 'update/:adapterId',
    component: AdaptersFormComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Update Adapter'
    }
  },
  {
    path: 'my',
    component: MyAdaptersComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'My Adapters'
    }
  },
  {
    path: 'all',
    component: AdaptersListComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Adapters List'
    }
  }

];

@NgModule({
  imports: [RouterModule.forChild(adaptersRoutes)],
  exports: [RouterModule]
})

export class AdaptersRouting {
}
