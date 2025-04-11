import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from "../../shared/shared.module";
import {HighchartsChartModule} from 'highcharts-angular';
import {NgSelectModule} from '@ng-select/ng-select';
import {LMarkdownEditorModule} from 'ngx-markdown-editor';
import {MarkdownModule} from "ngx-markdown";
import {GuidelinesRouting} from "./guidelines.routing";
import {GuidelinesFormComponent} from "./guidelines-form.component";
import {GuidelinesListComponent} from "../admin/guidelines-list.component";
import {UpdateGuidelinesFormComponent} from "./update-guidelines-form.component";
import {DynamicFormModule} from "../../../dynamic-catalogue/pages/dynamic-form/dynamic-form.module";


@NgModule({
    imports: [
        SharedModule,
        CommonModule,
        FormsModule,
        LMarkdownEditorModule,
        ReactiveFormsModule,
        GuidelinesRouting,
        HighchartsChartModule,
        NgSelectModule,
        MarkdownModule,
        DynamicFormModule,

    ],
  declarations: [
    GuidelinesFormComponent,
    UpdateGuidelinesFormComponent,


    GuidelinesListComponent,
  ]
})

export class GuidelinesModule {
}
