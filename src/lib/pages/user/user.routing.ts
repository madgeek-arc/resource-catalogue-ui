import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CanActivateViaAuthGuard} from '../../services/can-activate-auth-guard.service';
import {MyFavouritesComponent} from './favourites/my-favourites.component';

const userRoutes: Routes = [
  {
    path: 'myFavourites',
    component: MyFavouritesComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'My Favourites'
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(userRoutes)],
  exports: [RouterModule]
})

export class UserRouting {
}
