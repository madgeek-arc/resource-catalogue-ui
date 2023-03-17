import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HighchartsChartModule } from 'highcharts-angular';
import {SharedModule} from '../../../../shared/shared.module';
import {ReusableComponentsModule} from '../../../../shared/reusablecomponents/reusable-components.module';
import {TrainingResourceDashboardRouting} from './training-resource-dashboard.routing';
import {TrainingResourceDashboardComponent} from "./training-resource-dashboard.component";
import {TrainingResourceStatsComponent} from './training-resource-stats.component';
import {TrainingResourceHistoryComponent} from './training-resource-history.component';
import {TrainingResourceFullHistoryComponent} from './training-resource-full-history.component';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TrainingResourceDashboardRouting,
    ReusableComponentsModule,
    HighchartsChartModule,
  ],
  declarations: [
    TrainingResourceDashboardComponent,
    TrainingResourceStatsComponent,
    TrainingResourceHistoryComponent,
    TrainingResourceFullHistoryComponent
  ]
})

export class TrainingResourceDashboardModule {
}
