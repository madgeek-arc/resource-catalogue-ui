import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from "../../shared/shared.module";
import {HighchartsChartModule} from 'highcharts-angular';
import {NgSelectModule} from '@ng-select/ng-select';
import {LMarkdownEditorModule} from 'ngx-markdown-editor';
import {MarkdownModule} from "ngx-markdown";
import {AdaptersRouting} from "./adapters.routing";
import {AdaptersFormComponent} from "./adapters-form.component";
import {DynamicFormModule} from "../../../dynamic-catalogue/pages/dynamic-form/dynamic-form.module";
import {AdaptersListComponent} from "../admin/adapters-list.component";
import {MyAdaptersComponent} from "./my-adapters.component";
import {ReusableComponentsModule} from "../../shared/reusablecomponents/reusable-components.module";


@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    LMarkdownEditorModule,
    ReactiveFormsModule,
    AdaptersRouting,
    HighchartsChartModule,
    NgSelectModule,
    MarkdownModule,
    DynamicFormModule,
    ReusableComponentsModule
  ],
  declarations: [
    AdaptersFormComponent,
    MyAdaptersComponent,
    AdaptersListComponent
  ]
})

export class AdaptersModule {
}
