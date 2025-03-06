import { Component, DestroyRef, EventEmitter, inject, Input, OnInit, Output } from "@angular/core";
import { AbstractControl, FormArray, FormGroup, FormGroupDirective, UntypedFormArray, UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import { Field } from "../../../domain/dynamic-form-model";
import { WebsocketService } from "../../../../app/services/websocket.service";
import { FormControlService } from "../../../services/form-control.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { cloneDeep, isEqual } from 'lodash';

interface PositionChange {
  oldIndex: number;
  newIndex: number;
  element: HTMLElement;
}

@Component({
  template: ``,
  styles: ['.clear-style { height: 0 !important;}'],
})

export class BaseFieldComponent implements OnInit {

  protected destroyRef = inject(DestroyRef);

  @Input() fieldData: Field;
  @Input() editMode: boolean;
  @Input() readonly: boolean = null;
  @Input() position?: number = null;

  @Output() hasChanges = new EventEmitter<boolean>();

  formControl!: UntypedFormControl;
  form!: UntypedFormGroup;
  previousValue!: any;
  inputId!: string;
  hideField: boolean = null;

  constructor(protected rootFormGroup: FormGroupDirective, protected formControlService: FormControlService,
              private wsService: WebsocketService) {}

  ngOnInit() {
    if (this.position !== null) {
      this.form = this.rootFormGroup.control.controls[this.position] as UntypedFormGroup;
    } else {
      this.form = this.rootFormGroup.control;
    }
    // console.log(this.form);
    this.formControl = this.form.get(this.fieldData.name) as UntypedFormControl;
    this.inputId = this.getPath(this.formControl).join('.');

    if (this.fieldData.form.dependsOn) {
      // console.log(this.fieldData.form.dependsOn);
      this.enableDisableField(this.form.get(this.fieldData.form.dependsOn.name).value, this.fieldData.form.dependsOn.value);

      this.form.get(this.fieldData.form.dependsOn.name).valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
        value => {
          this.enableDisableField(value, this.fieldData.form.dependsOn.value);
        },
        error => {console.error(error)}
      );
    }
  }

  /** Field focus -------------------------------------------------------------------------------------------------> **/
  focus(position?: number) {
    if (!this.editMode)
      return;

    // console.log('Field focus In');
    this.previousValue = cloneDeep(this.formControl.value);
    if (this.formControl instanceof FormArray) {
      this.wsService.WsFocus(this.getPath(this.formControl.controls[position]).join('.'), null);
    } else
      this.wsService.WsFocus(this.getPath(this.formControl).join('.'), null);
  }

  focusOut(skip: boolean, position?: number) {
    if (!this.editMode)
      return;

    // console.log('Field focus Out');
    this.wsService.WsFocus(null, null);
    if (isEqual(this.previousValue, this.formControl.value) || skip)
      return;

    if (this.formControl instanceof FormArray) {
      // send full array or single input?
      // this.wsService.WsEdit({field: this.getPath(this.formControl.controls[position]).join('.'), value: this.formControl.value});
      this.wsService.WsEdit({field: this.getPath(this.formControl.controls[position]).join('.'), value: this.formControl.controls[position].value});
    } else
      this.wsService.WsEdit({field: this.getPath(this.formControl).join('.'), value: this.formControl.value});
  }
  /** <------------------------------------------------------------------------------------------------- Field focus **/

  /** Form control path -------------------------------------------------------------------------------------------> **/
  getPath(control: AbstractControl): string[] {
    const path: string[] = [];
    let currentControl: AbstractControl | null = control;

    // Traverse up the tree until reaching the root
    while (currentControl && currentControl.parent) {
      if (currentControl.parent instanceof FormArray) {
        const index = '['+this.findIndexInFormArray(currentControl.parent, currentControl)+']';
        path.unshift(index.toString());
      } else {
        const parent = currentControl.parent;
        const index = this.findIndexInParent(parent, currentControl);
        path.unshift(index);
      }
      currentControl = currentControl.parent;
      // console.log(path);
    }

    return path;
  }

  findIndexInParent(parent: FormGroup | FormArray, control: AbstractControl): string {
    const keys = Object.keys(parent.controls);
    for (let i = 0; i < keys.length; i++) {
      if (parent.controls[keys[i]] === control) {
        return keys[i];
      }
    }
    return '';
  }

  findIndexInFormArray(formArray: FormArray, control: AbstractControl): number {
    const index = formArray.controls.findIndex(c => c === control);
    return index >= 0 ? index : -1;
  }
  /** <------------------------------------------------------------------------------------------- Form control path **/

  /** Handle Arrays --> **/
  fieldAsFormArray() {
    return this.formControl as unknown as UntypedFormArray;
  }

  push() {
    this.fieldAsFormArray().push(this.formControlService.createField(this.fieldData), {emitEvent: false});
    if (this.formControl instanceof FormArray) {
      this.wsService.WsEdit({
        field: this.getPath(this.formControl.controls[this.fieldAsFormArray().length-1]).join('.'),
        value: this.formControl.controls[this.fieldAsFormArray().length-1].value,
        action: {type: 'ADD'}
      });
    }
  }

  remove(i: number) {

    let path;
    if (this.formControl instanceof FormArray)
      path = this.getPath(this.formControl.controls[i]).join('.');

    this.fieldAsFormArray().removeAt(i, {emitEvent: false});
    if (this.formControl instanceof FormArray) {
      this.wsService.WsEdit({
        field: path,
        value: null,
        action: {type: 'DELETE', index: i}
      });
    }
  }


  onPositionChanged(change: PositionChange): void {
    console.log(`Element ${change.element.id} moved from index ${change.oldIndex} to ${change.newIndex}`);
    this.move(change.newIndex, change.oldIndex)
  }

  move(newIndex: number, oldIndex: number) {
    const formArray: UntypedFormArray = this.fieldAsFormArray();
    const currentControl: AbstractControl = formArray.at(oldIndex);
    let path;
    if (this.formControl instanceof FormArray) {
      path = this.getPath(this.formControl.controls[oldIndex]).join('.');
    }
    console.log(this.formControl);
    console.log(path);

    formArray.removeAt(oldIndex, {emitEvent: false});
    formArray.insert(newIndex, currentControl, {emitEvent: false})

    this.wsService.WsEdit({
      field: path,
      value: null,
      action: {type:'MOVE', index: newIndex}
    });
  }

  /** check fields validity --> **/
  checkFormValidity(): boolean {
    return (!this.formControl.valid && (this.formControl.touched || this.formControl.dirty));
  }

  checkFormArrayValidity(position: number): boolean {
    const formControl: AbstractControl = this.fieldAsFormArray()?.get([position]);
    // console.log(formControl);
    // console.log(position);
    if (formControl)
      return (!formControl.valid && (formControl.touched || formControl.dirty));
    else
      return false
  }

  /** Other -------------------------------------------------------------------------------------------------------> **/
  enableDisableField(value: string | number, enableValue: string) {
    if (value?.toString() == enableValue) {
      this.formControl.enable();
      this.hideField = false;
    } else {
      this.formControl.disable();
      this.formControl.reset();
      this.hideField = true;
      // maybe add this if the remaining empty fields are a problem
      // (this.formControl as unknown as FormArray).clear();
    }
  }

  unsavedChangesPrompt() {
    this.hasChanges.emit(true);
  }

  timeOut(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}

