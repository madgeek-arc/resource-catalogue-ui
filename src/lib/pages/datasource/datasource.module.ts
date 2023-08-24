import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HighchartsChartModule} from 'highcharts-angular';
import {SharedModule} from '../../shared/shared.module';
import {DatasourceRouting} from "./datasource.routing";
import {ReusableComponentsModule} from '../../shared/reusablecomponents/reusable-components.module';
import {NgSelectModule} from '@ng-select/ng-select';
import {LMarkdownEditorModule} from 'ngx-markdown-editor';
import {DatasourceSelectComponent} from "../provider/dashboard/datasources/datasource-select.component";
import {DatasourceSubmittedComponent} from "./datasource-submitted.component";
import {DatasourceSubprofileFormComponent} from "../provider-resources/service-subprofiles/datasource-subprofile-form.component";
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
    DatasourceSubprofileFormComponent,
    DatasourceSelectComponent,
    DatasourceSubmittedComponent
  ]
})

export class DatasourceModule {
}
