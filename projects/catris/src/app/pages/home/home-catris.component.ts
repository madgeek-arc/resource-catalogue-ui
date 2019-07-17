import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Service, Vocabulary} from '../../../../../../src/app/domain/eic-model';
import {SearchQuery} from '../../../../../../src/app/domain/search-query';
import {NavigationService} from '../../../../../../src/app/services/navigation.service';
import {SearchResults} from '../../../../../../src/app/domain/search-results';

import {Info} from '../../../../../EOSC/src/app/domain/info';
import {ResourceServiceExtended} from '../../../../../EOSC/src/app/services/resource.service.extended';
import {HomeComponent} from '../../../../../../src/app/pages/home/home.component';



@Component({
  selector: 'app-home-catris',
  templateUrl: './home-catris.component.html',
  styleUrls: ['./home-catris.component.css']
})
export class HomeCatrisComponent extends HomeComponent implements OnInit {}

