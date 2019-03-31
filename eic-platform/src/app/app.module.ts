import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {HomeComponent} from './pages/home/home.component';
import {ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from './shared/shared.module';
import {appRoutingProviders, routing} from './app.routing';
import {AuthenticationService} from './services/authentication.service';
import {HttpClientModule} from '@angular/common/http';
import {CanActivateViaAuthGuard} from './services/can-activate-auth-guard.service';
import {NavigationService} from './services/navigation.service';
import {ResourceService} from './services/resource.service';
import {CanActivateViaPubGuard} from './services/can-activate-pub-guard.service';
import {DatePipe} from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent
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
    // ReusableComponentsModule,
    // ResourceRegistrationModule,
    routing,
    SharedModule,
    // StarRatingModule.forRoot(),
    // SupportModule,
    // TabsModule,
    // UserModule,
    // CKEditorModule,
    // ChartModule,
    routing
  ],
  providers: [
    appRoutingProviders,
    AuthenticationService,
    // ComparisonService,
    CanActivateViaAuthGuard,
    CanActivateViaPubGuard,
    NavigationService,
    ResourceService,
    // UserService,
    // ServiceProviderService,
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
