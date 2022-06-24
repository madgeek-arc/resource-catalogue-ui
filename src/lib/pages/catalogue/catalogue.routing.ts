import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CanActivateViaAuthGuard} from '../../services/can-activate-auth-guard.service';
import {CatalogueFormComponent} from './catalogue-form.component';
import {UpdateCatalogueComponent} from "./update-catalogue.component";
import {MyCataloguesComponent} from "./my-catalogues.component";
import {CataloguesListComponent} from "../admin/catalogues-list.component";


const catalogueRoutes: Routes = [

  {
    path: 'add',
    component: CatalogueFormComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'New Catalogue'
    }
  },
  {
    path: 'update/:catalogueId',
    component: UpdateCatalogueComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Update Catalogue'
    }
  },
  {
    path: 'my',
    component: MyCataloguesComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'My Catalogues'
    }
  },
  {
    path: 'all',
    component: CataloguesListComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'All Catalogues'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(catalogueRoutes)],
  exports: [RouterModule]
})

export class CatalogueRouting {
}
