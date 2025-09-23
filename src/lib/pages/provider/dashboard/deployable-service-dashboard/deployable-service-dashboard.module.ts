import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HighchartsChartModule } from 'highcharts-angular';
import {SharedModule} from '../../../../shared/shared.module';
import {ReusableComponentsModule} from '../../../../shared/reusablecomponents/reusable-components.module';
import {DeployableServiceDashboardRouting} from './deployable-service-dashboard.routing';
import {DeployableServiceDashboardComponent} from "./deployable-service-dashboard.component";
import {DeployableServiceHistoryComponent} from './deployable-service-history.component';
import {DeployableServiceFullHistoryComponent} from './deployable-service-full-history.component';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DeployableServiceDashboardRouting,
    ReusableComponentsModule,
    HighchartsChartModule,
  ],
  declarations: [
    DeployableServiceDashboardComponent,
    DeployableServiceHistoryComponent,
    DeployableServiceFullHistoryComponent
  ]
})

export class DeployableServiceDashboardModule {
}
