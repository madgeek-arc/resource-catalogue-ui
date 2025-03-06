import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormBuilderComponent} from "./form-builder.component";
import {NgSelectModule} from "@ng-select/ng-select";
import {FormsModule} from "@angular/forms";
import {SideMenuComponent} from "./side-menu/side-menu.component";
import {FieldBuilderComponent} from "./field-builder/field-builder.component";
import {SectionBuilderComponent} from "./section-builder/section-builder.component";
import {ChapterBuilderComponent} from "./chapter-builder/chapter-builder.component";
import {CKEditorModule} from "@ckeditor/ckeditor5-angular";
import {TypeSelectorComponent} from "./type-selector-builder/type-selector.component";

@NgModule({
  declarations: [
    FormBuilderComponent,
    SideMenuComponent,
    FieldBuilderComponent,
    SectionBuilderComponent,
    ChapterBuilderComponent,
    TypeSelectorComponent
  ],
  imports: [
    CommonModule,
    NgSelectModule,
    FormsModule,
    CKEditorModule
  ],
})

export class FormBuilderModule {}
