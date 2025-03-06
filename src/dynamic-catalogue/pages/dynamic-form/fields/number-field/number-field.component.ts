import {Component, EventEmitter, OnInit, Output} from "@angular/core";
import {Field, HandleBitSet} from "../../../../domain/dynamic-form-model";
import { BaseFieldComponent } from "../base-field.component";

@Component({
  selector: 'app-number-field',
  templateUrl: './number-field.component.html'
})

export class NumberFieldComponent extends BaseFieldComponent implements OnInit {

  @Output() handleBitSets = new EventEmitter<Field>();
  @Output() handleBitSetsOfComposite = new EventEmitter<HandleBitSet>();

  step: string = '';

  ngOnInit() {
    super.ngOnInit();

    if (this.fieldData.typeInfo.values) {
      this.step = this.fieldData.typeInfo.values[0]
    }
  }

  /** check fields validity--> **/

  // checkFormValidity(): boolean {
  //   return !( this.formControl.valid || this.formControl.pristine);
  // }

  /** Bitsets--> **/
  updateBitSet(fieldData: Field) {
    if (fieldData.form.mandatory) {
      this.handleBitSets.emit(fieldData);
    }
  }

  /** other stuff--> **/
  getNumberOfDecimals() {
    if (this.fieldData.typeInfo.values) {
      return this.fieldData.typeInfo.values[0].split('.')[1].length;
    }
    return 0
  }

}
