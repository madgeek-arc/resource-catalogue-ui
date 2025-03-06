import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {FormControlService} from '../../services/form-control.service';
import {ActivatedRoute, Router} from '@angular/router';
import {UntypedFormArray, UntypedFormBuilder} from '@angular/forms';
import {Section, Field, HandleBitSet, Tab, Tabs} from '../../domain/dynamic-form-model';
import BitSet from "bitset";

import UIkit from 'uikit';

@Component({
  selector: 'app-chapter-edit',
  templateUrl: './chapter.component.html',
  providers: [FormControlService]
})
export class ChapterEditComponent implements OnChanges{

  @Input() form: any = null;
  @Input() tabsHeader: string;
  @Input() mandatoryFieldsText: string = null;
  @Input() editMode: boolean = null;
  @Input() readonly: boolean = null;
  @Input() validate: boolean = null;
  @Input() vocabularies: Map<string, object[]> = null;
  @Input() subVocabularies: Map<string, object[]> = null;
  @Input() chapter: Section = null;
  @Input() fields: Section[] = null;

  @Output() chapterHasChanges = new EventEmitter<string[]>();
  @Output() submit = new EventEmitter();

  bitset: Tabs = new Tabs;
  errorMessage = '';
  successMessage = '';
  ready = false;
  showLoader = false;
  hasChanges = false;
  pendingService = false;

  showBitsets = false;
  loaderBitSet = new BitSet;
  loaderPercentage = 0;
  tabIndex= 0;

  constructor(public route: ActivatedRoute,
              protected fb: UntypedFormBuilder,
              protected router: Router) {
  }

  ngOnInit() {
  }

  ngOnChanges(changes:SimpleChanges) {
    if (this.fields) {
      this.initializations();
      this.ready = true
    }
  }

  onSubmit(tempSave: boolean, pendingService?: boolean) {
    // if (this.form.valid) {
    window.scrollTo(0, 0);
    this.submit.emit(null);
  }

  initializations() {
    /** Initialize tab bitsets **/
    let requiredTabs = 0, requiredTotal = 0;
    let obj = new Map();
    this.fields.forEach(group => {
      let tab = new Tab();
      tab.requiredOnTab = tab.remainingOnTab = group.required.topLevel;
      tab.valid = false;
      tab.order = group.order;
      tab.bitSet = new BitSet;
      // obj[group.group.id] = tab;
      obj.set(group.id, tab);
      if (group.required.topLevel > 0) {
        requiredTabs++;
      }
      requiredTotal += group.required.total;
    });
    this.bitset.tabs = obj;
    this.bitset.completedTabs = 0;
    this.bitset.completedTabsBitSet = new BitSet;
    this.bitset.requiredTabs = requiredTabs;
    this.bitset.requiredTotal = requiredTotal;
  }

