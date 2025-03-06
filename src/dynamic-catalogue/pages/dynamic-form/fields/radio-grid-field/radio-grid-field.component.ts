import {Component, Input, OnInit} from "@angular/core";
import {Field} from "../../../../domain/dynamic-form-model";
import {UntypedFormGroup, FormGroupDirective} from "@angular/forms";

@Component({
  selector: 'app-radio-grid',
  templateUrl: './radio-grid-field.component.html'
})

export class RadioGridFieldComponent implements OnInit {
  @Input() fieldData: Field;

  form!: UntypedFormGroup;
  hideField: boolean = null;


  constructor(private rootFormGroup: FormGroupDirective) {
  }

  ngOnInit() {
    this.form = this.rootFormGroup.control;
    // console.log(this.form)
  }
}
