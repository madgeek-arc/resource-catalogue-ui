import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HighchartsChartModule } from 'highcharts-angular';
import {SharedModule} from '../../../../shared/shared.module';
import {ReusableComponentsModule} from '../../../../shared/reusablecomponents/reusable-components.module';
import {DatasourceStatsComponent} from './datasource-stats.component';
import {DatasourceHistoryComponent} from './datasource-history.component';
import {DatasourceFullHistoryComponent} from './datasource-full-history.component';
import {DatasourceDashboardRouting} from './datasource-dashboard.routing';
import {SharedDatasourceDashboardComponent} from './shared-datasource-dashboard.component';
import {DatasourceDashboardModule} from "./datasource-dashboard.module";
import {SharedDatasourceDashboardRouting} from "./shared-datasource-dashboard.routing";

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // DatasourceDashboardRouting,
    SharedDatasourceDashboardRouting,
    ReusableComponentsModule,
    HighchartsChartModule,
    // DatasourceDashboardModule
  ],
  declarations: [
    SharedDatasourceDashboardComponent,

  ]
})

export class SharedResourceDashboardModule {
}
