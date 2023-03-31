import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Subscription, zip} from 'rxjs';
import {ServiceHistory, Datasource, LoggingInfo, TrainingResource} from '../../../../domain/eic-model';
import {NavigationService} from '../../../../services/navigation.service';
import {ResourceService} from '../../../../services/resource.service';
import {TrainingResourceService} from "../../../../services/training-resource.service";
import {Paging} from '../../../../domain/paging';
import {map} from 'rxjs/operators';
import {environment} from '../../../../../environments/environment';
import * as Highcharts from 'highcharts';
import MapModule from 'highcharts/modules/map';
MapModule(Highcharts);

declare var require: any;
const mapWorld = require('@highcharts/map-collection/custom/world.geo.json')

@Component({
  selector: 'app-training-resource-stats',
  templateUrl: './training-resource-stats.component.html',
  styleUrls: ['../resource-dashboard/service-stats.component.css']
})
export class TrainingResourceStatsComponent implements OnInit, OnDestroy {

  projectName = environment.projectName;

  public catalogueId: string;
  public trainingResource: TrainingResource;
  public errorMessage: string;
  private sub: Subscription;

  public EU: string[];
  public WW: string[];

  Highcharts: typeof Highcharts = Highcharts;
  chartConstructor = 'mapChart';
  resourceVisitsOptions: any = null;
  resourceRatingsOptions: any = null;
  resourceAddsToProjectOptions: any = null;
  resourceMapOptions: any = null;

  resourceHistory: Paging<LoggingInfo>;

  statisticPeriod: string;

  constructor(private route: ActivatedRoute,
              private router: NavigationService,
              private resourceService: ResourceService,
              private trainingResourceService: TrainingResourceService) {
  }

  ngOnInit() {
    this.catalogueId = window.location.href.split('dashboard/')[1].split('/')[0];
    this.statisticPeriod = 'MONTH';
    // this.sub = this.route.params.subscribe(params => {
    this.sub = this.route.parent.params.subscribe(params => {
      zip(
        this.resourceService.getEU(),
        this.resourceService.getWW(),
        this.trainingResourceService.getService(params['trainingResourceId'], params['catalogueId'])
      ).subscribe(suc => {
          this.EU = <string[]>suc[0];
          this.WW = <string[]>suc[1];
          this.trainingResource = <TrainingResource>suc[2];
          this.getDataForResource(this.statisticPeriod);

        },
        err => {
          if (err.status === 404) {
            this.router.go('/404');
          }
          this.errorMessage = 'An error occurred while retrieving data for this training resource. ' + err.error;
        }
      );
    });
  }

  getDataForResource(period: string, dontGetResources?: boolean) {

    this.setCountriesForResource(this.trainingResource.geographicalAvailabilities);

    this.trainingResourceService.getVisitsForService(this.trainingResource.id, period).pipe(
      map(data => {
        // THESE 3 weird lines should be deleted when pgl makes everything ok :)
        return Object.entries(data).map((d) => {
          return [new Date(d[0]).getTime(), d[1]];
        }).sort((l, r) => l[0] - r[0]);
      })).subscribe(
      data => this.setVisitsForResource(data),
      err => {
        this.errorMessage = 'An error occurred while retrieving visits for this training resource. ' + err.error;
      }
    );

    if (this.projectName === 'EOSC') {
      this.trainingResourceService.getAddToProjectForService(this.trainingResource.id, period).pipe(
        map(data => {
          // THESE 3 weird lines should be deleted when pgl makes everything ok :)
          return Object.entries(data).map((d) => {
            return [new Date(d[0]).getTime(), d[1]];
          }).sort((l, r) => l[0] - r[0]);
        })).subscribe(
        data => this.setAddsToProjectForResource(data),
        err => {
          this.errorMessage = 'An error occurred while retrieving data for this training resource. ' + err.error;
        }
      );
    }

    this.trainingResourceService.getRatingsForService(this.trainingResource.id, period).pipe(
      map(data => {
        // console.log('Ratings', data);
        // THESE 3 weird lines should be deleted when pgl makes everything ok :)
        return Object.entries(data).map((d) => {
          return [new Date(d[0]).getTime(), d[1]];
        }).sort((l, r) => l[0] - r[0]);
      })).subscribe(
      data => this.setRatingsForResource(data),
      err => {
        this.errorMessage = 'An error occurred while retrieving ratings for this training resource. ' + err.error;
      }
    );

    if (dontGetResources) {
    } else {
      this.trainingResourceService.getServiceLoggingInfoHistory(this.trainingResource.id, this.catalogueId).subscribe(
        res => this.resourceHistory = res,
        err => {
          this.errorMessage = 'An error occurred while retrieving the history of this training resource. ' + err.error;
        }
      );
    }
  }

  onPeriodChange(event) {
    this.statisticPeriod = event.target.value;
    this.getDataForResource(this.statisticPeriod, true);
  }

  setVisitsForResource(data: any) {
    if (data) {
      this.resourceVisitsOptions = {
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
        }],
        credits: {
          enabled: false
        }
      };
    }
  }

  setAddsToProjectForResource(data: any) {
    if (data) {
      this.resourceAddsToProjectOptions = {
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
        }],
        credits: {
          enabled: false
        }
      };
    }
  }

  setRatingsForResource(data: any) {
    if (data) {
      this.resourceRatingsOptions = {
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
        }],
        credits: {
          enabled: false
        }
      };

    }
  }

  setCountriesForResource(data: any) {
    const places = this.resourceService.expandRegion(JSON.parse(JSON.stringify(data || [])), this.EU, this.WW);

    this.resourceMapOptions = {
      chart: {
        // map: 'custom/europe',
        map: mapWorld,
        // borderWidth: 1
      },
      title: {
        text: 'Countries serviced by ' + this.trainingResource.title
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
      }],
      credits: {
        enabled: false
      }
    };
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  handleError(error) {
    this.errorMessage = 'System error retrieving training resource (Server responded: ' + error + ')';
  }
}
