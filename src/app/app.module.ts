import {NgModule} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AppComponent} from './app.component';
import {HomeComponent} from '../lib/pages/home/home.component';
import {SharedModule} from '../lib/shared/shared.module';
import {AppRoutingModule} from './app.routing';
import {AuthenticationService} from '../lib/services/authentication.service';
import {CanActivateViaAuthGuard} from '../lib/services/can-activate-auth-guard.service';
import {NavigationService} from '../lib/services/navigation.service';
import {ResourceService} from '../lib/services/resource.service';
import {CanActivateViaPubGuard} from '../lib/services/can-activate-pub-guard.service';
import {FooterComponent} from '../lib/shared/footer/footer.component';
import {TopMenuComponent} from '../lib/shared/topmenu/topmenu.component';
import {BreadcrumbsComponent} from '../lib/shared/breadcrumbs/breadcrumbs.component';
import {FeedbackComponent} from '../lib/shared/feedback/feedback.component';
import {AngularFontAwesomeModule} from 'angular-font-awesome';
import {ServiceProviderFormComponent} from '../lib/pages/provider/service-provider-form.component';
import {MyServiceProvidersComponent} from '../lib/pages/provider/my-service-providers.component';
import {AddFirstServiceComponent} from '../lib/pages/provider/add-first-service.component';
import {ServiceProviderInfoComponent} from '../lib/pages/provider/service-provider-info.component';
import {UpdateServiceProviderComponent} from '../lib/pages/provider/update-service-provider.component';
import {ReusableComponentsModule} from '../lib/shared/reusablecomponents/reusable-components.module';
import {ServiceProviderService} from '../lib/services/service-provider.service';
import {ServiceProvidersListComponent} from '../lib/pages/admin/service-providers-list.component';
import {HighchartsStatic} from 'angular2-highcharts/dist/HighchartsService';
import {ChartModule} from 'angular2-highcharts';
import {SupportModule} from '../lib/pages/support/support.module';
import {ServiceStatsComponent} from '../lib/pages/provider/dashboard/resource-dashboard/service-stats.component';
import {MyFavouritesComponent} from '../lib/pages/user/favourites/my-favourites.component';
import {DashboardComponent} from '../lib/pages/provider/dashboard/dashboard.component';
import {UserService} from '../lib/services/user.service';
import {ComparisonService} from '../lib/services/comparison.service';
import {UserModule} from '../lib/pages/user/user.module';
import {StarRatingModule} from 'angular-star-rating';
import {ServiceLandingPageComponent} from '../lib/pages/landingpages/service/service-landing-page.component';
import {BrowseCategoriesComponent} from '../lib/pages/browsecategories/browse-categories.component';
import {SearchComponent} from '../lib/pages/search/search.component';
import {StatsComponent} from '../lib/pages/stats/stats.component';
import {CompareServicesComponent} from '../lib/pages/compare/compare-services.component';
import {ServiceFormComponent} from '../lib/pages/provider-resources/service-form.component';
import {ServiceUploadComponent} from '../lib/pages/provider-resources/service-upload.component';
import {CKEditorModule} from 'ng2-ckeditor';
import {ServiceEditComponent} from '../lib/pages/provider-resources/service-edit.component';
import {MeasurementsComponent} from '../lib/pages/indicators/measurements.component';
import {IndicatorFromComponent} from '../lib/pages/indicators/indicator-from.component';
import {AuthenticationInterceptor} from '../lib/services/authentication-interceptor';
import {CookieLawModule} from '../lib/shared/reusablecomponents/cookie-law/cookie-law.module';
import {EmailService} from '../lib/services/email.service';
import {TreeviewModule} from 'ngx-treeview';
import {EOSCFooterComponent} from './shared/footer/footer.component';
import {EOSCTopMenuComponent} from './shared/topmenu/topmenu.component';
import {BecomeAProviderComponent} from './pages/serviceprovider/become-a-provider.component';


declare var require: any;

export function highchartsFactory() {
  const hc = require('highcharts');
  require('highcharts/modules/heatmap')(hc);
  require('highcharts/modules/map')(hc);
  require('../lib/assets/js/europe.js')(hc);
  require('../lib/assets/js/world.js')(hc);
  require('highcharts/modules/drilldown')(hc);
  require('highcharts/modules/exporting')(hc);
  require('highcharts/modules/offline-exporting')(hc);
  require('highcharts/modules/export-data')(hc);
  return hc;
}

@NgModule({
  declarations: [
    // MAIN
    AppComponent,
    BrowseCategoriesComponent,
    CompareServicesComponent,
    HomeComponent,
    SearchComponent,
    StatsComponent,
    ServiceLandingPageComponent,
    BecomeAProviderComponent,
    // PERSISTENT
    // TopMenuComponent,
    EOSCTopMenuComponent,
    // BreadcrumbsComponent,
    // FooterComponent,
    EOSCFooterComponent,
    FeedbackComponent,
    // USER
    // DashboardComponent,
    // MyFavouritesComponent,
    // ServiceStatsComponent,
    // // SERVICE PROVIDER ADMIN
    // ServiceProviderFormComponent,
    // ServiceProviderInfoComponent,
    // UpdateServiceProviderComponent,
    // AddFirstServiceComponent,
    // MyServiceProvidersComponent,
    // ADMIN
    // ServiceProvidersListComponent,
    // INDICATORS
    MeasurementsComponent,
    IndicatorFromComponent,
    // FORMS
    // ServiceEditComponent,
    // ServiceFormComponent,
    // ServiceUploadComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    ReusableComponentsModule,
    SharedModule,
    TreeviewModule.forRoot(),
    // StarRatingModule.forRoot(),
    SupportModule,
    UserModule,
    // ProviderModule,
    // ProviderDashboardModule,
    // CKEditorModule,
    ChartModule,
    AngularFontAwesomeModule,
    CookieLawModule,
    AppRoutingModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthenticationInterceptor,
      multi: true
    },
    AuthenticationService,
    ComparisonService,
    CanActivateViaAuthGuard,
    CanActivateViaPubGuard,
    NavigationService,
    ResourceService,
    UserService,
    ServiceProviderService,
    EmailService,
    {
      provide: HighchartsStatic,
      useFactory: highchartsFactory
    },
    DatePipe
  ],
  exports: [
    // FooterComponent,
    EOSCFooterComponent,
    // TopMenuComponent,
    EOSCTopMenuComponent,
    BreadcrumbsComponent,
    FeedbackComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
