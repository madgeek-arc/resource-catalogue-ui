import {NgModule} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AppComponent} from './app.component';
import {HomeComponent} from './pages/home/home.component';
import {SharedModule} from './shared/shared.module';
import {AppRoutingModule} from './app.routing';
import {AuthenticationService} from './services/authentication.service';
import {CanActivateViaAuthGuard} from './services/can-activate-auth-guard.service';
import {NavigationService} from './services/navigation.service';
import {ResourceService} from './services/resource.service';
import {CanActivateViaPubGuard} from './services/can-activate-pub-guard.service';
import {FooterComponent} from './shared/footer/footer.component';
import {TopMenuComponent} from './shared/topmenu/topmenu.component';
import {BreadcrumbsComponent} from './shared/breadcrumbs/breadcrumbs.component';
import {FeedbackComponent} from './shared/feedback/feedback.component';
import {AngularFontAwesomeModule} from 'angular-font-awesome';
import {ServiceProviderFormComponent} from './pages/provider/service-provider-form.component';
import {MyServiceProvidersComponent} from './pages/provider/my-service-providers.component';
import {AddFirstServiceComponent} from './pages/provider/add-first-service.component';
import {ServiceProviderInfoComponent} from './pages/provider/service-provider-info.component';
import {UpdateServiceProviderComponent} from './pages/provider/update-service-provider.component';
import {ReusableComponentsModule} from './shared/reusablecomponents/reusable-components.module';
import {ServiceProviderService} from './services/service-provider.service';
import {ServiceProvidersListComponent} from './pages/admin/service-providers-list.component';
import {HighchartsStatic} from 'angular2-highcharts/dist/HighchartsService';
import {ChartModule} from 'angular2-highcharts';
import {SupportModule} from './pages/support/support.module';
import {ServiceStatsComponent} from './pages/provider/dashboard/resource-dashboard/service-stats.component';
import {MyFavouritesComponent} from './pages/user/favourites/my-favourites.component';
import {DashboardComponent} from './pages/provider/dashboard/dashboard.component';
import {UserService} from './services/user.service';
import {ComparisonService} from './services/comparison.service';
import {UserModule} from './pages/user/user.module';
import {StarRatingModule} from 'angular-star-rating';
import {ServiceLandingPageComponent} from './pages/landingpages/service/service-landing-page.component';
import {BrowseCategoriesComponent} from './pages/browsecategories/browse-categories.component';
import {SearchComponent} from './pages/search/search.component';
import {StatsComponent} from './pages/stats/stats.component';
import {CompareServicesComponent} from './pages/compare/compare-services.component';
import {ServiceFormComponent} from './pages/provider-resources/service-form.component';
import {ServiceUploadComponent} from './pages/provider-resources/service-upload.component';
import {CKEditorModule} from 'ng2-ckeditor';
import {ServiceEditComponent} from './pages/provider-resources/service-edit.component';
import {MeasurementsComponent} from './pages/indicators/measurements.component';
import {IndicatorFromComponent} from './pages/indicators/indicator-from.component';
import {AuthenticationInterceptor} from './services/authentication-interceptor';
import {CookieLawModule} from './shared/reusablecomponents/cookie-law/cookie-law.module';
import {EmailService} from './services/email.service';
import {TreeviewModule} from 'ngx-treeview';


declare var require: any;

export function highchartsFactory() {
  const hc = require('highcharts');
  require('highcharts/modules/heatmap')(hc);
  require('highcharts/modules/map')(hc);
  require('../assets/js/europe.js')(hc);
  require('../assets/js/world.js')(hc);
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
    // PERSISTENT
    TopMenuComponent,
    // BreadcrumbsComponent,
    FooterComponent,
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
    FooterComponent,
    TopMenuComponent,
    BreadcrumbsComponent,
    FeedbackComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
