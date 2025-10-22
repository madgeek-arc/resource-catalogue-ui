import {NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, APP_INITIALIZER} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AppComponent} from './app.component';
// import {HomeComponent} from '../lib/pages/home/home.component';
import {SharedModule} from '../lib/shared/shared.module';
import {AppRoutingModule} from './app.routing';
import {AuthenticationService} from '../lib/services/authentication.service';
import {CanActivateViaAuthGuard} from '../lib/services/can-activate-auth-guard.service';
import {NavigationService} from '../lib/services/navigation.service';
import {ResourceService} from '../lib/services/resource.service';
import {CanActivateViaPubGuard} from '../lib/services/can-activate-pub-guard.service';
import {BreadcrumbsComponent} from '../lib/shared/breadcrumbs/breadcrumbs.component';
import {DashboardBreadcrumbsComponent} from '../lib/shared/breadcrumbs/dashboard-breadcrumbs.component';
import {FeedbackComponent} from '../lib/shared/feedback/feedback.component';
import {ServiceProviderFormComponent} from '../lib/pages/provider/service-provider-form.component';
import {MyServiceProvidersComponent} from '../lib/pages/provider/my-service-providers.component';
import {AddFirstServiceComponent} from '../lib/pages/provider-resources/add-first-service.component';
import {ServiceProviderInfoComponent} from '../lib/pages/provider/service-provider-info.component';
import {UpdateServiceProviderComponent} from '../lib/pages/provider/update-service-provider.component';
import {ReusableComponentsModule} from '../lib/shared/reusablecomponents/reusable-components.module';
import {ServiceProviderService} from '../lib/services/service-provider.service';
import {ServiceProvidersListComponent} from '../lib/pages/admin/service-providers-list.component';
import {SupportModule} from '../lib/pages/support/support.module';
import {ServiceStatsComponent} from '../lib/pages/provider/dashboard/resource-dashboard/service-stats.component';
import {DashboardComponent} from '../lib/pages/provider/dashboard/dashboard.component';
import {ProvidersStatsComponent} from '../lib/pages/stats/providers-stats.component';
import {ResourcesStatsComponent} from '../lib/pages/stats/resources-stats.component';
import {ServiceFormComponent} from '../lib/pages/provider-resources/service-form.component';
import {ServiceUploadComponent} from '../lib/pages/provider-resources/service-upload.component';
import {ServiceEditComponent} from '../lib/pages/provider-resources/service-edit.component';
import {AuthenticationInterceptor} from '../lib/services/authentication-interceptor';
import {CookieLawModule} from '../lib/shared/reusablecomponents/cookie-law/cookie-law.module';
import {EmailService} from '../lib/services/email.service';
import {EOSCTopMenuComponent} from './shared/topmenu/topmenu.component';
import {BecomeAProviderComponent} from './pages/serviceprovider/become-a-provider.component';
import {VocabularyRequestsComponent} from '../lib/pages/admin/vocabulary-requests.component';
// import {MarkdownModule} from "ngx-markdown";
import {HighchartsChartModule} from "highcharts-angular";
import {environment} from '../environments/environment';
import {HomeComponent} from './pages/home/home.component';
import { RouterModule } from '@angular/router';
import {CatalogueService} from "../lib/services/catalogue.service";
import {ServiceExtensionsService} from "../lib/services/service-extensions.service";
import {ResourceExtrasService} from "../lib/services/resource-extras.service";
import {DatasourceService} from "../lib/services/datasource.service";
import {TrainingResourceService} from "../lib/services/training-resource.service";
import {RecommendationsService} from "../lib/services/recommendations.service";
import {GuidelinesService} from "../lib/services/guidelines.service";
import {pidHandler} from "../lib/shared/pid-handler/pid-handler.service";
import {FormControlService} from "../dynamic-catalogue/services/form-control.service";
import {AdaptersService} from "../lib/services/adapters.service";
import {HelpdeskService} from "./services/helpdesk.service";
import {DeployableServiceService} from "../lib/services/deployable-service.service";
import {ConfigService} from '../lib/services/config.service';
import {AccountingStatsService} from "../lib/services/accounting-stats.service";

declare var require: any;

export function initConfig(configService: ConfigService) {
  return () => configService.loadConfig();
}

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

@NgModule({ declarations: [
        // MAIN
        AppComponent,
        HomeComponent,
        ProvidersStatsComponent,
        ResourcesStatsComponent,
        BecomeAProviderComponent,
        // PERSISTENT
        EOSCTopMenuComponent,
        // BreadcrumbsComponent,
        FeedbackComponent,
        // USER
        // DashboardComponent,
        // ServiceStatsComponent,
        // // SERVICE PROVIDER ADMIN
        // ServiceProviderFormComponent,
        // ServiceProviderInfoComponent,
        // UpdateServiceProviderComponent,
        // AddFirstServiceComponent,
        // MyServiceProvidersComponent,
        // ADMIN
        VocabularyRequestsComponent,
        // ServiceProvidersListComponent,
        // FORMS
        // ServiceEditComponent,
        // ServiceFormComponent,
        // ServiceUploadComponent,
        // EoscCommonMainHeader,
        // EoscCommonMainFooter
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    exports: [
        // FooterComponent,
        // TopMenuComponent,
        EOSCTopMenuComponent,
        BreadcrumbsComponent,
        DashboardBreadcrumbsComponent,
        FeedbackComponent
    ],
    bootstrap: [AppComponent], imports: [RouterModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ReusableComponentsModule,
        SharedModule,
        // StarRatingModule.forRoot(),
        SupportModule,
        // ProviderModule,
        // ProviderDashboardModule,
        HighchartsChartModule,
        CookieLawModule,
        // MarkdownModule.forRoot(),
        AppRoutingModule], providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthenticationInterceptor,
            multi: true
        },
        {
            provide: APP_INITIALIZER,
            useFactory: initConfig,
            deps: [ConfigService],
            multi: true
        },
        AuthenticationService,
        CanActivateViaAuthGuard,
        CanActivateViaPubGuard,
        NavigationService,
        ResourceService,
        DatasourceService,
        TrainingResourceService,
        DeployableServiceService,
        ServiceProviderService,
        ServiceExtensionsService,
        ResourceExtrasService,
        GuidelinesService,
        CatalogueService,
        EmailService,
        DatePipe,
        RecommendationsService,
        pidHandler,
        FormControlService,
        AdaptersService,
        HelpdeskService,
        AccountingStatsService,
        provideHttpClient(withInterceptorsFromDi())
    ] })
export class AppModule {
}
