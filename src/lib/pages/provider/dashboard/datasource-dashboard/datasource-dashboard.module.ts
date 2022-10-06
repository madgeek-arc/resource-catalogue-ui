import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HighchartsChartModule } from 'highcharts-angular';
import {SharedModule} from '../../../../shared/shared.module';
import {ReusableComponentsModule} from '../../../../shared/reusablecomponents/reusable-components.module';
import {DatasourceDashboardRouting} from './datasource-dashboard.routing';
import {DatasourceDashboardComponent} from "./datasource-dashboard.component";
import {DatasourceStatsComponent} from './datasource-stats.component';
import {DatasourceHistoryComponent} from './datasource-history.component';
import {DatasourceFullHistoryComponent} from './datasource-full-history.component';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DatasourceDashboardRouting,
    ReusableComponentsModule,
    HighchartsChartModule,
  ],
  declarations: [
    DatasourceDashboardComponent,
    DatasourceStatsComponent,
    DatasourceHistoryComponent,
    DatasourceFullHistoryComponent
  ]
})

export class DatasourceDashboardModule {
}
