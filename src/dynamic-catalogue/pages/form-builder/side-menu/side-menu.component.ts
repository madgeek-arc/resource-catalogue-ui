import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {Section, Field, GroupedFields} from "../../../domain/dynamic-form-model";

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html'
})

export class SideMenuComponent implements OnInit {

  @Input() chapterModel: Section[];
  @Output() showChapterOrSection = new EventEmitter<string>();
  // groups: Group[] = []

  ngOnInit() {
    // this.groups.push(new Group());
  }

  addSection(position) {
    this.chapterModel[position].subSections.push(new Section());
  }

  addField(positionI, positionJ) {
    this.chapterModel[positionI].subSections[positionJ].fields.push(new Field());
  }

  pushChapter() {
    this.chapterModel.push(new Section());
  }

  deleteChapter(position: number) {
    this.chapterModel.splice(position, 1);
  }

  emitSelection(str: string) {
    this.showChapterOrSection.emit(str);
  }

}
