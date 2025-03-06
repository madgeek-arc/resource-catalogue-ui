import {Component, Input, OnChanges, SimpleChanges} from "@angular/core";
import {UntypedFormArray, UntypedFormBuilder, UntypedFormGroup} from "@angular/forms";
import {Field, Model, Section} from "../../../../domain/dynamic-form-model";
import {FormControlService} from "../../../../services/form-control.service";

@Component({
  selector: 'app-compare-surveys',
  templateUrl: 'compare-surveys.component.html',
  providers: [FormControlService]
})

export class CompareSurveysComponent implements OnChanges{

  @Input() payloadA: any = null;
  @Input() payloadB: any = null;
  @Input() entryA: any = null;
  @Input() entryB: any = null;
  @Input() model: Model = null;
  @Input() subType: string = null;
  @Input() vocabulariesMap: Map<string, object[]> = null;
  @Input() subVocabularies: Map<string, object[]> = null;
  @Input() tabsHeader: string = null;

  ready = false;

  formA = this.fb.group({});
  formB = this.fb.group({});

  constructor(private formControlService: FormControlService, private fb: UntypedFormBuilder,) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.model && this.payloadA?.answer) {
      this.createForm(this.formA);
      this.patchForm(this.formA, this.payloadA.answer);
      if (this.payloadB?.answer) {
        this.createForm(this.formB);
        this.patchForm(this.formB, this.payloadB.answer);
      }
      this.ready = true;
    } else {
      this.formA = this.fb.group({});
      this.formB = this.fb.group({});
    }
  }

  createForm(form: UntypedFormGroup) {
    this.model.sections = this.model.sections.sort((a, b) => a.order - b.order);

    for (let i = 0; i < this.model.sections.length; i++) {
      if (this.model.sections[i].subSections === null) {
        form.addControl(this.model.name, this.formControlService.toFormGroup(this.model.sections, true));
        break;
      }
      if (!this.model.sections[i].subType || this.model.sections[i].subType === this.subType) {
        form.addControl(this.model.sections[i].name, this.formControlService.toFormGroup(this.model.sections[i].subSections, true));
      }
    }

  }

  patchForm(form: UntypedFormGroup, payload: Object) {
    for (let i = 0; i < this.model.sections.length; i++) {
      if (payload[this.model.sections[i].name])
        this.prepareForm(form, payload[this.model.sections[i].name], this.model.sections[i].subSections);
    }
    form.patchValue(payload);
    setTimeout(() => {
      form.disable();
      form.markAsUntouched();
    }, 2000);
  }

  getFormGroup(form: UntypedFormGroup, sectionIndex: number): UntypedFormGroup {
    if (this.model.sections[sectionIndex].subSections === null) {
      return form.get(this.model.name) as UntypedFormGroup;
    } else
      // console.log(this.form.get(this.survey.sections[sectionIndex].name));
      return form.get(this.model.sections[sectionIndex].name) as UntypedFormGroup;
  }


  /** create additional fields for arrays if needed --> **/
  prepareForm(form: UntypedFormGroup, answer: Object, fields: Section[], arrayIndex?: number) { // I don't think it will work with greater depth than 2 of array nesting
    for (const [key, value] of Object.entries(answer)) {
      if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
        this.prepareForm(form, value, fields);
      } else if (Array.isArray(value)) {
        if (value?.length > 1) {
          this.pushToFormArray(form, key, value.length, arrayIndex);
        }
        for (let i = 0 ;i < value?.length; i++) {
          if (typeof value[i] === 'object' && !Array.isArray(value[i]) && value[i] !== null) {
            this.prepareForm(form, value[i], fields, i);
          }
          // Maybe a check for array in array should be here
        }
      } else if (value === null) {
        // console.log(key+ ' is null');
      }
    }
  }

  pushToFormArray(form: UntypedFormGroup, name: string, length: number, arrayIndex?: number) {
    let field = this.getModelData(this.model.sections, name);
    while (this.getFormControl(form, name, arrayIndex).length < length) {
      // for (let i = 0; i < length-1; i++) {
      this.getFormControl(form, name, arrayIndex).push(this.formControlService.createField(field));
    }
  }

  getModelData(model: Section[], name: string): Field {
    let field = null;
    for (let i = 0; i < model.length; i++) {
      if (model[i].fields === null) {
        field = this.getModelData(model[i].subSections, name);
        if (field) {
          return field;
        }
      } else {
        field = this.searchSubFields(model[i].fields, name);
        if (field) {
          return field;
        }
      }
    }
    return field;
  }

  searchSubFields(fields: Field[], name): Field | null {
    let field = null;
    for (let j = 0; j < fields.length; j++) {
      if(fields[j].name === name) {
        return fields[j];
      } else if (fields[j].subFields?.length > 0) {
        field = this.searchSubFields(fields[j].subFields, name);
        if (field?.name === name)
          return field;
      }
    }
    return null;
  }

  getFormControl(group: UntypedFormGroup | UntypedFormArray, name: string, position?: number): UntypedFormArray {
    let abstractControl = null;
    for (const key in group.controls) {
      abstractControl = group.controls[key];
      if (abstractControl instanceof UntypedFormGroup || abstractControl instanceof UntypedFormArray) {
        if (key === name) {
          return abstractControl as UntypedFormArray;
        } else if (key !== name) {
          if (abstractControl instanceof UntypedFormArray) {
            if (abstractControl.controls.length > position) {
              abstractControl = this.getFormControl(abstractControl.controls[position] as UntypedFormGroup | UntypedFormArray, name, position);
              if (abstractControl !== null)
                return abstractControl;
            } else {
              abstractControl = null;
            }
          } else {
            abstractControl = this.getFormControl(abstractControl, name, position);
            if (abstractControl !== null)
              return abstractControl;
          }
        }
      } else {
        if (key === name) {
          return abstractControl;
        }
        abstractControl = null;
      }
    }
    return abstractControl;
  }
  /** <-- create additional fields for arrays if needed **/

}
