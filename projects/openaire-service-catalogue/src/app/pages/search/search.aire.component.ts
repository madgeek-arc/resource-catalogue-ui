import {Component, OnInit} from '@angular/core';
import {SearchComponent} from '../../../../../../src/app/pages/search/search.component';

declare var UIkit: any;

@Component({
  selector: 'app-search',
  templateUrl: './search.aire.component.html',
  styleUrls: ['./search.aire.component.css']
})
export class SearchAireComponent extends SearchComponent implements OnInit{

  ngOnInit() {
    this.pageSize = 9;
    super.ngOnInit();
    this.listViewActive = false;
    // this 2 lines should be done better
    this.updatePagingURLParametersQuantity(this.pageSize);
    this.navigateUsingParameters();
  }
}
