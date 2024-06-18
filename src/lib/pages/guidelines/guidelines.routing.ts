import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CanActivateViaAuthGuard} from '../../services/can-activate-auth-guard.service';
import {GuidelinesFormComponent} from "./guidelines-form.component";
import {GuidelinesListComponent} from "../admin/guidelines-list.component";
import {UpdateGuidelinesFormComponent} from "./update-guidelines-form.component";


const guidelinesRoutes: Routes = [

  {
    path: ':provider_prefix/:provider_suffix/add',
    component: GuidelinesFormComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'New Guideline'
    }
  },
  {
    path: ':provider_prefix/:provider_suffix/update/:guideline_prefix/:guideline_suffix',
    component: UpdateGuidelinesFormComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Update Guideline'
    }
  },
  {
    path: 'all',
    component: GuidelinesListComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Guidelines List'
    }
  }

];

@NgModule({
  imports: [RouterModule.forChild(guidelinesRoutes)],
  exports: [RouterModule]
})

export class GuidelinesRouting {
}
