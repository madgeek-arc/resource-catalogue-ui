import {Component, Input, OnChanges, OnInit, SimpleChanges} from "@angular/core";
import {UntypedFormGroup} from "@angular/forms";
import {Section, Tab} from "../../../../domain/dynamic-form-model";
import BitSet from "bitset";

@Component({
  selector: 'app-chapter-compare',
  templateUrl: 'compare-chapter.component.html'
})

export class CompareChapterComponent implements OnChanges {

  @Input() formA: UntypedFormGroup = null;
  @Input() formB: UntypedFormGroup = null;
  @Input() entryA: any = null;
  @Input() entryB: any = null;
  @Input() tabsHeader: string;
  @Input() chapter: Section = null;
  @Input() fields: Section[] = null;
  @Input() vocabularies: Map<string, object[]> = null;
  @Input() subVocabularies: Map<string, object[]> = null;

  ready = false;

  tabIndex= 0;

  ngOnChanges(changes: SimpleChanges) {
    if (this.fields) {
      this.ready = true
    }
  }


  /** tab prev next buttons **/
  setTabIndex(i: number) {
    this.tabIndex = i;
  }

  goToTab(i: number) {
    if (i === -1 || i === this.fields?.length) {
      return;
    }
    this.tabIndex = i;
    let element: HTMLElement = document.getElementById(this.chapter.id + '-tab' + i) as HTMLElement
    element.click();
    // console.log(element)
  }
}