  /** Bitsets-->**/
  timeOut(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  handleBitSetOfComposite(data: HandleBitSet) {
    let field = data.field;
    let pos = data.position;
    // console.log(field.name);

    if (field.typeInfo.multiplicity) {
      let formArray = this.form.get(field.accessPath) as UntypedFormArray;
      let flag = false;
      for (let i = 0; i < formArray.length; i++) {
        if (formArray.controls[i].valid) {
          flag = true;
          field.subFields.forEach(f => {
            if (f.form.mandatory)
              this.loaderBitSet.set(parseInt(f.id), 1);
          });
          this.decreaseRemainingFieldsPerTab(field.form.group, field.form.display.order);
          break;
        }
      }
      if (!flag) {
        // console.log('didn't find valid array field')
        let found = new Array(field.subFields.length);
        for (let j = 0; j < field.subFields.length; j++) {
          for (let i = 0; i < formArray.length; i++) {
            if (field.subFields[j].form.mandatory && formArray.controls[i].get(field.subFields[j].name).valid) {
              found[j] = true;
              break;
            }
          }
        }
        for (let i = 0; i < found.length; i++) {
          if (!found[i]) {
            this.loaderBitSet.set(parseInt(field.subFields[i].id), 0);
          } else {
            this.loaderBitSet.set(parseInt(field.subFields[i].id), 1);
          }
        }
        this.increaseRemainingFieldsPerTab(field.form.group, field.form.display.order);
      }
    } else if (field.subFields[pos].form.mandatory) {
      if (this.form.get(field.subFields[pos].accessPath).valid) {
        this.loaderBitSet.set(parseInt(field.subFields[pos].id), 1);
        if (this.form.get(field.accessPath).valid) {
          this.decreaseRemainingFieldsPerTab(field.form.group, field.form.display.order);
        } else {
          this.increaseRemainingFieldsPerTab(field.form.group, field.form.display.order);
        }
      } else {
        this.loaderBitSet.set(parseInt(field.subFields[pos].id), 0);
        if (this.form.get(field.accessPath).valid) {
          this.decreaseRemainingFieldsPerTab(field.form.group, field.form.display.order);
        } else {
          this.increaseRemainingFieldsPerTab(field.form.group, field.form.display.order);
        }
      }
    }
    this.updateLoaderPercentage();
  }

  handleBitSet(data: Field) {
    // console.log(data.name);
    if (data.typeInfo.multiplicity) {
      this.handleBitSetOfGroup(data);
      return;
    }
    // console.log(this.form.get(data.accessPath).valid);
    if (this.form.get(data.accessPath).valid) {
      this.decreaseRemainingFieldsPerTab(data.form.group, data.form.display.order);
      this.loaderBitSet.set(parseInt(data.id), 1);
    } else if (this.form.get(data.accessPath).invalid) {
      this.increaseRemainingFieldsPerTab(data.form.group, data.form.display.order);
      this.loaderBitSet.set(parseInt(data.id), 0);
    } else if (this.form.get(data.accessPath).pending) {
      this.timeOut(300).then(() => this.handleBitSet(data));
      return;
    }
    this.updateLoaderPercentage();
  }

  handleBitSetOfGroup(data: Field) {
    let formArray = this.form.get(data.accessPath) as UntypedFormArray;
    let flag = false;
    for (let i = 0; i < formArray.length; i++) {
      if (formArray.controls[i].valid) {
        flag = true;
        this.decreaseRemainingFieldsPerTab(data.form.group, data.form.display.order);
        this.loaderBitSet.set(parseInt(data.id), 1);
        break;
      } else if (formArray.controls[i].pending) {
        this.timeOut(300).then(() => this.handleBitSetOfGroup(data));
        return;
      }
    }
    if (!flag) {
      this.increaseRemainingFieldsPerTab(data.form.group, data.form.display.order);
      this.loaderBitSet.set(parseInt(data.id), 0);
    }
    this.updateLoaderPercentage();
  }

  updateLoaderPercentage() {
    // console.log(this.loaderBitSet.toString(2));
    // console.log('cardinality: ', this.loaderBitSet.cardinality());
    this.loaderPercentage = Math.round((this.loaderBitSet.cardinality() / this.bitset.requiredTotal) * 100);
    // console.log(this.loaderPercentage, '%');
  }

  decreaseRemainingFieldsPerTab(tabId: string, bitIndex: number) {
    this.bitset.tabs.get(tabId).bitSet.set(bitIndex, 1);
    this.bitset.tabs.get(tabId).remainingOnTab = this.bitset.tabs.get(tabId).requiredOnTab - this.bitset.tabs.get(tabId).bitSet.cardinality();
    if (this.bitset.tabs.get(tabId).remainingOnTab === 0 && this.bitset.completedTabsBitSet.get(this.bitset.tabs.get(tabId).order) !== 1) {
      this.calcCompletedTabs(tabId, 1);
    }
  }

  increaseRemainingFieldsPerTab(tabId: string, bitIndex: number) {
    this.bitset.tabs.get(tabId).bitSet.set(bitIndex, 0);
    this.bitset.tabs.get(tabId).remainingOnTab = this.bitset.tabs.get(tabId).requiredOnTab - this.bitset.tabs.get(tabId).bitSet.cardinality();
    if (this.bitset.completedTabsBitSet.get(this.bitset.tabs.get(tabId).order) !== 0) {
      this.calcCompletedTabs(tabId, 0);
    }
  }

  calcCompletedTabs(tabId: string, setValue: number) {
    if (tabId && this.bitset.tabs.get(tabId).order) {
      this.bitset.completedTabsBitSet.set(this.bitset.tabs.get(tabId).order, setValue);
      this.bitset.completedTabs = this.bitset.completedTabsBitSet.cardinality();
    }
  }

  /** <--Bitsets**/

  /** tab prev next buttons **/
  setTabIndex(i: number) {
    this.tabIndex = i;
  }

  goToTab(i: number) {
    if (i === -1 || i === this.bitset.tabs.size) {
      return;
    }
    this.tabIndex = i;
    let element: HTMLElement = document.getElementById(this.chapter.id + '-tab' + i) as HTMLElement
    element.click();
    // console.log(element)
  }

  /** emit changes-->**/
  unsavedChangesPrompt(e: boolean, removeChanges: string = null){
    if (e) {
      this.chapterHasChanges.emit([this.chapter.id, removeChanges]);
    }
  }
  /** <--emit changes**/

}
