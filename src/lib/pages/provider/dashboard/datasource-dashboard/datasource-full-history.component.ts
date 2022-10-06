import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Subscription, Observable} from 'rxjs';
import {Service, LoggingInfo} from '../../../../domain/eic-model';
import {NavigationService} from '../../../../services/navigation.service';
import {ResourceService} from '../../../../services/resource.service';
import {Paging} from '../../../../domain/paging';
import {zip} from 'rxjs';
import {environment} from '../../../../../environments/environment';

@Component({
  selector: 'app-datasource-full-history',
  templateUrl: './datasource-full-history.component.html',
  styleUrls: ['../resource-dashboard/service-stats.component.css']
})
// export class DatasourceFullHistoryComponent implements OnInit, OnDestroy {
export class DatasourceFullHistoryComponent {

}
