import {Component, OnDestroy, OnInit} from '@angular/core';
import {SearchComponent} from '../../../../../../src/app/pages/search/search.component';
import {Validators} from '@angular/forms';

declare var UIkit: any;


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchExtendedComponent extends SearchComponent implements OnInit, OnDestroy {
  public serviceIdsArray: string[] = [];

  isChecked(serviceId: string) {
    return this.serviceIdsArray.indexOf(serviceId) > -1;
  }

  addOrRemove(serviceId: string) {
    const pos = this.serviceIdsArray.indexOf(serviceId);
    if (pos > -1) {
      this.serviceIdsArray.splice(pos, 1);
    } else {
      this.serviceIdsArray.push(serviceId);
    }
  }

}
