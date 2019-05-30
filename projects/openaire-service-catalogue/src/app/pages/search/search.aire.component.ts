import {Component, OnInit} from '@angular/core';
import {SearchComponent} from '../../../../../../src/app/pages/search/search.component';
import {Provider} from '../../../../../../src/app/domain/eic-model';

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
    this.pageSize = 9;
    super.ngOnInit();
    this.canAddOrEditService = false;
    this.listViewActive = false;
    this.resourceService.getMyServiceProviders().subscribe(
      res => this.myProviders = res,
      er => console.log(er),
      () => this.canAddOrEditService = this.myProviders.some(p => p.id === 'openaire')
    );
  }
}
