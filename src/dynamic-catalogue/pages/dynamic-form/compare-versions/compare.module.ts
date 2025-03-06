import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {CompareSurveysComponent} from "./surveys/compare-surveys.component";
import {CompareChapterComponent} from "./chapters/compare-chapter.component";
import {ReactiveFormsModule} from "@angular/forms";
import {DynamicFormModule} from "../dynamic-form.module";

@NgModule({
  declarations: [
    CompareSurveysComponent,
    CompareChapterComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicFormModule
  ],
  exports: [
    CompareSurveysComponent
  ]
})

export class CompareModule {}
