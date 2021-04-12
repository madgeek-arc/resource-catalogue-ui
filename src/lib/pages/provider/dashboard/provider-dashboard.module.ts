import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ChartModule} from 'angular2-highcharts';
import {SharedModule} from '../../../shared/shared.module';
import {ProviderDashboardRouting} from './provider-dashboard.routing';
import {ReusableComponentsModule} from '../../../shared/reusablecomponents/reusable-components.module';
import {ProviderStatsComponent} from './providerStats/provider-stats.component';
import {ProviderInfoComponent} from './providerInfo/provider-info.component';
import {ServicesComponent} from './services/services.component';
import {MessagesComponent} from './messages/messages.component';
import {DashboardComponent} from './dashboard.component';
import {ServiceStatsComponent} from './resource-dashboard/service-stats.component';
import {MarkdownModule} from 'ngx-markdown';
import {ProviderHistoryComponent} from './providerHistory/provider-history.component';
import {ProviderFullHistoryComponent} from './providerHistory/provider-full-history.component';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ProviderDashboardRouting,
    ReusableComponentsModule,
    ChartModule,
    MarkdownModule.forChild(),

  ],
  declarations: [
    DashboardComponent,
    ProviderStatsComponent,
    ProviderHistoryComponent,
    ProviderFullHistoryComponent,
    ProviderInfoComponent,
    ServicesComponent,
    MessagesComponent,
    // ServiceStatsComponent
  ]
})

export class ProviderDashboardModule {
}
