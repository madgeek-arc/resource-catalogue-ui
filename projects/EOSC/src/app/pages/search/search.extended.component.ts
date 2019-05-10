import {Component, OnDestroy, OnInit} from '@angular/core';
import {SearchComponent} from '../../../../../../src/app/pages/search/search.component';


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchExtendedComponent extends SearchComponent implements OnInit, OnDestroy {
}
