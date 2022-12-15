import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Subscription, zip} from 'rxjs';
import {Service, ServiceHistory} from '../../../../domain/eic-model';
import {AuthenticationService} from '../../../../services/authentication.service';
import {NavigationService} from '../../../../services/navigation.service';
import {ResourceService} from '../../../../services/resource.service';
import {UserService} from '../../../../services/user.service';
import {Paging} from '../../../../domain/paging';
import {ServiceProviderService} from '../../../../services/service-provider.service';
import {map} from 'rxjs/operators';
import {environment} from '../../../../../environments/environment';
import * as Highcharts from 'highcharts';
import MapModule from 'highcharts/modules/map';
MapModule(Highcharts);

declare var require: any;
const mapWorld = require('@highcharts/map-collection/custom/world.geo.json')

@Component({
  selector: 'app-datasource-stats',
  templateUrl: './datasource-stats.component.html',
  styleUrls: ['../resource-dashboard/service-stats.component.css']
})

// export class DatasourceStatsComponent implements OnInit, OnDestroy {
export class DatasourceStatsComponent {

}
