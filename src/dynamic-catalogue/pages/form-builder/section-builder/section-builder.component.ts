import {Component, Input} from "@angular/core";
import {GroupedFields, Section} from "../../../domain/dynamic-form-model";
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-section-builder',
  templateUrl: 'section-builder.component.html'
})

export class SectionBuilderComponent {

  @Input() section: Section;

  public editor = ClassicEditor;

}
