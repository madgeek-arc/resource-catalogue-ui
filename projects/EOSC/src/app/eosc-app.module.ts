import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {EoscAppComponent} from './eosc-app.component';
import {HomeEoscComponent} from './pages/home/home-eosc.component';
import {FooterComponent} from './shared/footer/footer.component';
import {BreadcrumbsComponent} from './shared/breadcrumbs/breadcrumbs.component';
import {TopMenuComponent} from './shared/topmenu/topmenu.component';
import {BecomeAProviderComponent} from './pages/serviceprovider/become-a-provider.component';
import {SearchExtendedComponent} from './pages/search/search.extended.component';
import {ServiceLandingPageExtendedComponent} from './pages/landingpages/service/service-landing-page.extended.component';
import {AppModule} from '../../../../src/app/app.module';
import {AppRoutingModule} from './app-routing.module';
import {ReusableComponentsModule} from '../../../../src/app/shared/reusablecomponents/reusable-components.module';
import {SharedModule} from '../../../../src/app/shared/shared.module';
import {StarRatingModule} from 'angular-star-rating';
import {ChartModule} from 'angular2-highcharts';
import {CookieLawModule} from '../../../../src/app/shared/reusablecomponents/cookie-law/cookie-law.module';
import {ResourceService} from '../../../../src/app/services/resource.service';


@NgModule({
  declarations: [
    EoscAppComponent,
    HomeEoscComponent,
    BecomeAProviderComponent,
    SearchExtendedComponent,
    ServiceLandingPageExtendedComponent,
    // PERSISTENT
    FooterComponent,
    BreadcrumbsComponent,
    TopMenuComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AppModule,
    FormsModule,
    ReactiveFormsModule,
    ReusableComponentsModule,
    SharedModule,
    StarRatingModule.forRoot(),
    ChartModule,
    CookieLawModule
  ],
  providers: [ // this can be removed
    ResourceService
  ],
  bootstrap: [EoscAppComponent]
})
export class EoscAppModule {
}
