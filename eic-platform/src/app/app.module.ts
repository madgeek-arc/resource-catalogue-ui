import {BrowserModule} from '@angular/platform-browser';
import {HttpClientModule} from '@angular/common/http';
import {ReactiveFormsModule} from '@angular/forms';
import {NgModule} from '@angular/core';
import {DatePipe} from '@angular/common';
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
// import {AddFirstServiceComponent} from './pages/serviceprovider/add-first-service.component';
import {ServiceProviderInfoComponent} from './pages/serviceprovider/service-provider-info.component';
import {UpdateServiceProviderComponent} from './pages/serviceprovider/update-service-provider.component';
import {ReusableComponentsModule} from './shared/reusablecomponents/reusable-components.module';
import {ServiceProviderService} from './services/service-provider.service';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    // PERSISTENT
    TopMenuComponent,
    BreadcrumbsComponent,
    FooterComponent,
    FeedbackComponent,
    // SERVICE PROVIDER ADMIN
    NewServiceProviderComponent,
    ServiceProviderInfoComponent,
    UpdateServiceProviderComponent,
    // AddFirstServiceComponent,
    MyServiceProvidersComponent
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
    ReactiveFormsModule,
    ReusableComponentsModule,
    // ResourceRegistrationModule,
    SharedModule,
    // StarRatingModule.forRoot(),
    // SupportModule,
    // TabsModule,
    // UserModule,
    // CKEditorModule,
    // ChartModule,
    AngularFontAwesomeModule,
    AppRoutingModule
  ],
  providers: [
    AuthenticationService,
    // ComparisonService,
    CanActivateViaAuthGuard,
    CanActivateViaPubGuard,
    NavigationService,
    ResourceService,
    // UserService,
    ServiceProviderService,
    // {
    //   provide: HighchartsStatic,
    //   useFactory: highchartsFactory
    // },
    DatePipe,
    // FunderService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
