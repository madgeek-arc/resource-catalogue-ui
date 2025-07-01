import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HighchartsChartModule } from 'highcharts-angular';
import {SharedModule} from '../../../../shared/shared.module';
import {ReusableComponentsModule} from '../../../../shared/reusablecomponents/reusable-components.module';
import {ServiceStatsComponent} from './service-stats.component';
import {ServiceHistoryComponent} from './service-history.component';
import {ServiceFullHistoryComponent} from './service-full-history.component';
import {ResourceDashboardRouting} from './resource-dashboard.routing';
import {ResourceDashboardComponent} from './resource-dashboard.component';
import {MonitoringInfoComponent} from "./monitoring-info.component";
import {ResourceGuidelinesFormComponent} from "../../../provider-resources/resource-guidelines/resource-guidelines-form.component";
import {NgSelectModule} from "@ng-select/ng-select";
import {ConfigurationTemplatesComponent} from "./configuration-templates.component";
import {DynamicFormModule} from "../../../../../dynamic-catalogue/pages/dynamic-form/dynamic-form.module";

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ResourceDashboardRouting,
    ReusableComponentsModule,
    HighchartsChartModule,
    NgSelectModule,
    DynamicFormModule
  ],
  declarations: [
    ResourceDashboardComponent,
    ServiceStatsComponent,
    ServiceHistoryComponent,
    ServiceFullHistoryComponent,
    MonitoringInfoComponent,
    ResourceGuidelinesFormComponent,
    ConfigurationTemplatesComponent
  ]
})

export class ResourceDashboardModule {
}
