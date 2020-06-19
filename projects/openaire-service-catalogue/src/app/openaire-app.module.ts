import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {OpenaireAppComponent} from './openaire-app.component';
import {TopMenuComponent} from './pages/shared/topmenu/topmenu.component';
import {AppModule} from '../../../../src/app/app.module';
import {HomeAireComponent} from './pages/home/home.aire.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SearchAireComponent} from './pages/search/search.aire.component';
import {ReusableComponentsModule} from '../../../../src/app/shared/reusablecomponents/reusable-components.module';
import {SharedModule} from '../../../../src/app/shared/shared.module';
import {StarRatingModule} from 'angular-star-rating';
import {ChartModule} from 'angular2-highcharts';
import {FooterComponent} from './pages/shared/footer/footer.component';
import {CKEditorModule} from 'ng2-ckeditor';
import {CookieLawModule} from '../../../../src/app/shared/reusablecomponents/cookie-law/cookie-law.module';
import {CommonModule} from '@angular/common';

@NgModule({
  declarations: [
    OpenaireAppComponent,
    HomeAireComponent,
    SearchAireComponent,
    // PERSISTENT
    FooterComponent,
    TopMenuComponent,
  ],
  imports: [
    CommonModule,
    AppRoutingModule,
    AppModule,
    FormsModule,
    ReactiveFormsModule,
    ReusableComponentsModule,
    SharedModule,
    StarRatingModule.forRoot(),
    ChartModule,
    CKEditorModule,
    CookieLawModule,
  ],
  providers: [],
  bootstrap: [OpenaireAppComponent]
})

export class OpenaireAppModule {
}
