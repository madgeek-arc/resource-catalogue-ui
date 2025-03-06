import {Component, Input, OnInit} from "@angular/core";
import {Field} from "../../../domain/dynamic-form-model";
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-field-builder',
  templateUrl: './field-builder.component.html'
})

export class FieldBuilderComponent implements OnInit {
  @Input() field: Field;

  showDescription = false;
  showSuggestion = false;

  public editor = ClassicEditor;

  ngOnInit() {
  }

  setValues() {
    this.field.typeInfo.values = [];
    if (this.field.typeInfo.type === 'radio' || this.field.typeInfo.type === 'select') {
      this.field.typeInfo.values.push('Option 1')
    }
  }

  showDescriptionField() {
    this.showDescription = !this.showDescription;
    this.field.form.description.text = '';
  }

  showSuggestionField() {
    this.showSuggestion = !this.showSuggestion;
    this.field.form.suggestion.text = '';
  }

}
