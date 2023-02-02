import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CanActivateViaAuthGuard} from '../../../services/can-activate-auth-guard.service';
import {GuidelinesFormComponent} from "./guidelines-form.component";
import {GuidelinesListComponent} from "./guidelines-list.component";
import {UpdateGuidelinesFormComponent} from "./update-guidelines-form.component";


const guidelinesRoutes: Routes = [

  {
    path: 'add',
    component: GuidelinesFormComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'New Guideline'
    }
  },
  {
    path: 'update/:guidelineId',
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
