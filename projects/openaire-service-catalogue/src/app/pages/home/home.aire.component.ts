import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Service} from '../../../../../../src/app/domain/eic-model';
import {SearchQuery} from '../../../../../../src/app/domain/search-query';
import {NavigationService} from '../../../../../../src/app/services/navigation.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.aire.component.html',
  styleUrls: ['./home.aire.component.css']
})
export class HomeAireComponent implements OnInit {
  public searchForm: FormGroup;
  public categories: Category[] = [
    {
      value: 'Authentication and authorization infrastructure',
      icon: 'fingerprint_scanning_authorization.svg',
      hover: 'fingerprint_scanning_authorization_hover.svg'
    },
    {value: 'Compute', icon: 'cloud_server.svg', hover: 'cloud_server_hover.svg'},
    {value: 'Connectivity', icon: 'connectivity.svg', hover: 'connectivity_hover.svg'},
    {value: 'Consulting', icon: 'consulting.svg', hover: 'consulting_hover.svg'},
    {value: 'Operations', icon: 'keyword.svg', hover: 'keyword_hover.svg'},
    {value: 'Content delivery', icon: 'data-connectivity.svg', hover: 'data-connectivity_hover.svg'},
    {value: 'Data discovery', icon: 'keyword.svg', hover: 'keyword_hover.svg'},
    {value: 'Data movement', icon: 'database.svg', hover: 'database_hover.svg'},
    {value: 'Data registration', icon: 'cloud_server.svg', hover: 'cloud_server_hover.svg'},
    {value: 'Data storage', icon: 'database_security.svg', hover: 'database_security_hover.svg'}
  ];
  private services: Service[];

  constructor(public fb: FormBuilder, public router: NavigationService) {
    this.searchForm = fb.group({'query': ['']});
  }

  ngOnInit() {
    // fetch categories, check size, skip unpopulated ones here
  }

  onSubmit(searchValue: SearchQuery) {
    return this.router.search({query: searchValue.query});
  }
}

class Category {
  value: string;
  icon: string;
  hover: string;
}

