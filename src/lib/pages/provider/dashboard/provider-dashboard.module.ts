import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../../../shared/shared.module';
import {ProviderDashboardRouting} from './provider-dashboard.routing';
import {ReusableComponentsModule} from '../../../shared/reusablecomponents/reusable-components.module';
import {ProviderStatsComponent} from './providerStats/provider-stats.component';
import {ProviderInfoComponent} from "./providerInfo/provider-info.component";
import {ServicesComponent} from './services/services.component';
import {MessagesComponent} from './messages/messages.component';
import {DashboardComponent} from './dashboard.component';
import {ServiceStatsComponent} from './resource-dashboard/service-stats.component';
// import {MarkdownModule} from 'ngx-markdown';
import {ProviderHistoryComponent} from './providerHistory/provider-history.component';
import {ProviderFullHistoryComponent} from './providerHistory/provider-full-history.component';
import {HighchartsChartModule} from "highcharts-angular";
import {TrainingResourcesComponent} from "./trainingResources/training-resources.component";
import {GuidelinesComponent} from "./guidelines/guidelines.component";
import {DeployableServicesComponent} from "./deployable-services/deployable-services.component";
import {ProviderAccountingStatsComponent} from "./providerAccountingStats/provider-accounting-stats.component";

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ProviderDashboardRouting,
    ReusableComponentsModule,
    HighchartsChartModule,
    ProviderInfoComponent,
    // MarkdownModule.forChild(),

  ],
  declarations: [
    DashboardComponent,
    ProviderStatsComponent,
    ProviderAccountingStatsComponent,
    ProviderHistoryComponent,
    ProviderFullHistoryComponent,
    ServicesComponent,
    TrainingResourcesComponent,
    DeployableServicesComponent,
    GuidelinesComponent,
    MessagesComponent,
    // ServiceStatsComponent
  ]
})

export class ProviderDashboardModule {
}
