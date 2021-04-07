import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ChartModule} from 'angular2-highcharts';
import {SharedModule} from '../../../../shared/shared.module';
import {ReusableComponentsModule} from '../../../../shared/reusablecomponents/reusable-components.module';
import {ServiceStatsComponent} from './service-stats.component';
import {ServiceHistoryComponent} from './service-history.component';
import {ServiceFullHistoryComponent} from './service-full-history.component';
import {ResourceDashboardRouting} from './resource-dashboard.routing';
import {ResourceDashboardComponent} from './resource-dashboard.component';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ResourceDashboardRouting,
    ReusableComponentsModule,
    ChartModule,
  ],
  declarations: [
    ResourceDashboardComponent,
    ServiceStatsComponent,
    ServiceHistoryComponent,
    ServiceFullHistoryComponent
  ]
})

export class ResourceDashboardModule {
}
