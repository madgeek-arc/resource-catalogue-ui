import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ReusableComponentsModule} from '../../shared/reusablecomponents/reusable-components.module';
import {SharedModule} from '../../shared/shared.module';
import {UserRouting} from './user.routing';
import {StatsComponent} from './dashboard/providerStats/stats.component';
import {ChartModule} from 'angular2-highcharts';
import {ServicesComponent} from './dashboard/services/services.component';
import {MessagesComponent} from './dashboard/messages/messages.component';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UserRouting,
    ReusableComponentsModule,
    ChartModule,

  ],
  declarations: [
    StatsComponent,
    ServicesComponent,
    MessagesComponent
  ]
})
export class UserModule {
}
