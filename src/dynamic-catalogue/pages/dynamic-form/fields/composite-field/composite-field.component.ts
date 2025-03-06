import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {Field, HandleBitSet} from "../../../../domain/dynamic-form-model";
import {
  UntypedFormArray,
  UntypedFormGroup,
  FormGroupDirective,
  FormArray, FormGroup, AbstractControl
} from "@angular/forms";
import {FormControlService} from "../../../../services/form-control.service";
import { WebsocketService } from "../../../../../app/services/websocket.service";

interface PositionChange {
  oldIndex: number;
  newIndex: number;
  element: HTMLElement;
}

@Component({
  selector: 'app-composite-field',
  templateUrl: './composite-field.component.html'
})

export class CompositeFieldComponent implements OnInit {
  @Input() fieldData: Field;
  @Input() vocabularies: Map<string, object[]>;
  @Input() subVocabularies: Map<string, object[]> = null;
  @Input() editMode: any;
  @Input() readonly : boolean = null;
  @Input() position?: number = null;

  @Output() hasChanges = new EventEmitter<boolean>();
  @Output() handleBitSets = new EventEmitter<Field>();
  @Output() handleBitSetsOfComposite = new EventEmitter<HandleBitSet>();

  form: UntypedFormGroup;
  hideField: boolean = null;

  constructor(private rootFormGroup: FormGroupDirective, private formService: FormControlService,
              private wsService: WebsocketService) {
  }

  ngOnInit() {
    // console.log(this.fieldData.name);
    if (this.position !== null) {
      // console.log(this.rootFormGroup.control.controls[this.position]);
      // console.log(this.rootFormGroup.control.controls[this.position].get(this.fieldData.name));
      this.form = this.rootFormGroup.control.controls[this.position].get(this.fieldData.name) as UntypedFormGroup;
    } else {
      this.form = this.rootFormGroup.control.get(this.fieldData.name) as UntypedFormGroup;
      // console.log(this.form);
    }
    // console.log(this.form);
    if(this.fieldData.form.dependsOn) { // specific changes for composite field, maybe revise it
      this.enableDisableField(this.rootFormGroup.form.get(this.fieldData.form.dependsOn.name).value);

      this.rootFormGroup.form.get(this.fieldData.form.dependsOn.name).valueChanges.subscribe(value => {
        this.enableDisableField(value);
      });
    }
  }

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
    return this.form as unknown as UntypedFormArray;
  }

  remove(i: number) {
    let path = this.getPath(this.form.controls[i]).join('.');
    console.log(path);
    this.fieldAsFormArray().removeAt(i, {emitEvent: false});
    if (this.form instanceof FormArray) {
      this.wsService.WsEdit({
        field: path,
        value: null,
        action: {type: 'DELETE', index: i}
      });
    }
  }

  pushComposite(compositeField: Field) {
    // console.log(path);
    this.fieldAsFormArray().push(this.formService.createCompositeField(compositeField), {emitEvent: false});
    if (this.form instanceof FormArray) {
      this.wsService.WsEdit({
        field: this.getPath(this.form.controls[this.fieldAsFormArray().length-1]).join('.'),
        value: this.form.controls[this.fieldAsFormArray().length-1].value,
        action: {type: 'ADD'}
      });
    }
  }

  /** <-- Handle Arrays **/

  /** Detect position change **/
  onPositionChanged(change: PositionChange): void {
    console.log(`Element ${change.element.id} moved from index ${change.oldIndex} to ${change.newIndex}`);
    this.move(change.newIndex, change.oldIndex)
  }

  move(newIndex: number, oldIndex: number) {
    const formArray = this.fieldAsFormArray();
    const currentGroup = formArray.at(oldIndex);
    const path = this.getPath(this.form.controls[oldIndex]).join('.');

    formArray.removeAt(oldIndex, {emitEvent: false});
    formArray.insert(newIndex, currentGroup, {emitEvent: false});

    this.wsService.WsEdit({
      field: path,
      value: null,
      action: {type: 'MOVE', index: newIndex}
    });
  }

  /** check form fields and tabs validity--> **/

  checkFormValidity(name: string, edit: boolean): boolean {
    return (!this.form.get(name).valid && (edit || this.form.get(name).dirty));
  }

  /** <-- check form fields and tabs validity **/

  /** Handle Bitsets--> **/

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
    if (value === 'Applicable' || value === 'Yes') {
      this.form.enable();
      this.hideField = false;
      this.fieldData.form.display.visible = true;

    } else {
      this.form.disable();
      this.form.reset();
      this.hideField = true;
      this.fieldData.form.display.visible = false;
      // maybe add this if the remaining empty fields are a problem
      // (this.formControl as unknown as FormArray).clear();

    }
  }
}
