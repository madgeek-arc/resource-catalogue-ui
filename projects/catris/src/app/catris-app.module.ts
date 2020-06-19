import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {CatrisAppComponent} from './catris-app.component';
import {AppModule} from '../../../../src/app/app.module';
import {SharedModule} from '../../../../src/app/shared/shared.module';
import {TopmenuCatrisComponent} from './shared/topmenu/topmenu-catris.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BreadcrumbsComponent} from './shared/breadcrumbs/breadcrumbs.component';
import {SideElementsComponent} from './shared/sideelements/side-elements.component';
import {FooterComponent} from './shared/footer/footer.component';
import {HomeCatrisComponent} from './pages/home/home-catris.component';
import {ChartModule} from 'angular2-highcharts';
import {StarRatingModule} from 'angular-star-rating';
import {ReusableComponentsModule} from '../../../../src/app/shared/reusablecomponents/reusable-components.module';
import {CookieLawModule} from '../../../../src/app/shared/reusablecomponents/cookie-law/cookie-law.module';
import {CKEditorModule} from 'ng2-ckeditor';
import {CommonModule} from '@angular/common';

@NgModule({
  declarations: [
    CatrisAppComponent,
    TopmenuCatrisComponent,
    BreadcrumbsComponent,
    SideElementsComponent,
    FooterComponent,
    HomeCatrisComponent
  ],
  imports: [
    CommonModule,
    AppRoutingModule,
    AppModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    ReusableComponentsModule,
    StarRatingModule.forRoot(),
    ChartModule,
    CookieLawModule,
    CKEditorModule,
  ],
  providers: [],
  bootstrap: [CatrisAppComponent]
})
export class CatrisAppModule {
}
