import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CanActivateViaAuthGuard} from '../../services/can-activate-auth-guard.service';
import {MyFavouritesComponent} from './favourites/my-favourites.component';
import {RecommendationsComponent} from './recommendations/recommendations.component';

const userRoutes: Routes = [
  {
    path: 'myFavourites',
    component: MyFavouritesComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'My Favourites'
    }
  },
  {
    path: 'recommendations',
    component: RecommendationsComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'My Recommendations'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(userRoutes)],
  exports: [RouterModule]
})

export class UserRouting {
}
