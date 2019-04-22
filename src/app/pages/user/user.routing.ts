import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CanActivateViaAuthGuard} from '../../services/can-activate-auth-guard.service';
import {DashboardComponent} from './dashboard/dashboard.component';
import {ServiceDashboardComponent} from './dashboard/service-dashboard.component';

const userRoutes: Routes = [
  /*    {
          path: "signIn",
          component: LoginComponent,
          canActivate: [CanActivateViaPubGuard]
      },
      {
          path: "signUp",
          component: SignUpComponent,
          canActivate: [CanActivateViaPubGuard]
      },*/
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [CanActivateViaAuthGuard]
  },
  {
    path: 'dashboard/:provider',
    component: DashboardComponent,
    canActivate: [CanActivateViaAuthGuard]
  },
  {
    path: 'dashboard/:provider/:id',
    component: ServiceDashboardComponent,
    canActivate: [CanActivateViaAuthGuard]
  },
  /*    {
          path: "activate/:id",
          component: ActivateComponent,
          canActivate: [CanActivateViaPubGuard]
      }*/
];

@NgModule({
  imports: [RouterModule.forChild(userRoutes)],
  exports: [RouterModule]
})

export class UserRouting {
}
