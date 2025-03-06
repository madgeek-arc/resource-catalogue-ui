import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {Field, HandleBitSet} from "../../../../domain/dynamic-form-model";
import {UntypedFormArray, UntypedFormControl, UntypedFormGroup, FormGroupDirective, Validators} from "@angular/forms";
import {FormControlService} from "../../../../services/form-control.service";
import {URLValidator} from "../../../../shared/validators/generic.validator";

@Component({
  selector: 'app-vocabulary-field',
  templateUrl: './vocabulary-field.component.html',
  styleUrls: ['./vocabulary-field.component.scss']
})

export class VocabularyFieldComponent implements OnInit {
  @Input() fieldData: Field;
  @Input() vocabularies: Map<string, object[]> = null;
  @Input() subVocabularies: Map<string, object[]> = null;
  @Input() editMode: any;
  @Input() position?: number = null;

  @Output() hasChanges = new EventEmitter<boolean>();
  @Output() handleBitSets = new EventEmitter<Field>();
  @Output() handleBitSetsOfComposite = new EventEmitter<HandleBitSet>();

  formControl!: UntypedFormControl;
  form!: UntypedFormGroup;

  dynamicVoc: object[] = [];

  constructor(private rootFormGroup: FormGroupDirective, private formControlService: FormControlService) {
  }

  ngOnInit() {
    if (this.position !== null) {
      this.form = this.rootFormGroup.control.controls[this.position] as UntypedFormGroup;
    } else {
      this.form = this.rootFormGroup.control;
    }
    this.formControl = this.form.get(this.fieldData.name) as UntypedFormControl;

    if(this.fieldData.form.dependsOn) {
      // console.log(this.fieldData.form.dependsOn);
      this.enableDisableField(this.form.get(this.fieldData.form.dependsOn.name).value);

      this.form.get(this.fieldData.form.dependsOn.name).valueChanges.subscribe(value => {
        this.enableDisableField(value);
      });
    }
    // console.log(this.vocabularies[this.fieldData.typeInfo.vocabulary]);
    // console.log(this.fieldData.name);
    // console.log(this.formControl);
  }

  /** Handle Arrays --> **/

  fieldAsFormArray() {
    return this.formControl as unknown as UntypedFormArray;
  }

  push(field: string, required: boolean, type: string) {
    switch (type) {
      case 'url':
        this.fieldAsFormArray().push(required ? new UntypedFormControl('', Validators.compose([Validators.required, URLValidator]))
          : new UntypedFormControl('', URLValidator));
        break;
      default:
        this.fieldAsFormArray().push(required ? new UntypedFormControl('', Validators.required) : new UntypedFormControl(''));
    }
  }

  remove(field: string, i: number) {
    this.fieldAsFormArray().removeAt(i);
  }

  /** check fields validity--> **/

  checkFormValidity(): boolean {
    return (!this.formControl.valid && (this.formControl.touched || this.formControl.dirty));
  }

  checkFormArrayValidity(name: string, position: number, edit: boolean, groupName?: string): boolean {
    if (groupName) {
      return (!this.fieldAsFormArray()?.get([position])?.get(groupName).valid
        && (edit || this.fieldAsFormArray()?.get([position])?.get(groupName).dirty));

    }
    return (!this.fieldAsFormArray().get([position]).valid
      && (edit || this.fieldAsFormArray().get([position]).dirty));
  }
  /** Bitsets--> **/

  updateBitSet(fieldData: Field) {
    this.timeOut(200).then(() => { // Needed for radio buttons strange behaviour
      if (fieldData.form.mandatory) {
        this.handleBitSets.emit(fieldData);
      }
    });
  }

  /** other stuff--> **/
  unsavedChangesPrompt() {
    this.hasChanges.emit(true);
  }

  timeOut(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  enableDisableField(value) {
    this.dynamicVoc = [];

    if (this.fieldData.form.dependsOn.value) {
      if (value === this.fieldData.form.dependsOn.value) {
        // this.dynamicVoc = this.subVocabularies[value];
        this.formControl.enable();
      } else {
        this.formControl.disable();
        this.formControl.reset();
      }
    } else if (value) {
      this.dynamicVoc = this.subVocabularies[value];
      this.formControl.enable();
    } else {
      this.formControl.disable();
      this.formControl.reset();
    }
  }

}
