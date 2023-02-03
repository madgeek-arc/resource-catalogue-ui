import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HighchartsChartModule} from 'highcharts-angular';
import {SharedModule} from '../../shared/shared.module';
import {DatasourceRouting} from "./datasource.routing";
import {ReusableComponentsModule} from '../../shared/reusablecomponents/reusable-components.module';
import {DatasourceFormComponent} from "./datasource-form.component";
import {UpdateDatasourceComponent} from "./update-datasource.component";
import {NgSelectModule} from '@ng-select/ng-select';
import {LMarkdownEditorModule} from 'ngx-markdown-editor';
import {DatasourcesComponent} from "../provider/dashboard/datasources/datasources.component";
import {DatasourceSelectComponent} from "../provider/dashboard/datasources/datasource-select.component";
import {DatasourceSubmittedComponent} from "./datasource-submitted.component";
import {MarkdownModule} from "ngx-markdown";


@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    LMarkdownEditorModule,
    ReactiveFormsModule,
    DatasourceRouting,
    ReusableComponentsModule,
    HighchartsChartModule,
    NgSelectModule,
    MarkdownModule,

  ],
  declarations: [
    DatasourceFormComponent,
    UpdateDatasourceComponent,
    DatasourcesComponent,
    DatasourceSelectComponent,
    DatasourceSubmittedComponent
  ]
})

export class DatasourceModule {
}
