import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Subscription, zip} from 'rxjs';
import {ServiceHistory, Datasource, LoggingInfo} from '../../../../domain/eic-model';
import {NavigationService} from '../../../../services/navigation.service';
import {ResourceService} from '../../../../services/resource.service';
import {DatasourceService} from "../../../../services/datasource.service";
import {Paging} from '../../../../domain/paging';
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
export class DatasourceStatsComponent implements OnInit, OnDestroy {

  projectName = environment.projectName;

  public datasource: Datasource;
  public errorMessage: string;
  private sub: Subscription;

  public EU: string[];
  public WW: string[];

  Highcharts: typeof Highcharts = Highcharts;
  chartConstructor = 'mapChart';
  datasourceVisitsOptions: any = null;
  datasourceRatingsOptions: any = null;
  datasourceAddsToProjectOptions: any = null;
  datasourceMapOptions: any = null;

  datasourceHistory: Paging<LoggingInfo>;

  statisticPeriod: string;

  constructor(private route: ActivatedRoute,
              private router: NavigationService,
              private resourceService: ResourceService,
              private datasourceService: DatasourceService) {
  }

  ngOnInit() {
    this.statisticPeriod = 'MONTH';
    // this.sub = this.route.params.subscribe(params => {
    this.sub = this.route.parent.params.subscribe(params => {
      zip(
        this.resourceService.getEU(),
        this.resourceService.getWW(),
        this.datasourceService.getDatasource(params['datasourceId'], params['catalogueId'])
      ).subscribe(suc => {
          this.EU = <string[]>suc[0];
          this.WW = <string[]>suc[1];
          this.datasource = <Datasource>suc[2];
          this.getDataForDatasource(this.statisticPeriod);

        },
        err => {
          if (err.status === 404) {
            this.router.go('/404');
          }
          this.errorMessage = 'An error occurred while retrieving data for this datasource. ' + err.error;
        }
      );
    });
  }

  getDataForDatasource(period: string, dontGetDatasources?: boolean) {

    this.setCountriesForDatasource(this.datasource.geographicalAvailabilities);

    this.datasourceService.getVisitsForDatasource(this.datasource.id, period).pipe(
      map(data => {
        // THESE 3 weird lines should be deleted when pgl makes everything ok :)
        return Object.entries(data).map((d) => {
          return [new Date(d[0]).getTime(), d[1]];
        }).sort((l, r) => l[0] - r[0]);
      })).subscribe(
      data => this.setVisitsForDatasource(data),
      err => {
        this.errorMessage = 'An error occurred while retrieving visits for this datasource. ' + err.error;
      }
    );

    if (this.projectName === 'EOSC') {
      this.datasourceService.getAddToProjectForDatasource(this.datasource.id, period).pipe(
        map(data => {
          // THESE 3 weird lines should be deleted when pgl makes everything ok :)
          return Object.entries(data).map((d) => {
            return [new Date(d[0]).getTime(), d[1]];
          }).sort((l, r) => l[0] - r[0]);
        })).subscribe(
        data => this.setAddsToProjectForDatasource(data),
        err => {
          this.errorMessage = 'An error occurred while retrieving data for this datasource. ' + err.error;
        }
      );
    }

    this.datasourceService.getRatingsForDatasource(this.datasource.id, period).pipe(
      map(data => {
        // console.log('Ratings', data);
        // THESE 3 weird lines should be deleted when pgl makes everything ok :)
        return Object.entries(data).map((d) => {
          return [new Date(d[0]).getTime(), d[1]];
        }).sort((l, r) => l[0] - r[0]);
      })).subscribe(
      data => this.setRatingsForDatasource(data),
      err => {
        this.errorMessage = 'An error occurred while retrieving ratings for this datasource. ' + err.error;
      }
    );

    if (dontGetDatasources) {
    } else {
      this.datasourceService.getDatasourceLoggingInfoHistory(this.datasource.id).subscribe(
        res => this.datasourceHistory = res,
        err => {
          this.errorMessage = 'An error occurred while retrieving the history of this datasource. ' + err.error;
        }
      );
    }
  }

  onPeriodChange(event) {
    this.statisticPeriod = event.target.value;
    this.getDataForDatasource(this.statisticPeriod, true);
  }

  setVisitsForDatasource(data: any) {
    if (data) {
      this.datasourceVisitsOptions = {
        title: {
          text: 'Number of visits over time'
        },
        xAxis: {
          type: 'datetime',
          dateTimeLabelFormats: { // don't display the dummy year
            month: '%e. %b',
            year: '%b'
          },
          title: {
            text: 'Date'
          }
        },
        yAxis: {
          title: {
            text: 'Number of visits'
          }
        },
        series: [{
          name: 'Visits over time',
          color: '#036166',
          data: data
        }]
      };
    }
  }

  setAddsToProjectForDatasource(data: any) {
    if (data) {
      this.datasourceAddsToProjectOptions = {
        title: {
          text: 'Number of adds to project over time'
        },
        xAxis: {
          type: 'datetime',
          dateTimeLabelFormats: { // don't display the dummy year
            month: '%e. %b',
            year: '%b'
          },
          title: {
            text: 'Date'
          }
        },
        yAxis: {
          title: {
            text: 'Number of adds to project'
          }
        },
        series: [{
          name: 'Adds to project over time',
          color: '#C36000',
          data: data
        }]
      };
    }
  }

  setRatingsForDatasource(data: any) {
    if (data) {
      this.datasourceRatingsOptions = {
        title: {
          text: 'Number of ratings over time'
        },
        xAxis: {
          type: 'datetime',
          dateTimeLabelFormats: { // don't display the dummy year
            month: '%e. %b',
            year: '%b'
          },
          title: {
            text: 'Date'
          }
        },
        yAxis: {
          title: {
            text: 'Average rating'
          }
        },
        series: [{
          name: 'Average rating over time',
          color: '#6B0035',
          data: data
        }]
      };

    }
  }

  setCountriesForDatasource(data: any) {
    const places = this.resourceService.expandRegion(JSON.parse(JSON.stringify(data || [])), this.EU, this.WW);

    this.datasourceMapOptions = {
      chart: {
        // map: 'custom/europe',
        map: mapWorld,
        // borderWidth: 1
      },
      title: {
        text: 'Countries serviced by ' + this.datasource.name
      },
      // subtitle: {
      //     text: 'Demo of drawing all areas in the map, only highlighting partial data'
      // },
      legend: {
        enabled: false
      },
      series: [{
        type: 'map',
        name: 'Country',
        data: places.map(e => e.toLowerCase()).map(e => [e, 1]),
        dataLabels: {
          enabled: true,
          color: '#FFFFFF',
          formatter: function () {
            if (this.point.value) {
              return this.point.name;
            }
          }
        },
        tooltip: {
          headerFormat: '',
          pointFormat: '{point.name}'
        }
      }]
    };
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  handleError(error) {
    this.errorMessage = 'System error retrieving datasource (Server responded: ' + error + ')';
  }
}
