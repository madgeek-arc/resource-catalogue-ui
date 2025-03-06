import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {Field, HandleBitSet, UiVocabulary} from "../../../../domain/dynamic-form-model";
import {UntypedFormArray, UntypedFormGroup, FormGroupDirective} from "@angular/forms";
import {FormControlService} from "../../../../services/form-control.service";

@Component({
  selector: 'app-choose-one',
  templateUrl: './choose-one.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ChooseOneComponent implements OnInit {
  @Input() fieldData: Field;
  @Input() vocabularies: Map<string, object[]>;
  @Input() subVocabularies: Map<string, object[]>;
  @Input() editMode: any;
  @Input() position?: number = null;

  @Output() hasChanges = new EventEmitter<boolean>();
  @Output() handleBitSets = new EventEmitter<Field>();
  @Output() handleBitSetsOfComposite = new EventEmitter<HandleBitSet>();

  form: UntypedFormGroup;
  hideField: boolean = null;

  constructor(private rootFormGroup: FormGroupDirective, private formService: FormControlService) {
  }

  ngOnInit() {
    if (this.position !== null) {
      // console.log(this.rootFormGroup.control.controls[this.position]);
      // console.log(this.rootFormGroup.control.controls[this.position].get(this.fieldData.name));
      this.form = this.rootFormGroup.control.controls[this.position].get(this.fieldData.name) as UntypedFormGroup;
    } else {
      this.form = this.rootFormGroup.control.get(this.fieldData.name) as UntypedFormGroup;
    }
    if (this.fieldData.typeInfo.multiplicity){
      this.chooseOne(Object.entries((this.form.controls[0] as UntypedFormGroup).controls)[0][0], 0);
    } else {
      this.chooseOne(Object.entries(this.form.controls)[0][0])
    }
  }

  /** Choose one to show **/
  chooseOne(name: string, index?: number) {
    let tmpGroup: UntypedFormGroup;
    if (index !== undefined) {
      tmpGroup = this.form.controls[index] as UntypedFormGroup;
    } else {
      tmpGroup = this.form;
    }
    for (const control in tmpGroup.controls) {
      tmpGroup.removeControl(control);
    }
    if (this.fieldData.subFields.find(field => field.name === name).typeInfo.type === 'composite')
      tmpGroup.addControl(name, this.formService.createCompositeField(this.fieldData.subFields.find(field => field.name === name)));
    else if (this.fieldData.subFields.find(field => field.name === name).typeInfo.type === 'string') {
      tmpGroup.addControl(name, this.formService.createField(this.fieldData.subFields.find(field => field.name === name)));
    }
  }

  /** Handle Arrays --> **/
  fieldAsFormArray() {
    return this.form as unknown as UntypedFormArray;
  }

  getGroupOfArray(index: number) {
    return this.fieldAsFormArray().controls[index] as UntypedFormGroup;
  }

  remove(i: number) {
    this.fieldAsFormArray().removeAt(i);
  }

  pushComposite(compositeField: Field) {
    this.fieldAsFormArray().push(this.formService.createCompositeField(compositeField));
    this.chooseOne(Object.entries((this.form.controls[this.fieldAsFormArray().length - 1] as UntypedFormGroup).controls)[0][0], this.fieldAsFormArray().length - 1);
  }

  /** <-- Handle Arrays **/

  updateBitSet(fieldData: Field) {
    this.timeOut(200).then(() => { // Needed for radio buttons strange behaviour
      if (fieldData.form.mandatory) {
        this.handleBitSets.emit(fieldData);
      }
    });
  }

  updateBitSetOfComposite(fieldData: Field, position: number) {
    if (fieldData.form.mandatory) {
      let tmp = new HandleBitSet();
      tmp.field = fieldData;
      tmp.position = position;
      this.handleBitSetsOfComposite.emit(tmp);
    }
  }

  handleCompositeBitsetOfChildren(data: HandleBitSet) {
    this.handleBitSetsOfComposite.emit(data);
  }

  handleBitsetOfChildren(data: Field) {
    this.handleBitSets.emit(data);
  }

  /** other stuff--> **/
  unsavedChangesPrompt() {
    this.hasChanges.emit(true);
  }

  timeOut(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  enableDisableField(value) {
    // console.log(value);
    if (value === 'Applicable') {
      this.form.enable();
      this.hideField = false;

    } else {
      this.form.disable();
      this.form.reset();
      this.hideField = true;
      // maybe add this if the remaining empty fields are a problem
      // (this.formControl as unknown as FormArray).clear();

    }
  }
}
