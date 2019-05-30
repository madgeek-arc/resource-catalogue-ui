import {Component, OnInit} from '@angular/core';
import {SearchComponent} from '../../../../../../src/app/pages/search/search.component';
import {Provider} from "../../../../../../src/app/domain/eic-model";

declare var UIkit: any;

@Component({
  selector: 'app-search',
  templateUrl: './search.aire.component.html',
  styleUrls: ['./search.aire.component.css']
})
export class SearchAireComponent extends SearchComponent implements OnInit {
  canAddOrEditService: boolean;
  myProviders:  Provider[] = [];

  ngOnInit() {
    super.ngOnInit();
    this.canAddOrEditService = false;
    this.pageSize = 9;
    this.listViewActive = false;
    // this 2 lines should be done better
    this.resourceService.getMyServiceProviders().subscribe(
      res => this.myProviders = res,
      er => console.log(er),
      () => this.canAddOrEditService = this.myProviders.some(p => p.id === 'openaire')
    );

    this.updatePagingURLParametersQuantity(this.pageSize);
    this.navigateUsingParameters();

  }
}
