import {NgModule} from '@angular/core';
import {DatePipe} from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';
import {HttpClientModule} from '@angular/common/http';
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
import {NewServiceProviderComponent} from './pages/serviceprovider/new-service-provider.component';
import {MyServiceProvidersComponent} from './pages/serviceprovider/my-service-providers.component';
import {AddFirstServiceComponent} from './pages/serviceprovider/add-first-service.component';
import {ServiceProviderInfoComponent} from './pages/serviceprovider/service-provider-info.component';
import {UpdateServiceProviderComponent} from './pages/serviceprovider/update-service-provider.component';
import {ReusableComponentsModule} from './shared/reusablecomponents/reusable-components.module';
import {ServiceProviderService} from './services/service-provider.service';
import {ServiceProvidersListComponent} from './pages/admin/service-providers-list.component';
import {FundersDashboardComponent} from './pages/funders/funders-dashboard.component';
import {HighchartsStatic} from 'angular2-highcharts/dist/HighchartsService';
import {ChartModule} from 'angular2-highcharts';
import {FunderService} from './services/funder.service';
import {SupportModule} from './pages/support/support.module';
import {ServiceDashboardComponent} from './pages/user/dashboard/service-dashboard.component';
import {MyFavouritesComponent} from './pages/user/favourites/my-favourites.component';
import {DashboardComponent} from './pages/user/dashboard/dashboard.component';
import {UserService} from './services/user.service';
import {ComparisonService} from './services/comparison.service';
import {UserModule} from './pages/user/user.module';
import { StarRatingModule } from 'angular-star-rating';
import {ServiceLandingPageComponent} from './pages/landingpages/service/service-landing-page.component';
import {BrowseCategoriesComponent} from './pages/browsecategories/browse-categories.component';
import {SearchComponent} from './pages/search/search.component';
import {AccordionComponent} from './pages/eInfraServices/accordion-section.component';
import {CompareServicesComponent} from './pages/compare/compare-services.component';
import {ServiceFormComponent} from './pages/eInfraServices/service-form.component';
import {ServiceUploadComponent} from './pages/eInfraServices/service-upload.component';


declare var require: any;

export function highchartsFactory() {
  const hc = require('highcharts');
  require('highcharts/modules/heatmap')(hc);
  require('highcharts/modules/map')(hc);
  require('../js/europe.js')(hc);
  require('../js/world.js')(hc);
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
    ServiceLandingPageComponent,
    // PERSISTENT
    TopMenuComponent,
    BreadcrumbsComponent,
    FooterComponent,
    FeedbackComponent,
    // USER
    // ActivateComponent,
    DashboardComponent,
    MyFavouritesComponent,
    ServiceDashboardComponent,
    // SERVICE PROVIDER ADMIN
    NewServiceProviderComponent,
    ServiceProviderInfoComponent,
    UpdateServiceProviderComponent,
    AddFirstServiceComponent,
    MyServiceProvidersComponent,
    // ADMIN
    ServiceProvidersListComponent,
    // FUNDERS
    FundersDashboardComponent,
    // FORMS
    // ServiceEditComponent,
    ServiceFormComponent,
    ServiceUploadComponent,
    AccordionComponent,
  ],
  imports: [
    BrowserModule,
    SharedModule,
    // AboutModule,
    BrowserModule,
    HttpClientModule,
    // HttpModule,
    // JsonpModule,
    // OAuthModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    ReusableComponentsModule,
    // ResourceRegistrationModule,
    SharedModule,
    StarRatingModule.forRoot(),
    SupportModule,
    // TabsModule,
    UserModule,
    // CKEditorModule,
    ChartModule,
    AngularFontAwesomeModule,
    AppRoutingModule
  ],
  providers: [
    AuthenticationService,
    ComparisonService,
    CanActivateViaAuthGuard,
    CanActivateViaPubGuard,
    NavigationService,
    ResourceService,
    UserService,
    ServiceProviderService,
    {
      provide: HighchartsStatic,
      useFactory: highchartsFactory
    },
    DatePipe,
    FunderService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
