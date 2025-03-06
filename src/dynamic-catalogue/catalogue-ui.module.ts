import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DynamicFormModule } from "./pages/dynamic-form/dynamic-form.module";
import { CatalogueUiReusableComponentsModule } from "./shared/reusable-components/catalogue-ui-reusable-components.module";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormBuilderModule } from "./pages/form-builder/form-builder.module";

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    CatalogueUiReusableComponentsModule,
    DynamicFormModule,
    FormBuilderModule
  ],
  providers: [],
  exports: [
    DynamicFormModule
  ]
})

export class CatalogueUiModule { }
