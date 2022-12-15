import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Subscription, zip} from 'rxjs';
import {LoggingInfo, Service} from '../../../../domain/eic-model';
import {NavigationService} from '../../../../services/navigation.service';
import {ResourceService} from '../../../../services/resource.service';
import {Paging} from '../../../../domain/paging';
import {environment} from '../../../../../environments/environment';

@Component({
  selector: 'app-datasource-history',
  templateUrl: './datasource-history.component.html',
  styleUrls: ['../resource-dashboard/service-stats.component.css']
})
// export class DatasourceHistoryComponent implements OnInit, OnDestroy {
export class DatasourceHistoryComponent {

}
