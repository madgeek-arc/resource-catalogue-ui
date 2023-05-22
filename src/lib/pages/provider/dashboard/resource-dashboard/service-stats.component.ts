import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Subscription, zip} from 'rxjs';
import {Service, ServiceBundle, ServiceHistory} from '../../../../domain/eic-model';
import {AuthenticationService} from '../../../../services/authentication.service';
import {NavigationService} from '../../../../services/navigation.service';
import {ResourceService} from '../../../../services/resource.service';
import {ServiceProviderService} from '../../../../services/service-provider.service';
import {map} from 'rxjs/operators';
import {environment} from '../../../../../environments/environment';
import * as Highcharts from 'highcharts';
import MapModule from 'highcharts/modules/map';
import {RecommendationsService} from "../../../../services/recommendations.service";
MapModule(Highcharts);

declare var require: any;
const mapWorld = require('@highcharts/map-collection/custom/world.geo.json')

@Component({
  selector: 'app-service-stats',
  templateUrl: './service-stats.component.html',
  styleUrls: ['./service-stats.component.css']
})
export class ServiceStatsComponent implements OnInit, OnDestroy {

  marketplaceServicesURL = environment.marketplaceServicesURL;
  serviceORresource = environment.serviceORresource;
  projectName = environment.projectName;

  public service: Service;
  public errorMessage: string;
  private sub: Subscription;

  public EU: string[];
  public WW: string[];

  Highcharts: typeof Highcharts = Highcharts;
  chartConstructor = 'mapChart';
  serviceVisitsOptions: any = null;
  serviceRatingsOptions: any = null;
  serviceAddsToProjectOptions: any = null;
  serviceMapOptions: any = null;
  recommendationsOverTimeForService: any = null;
  recommendationsOfCompetitorsServices: any[] = [];
  emptyResponseOnGetCompetitorsServices = false;
  enrichedRecommendationsOfCompetitorsServices: any[] = [];

  resourceBundle: ServiceBundle;
  catalogueId: string = null;

  statisticPeriod: string;

  constructor(private route: ActivatedRoute,
              private router: NavigationService,
              private resourceService: ResourceService,
              private recommendationsService: RecommendationsService,
              private authenticationService: AuthenticationService,
              private providerService: ServiceProviderService) {
  }

  ngOnInit() {
    this.statisticPeriod = 'MONTH';
    this.catalogueId = this.route.parent.snapshot.paramMap.get('catalogueId');
    // this.sub = this.route.params.subscribe(params => {
    this.sub = this.route.parent.params.subscribe(params => {
      zip(
        this.resourceService.getEU(),
        this.resourceService.getWW(),
        this.resourceService.getService(params['resourceId'], params['catalogueId'])
      ).subscribe(suc => {
          this.EU = <string[]>suc[0];
          this.WW = <string[]>suc[1];
          this.service = <Service>suc[2];
          this.getDataForService(this.statisticPeriod);

        },
        err => {
          if (err.status === 404) {
            this.router.go('/404');
          }
          this.errorMessage = 'An error occurred while retrieving data for this service. ' + err.error;
        }
      );
    });
  }

  getDataForService(period: string, dontGetServices?: boolean) {

    this.setCountriesForService(this.service.geographicalAvailabilities);

    this.resourceService.getVisitsForService(this.service.id, period).pipe(
      map(data => {
        // THESE 3 weird lines should be deleted when pgl makes everything ok :)
        return Object.entries(data).map((d) => {
          return [new Date(d[0]).getTime(), d[1]];
        }).sort((l, r) => l[0] - r[0]);
      })).subscribe(
      data => this.setVisitsForService(data),
      err => {
        this.errorMessage = 'An error occurred while retrieving visits for this service. ' + err.error;
      }
    );

    if (this.projectName === 'EOSC') {
      this.resourceService.getAddToProjectForService(this.service.id, period).pipe(
        map(data => {
          // THESE 3 weird lines should be deleted when pgl makes everything ok :)
          return Object.entries(data).map((d) => {
            return [new Date(d[0]).getTime(), d[1]];
          }).sort((l, r) => l[0] - r[0]);
        })).subscribe(
        data => this.setAddsToProjectForService(data),
        err => {
          this.errorMessage = 'An error occurred while retrieving adds to project for this service. ' + err.error;
        }
      );
    }

    this.resourceService.getRatingsForService(this.service.id, period).pipe(
      map(data => {
        // THESE 3 weird lines should be deleted when pgl makes everything ok :)
        return Object.entries(data).map((d) => {
          return [new Date(d[0]).getTime(), d[1]];
        }).sort((l, r) => l[0] - r[0]);
      })).subscribe(
      data => this.setRatingsForService(data),
      err => {
        this.errorMessage = 'An error occurred while retrieving ratings for this service. ' + err.error;
      }
    );

    if (dontGetServices) {

    } else {
      this.resourceService.getResourceBundleById(this.service.id, this.catalogueId).subscribe(
        res => { if (res!=null) this.resourceBundle = res },
        err => {
          this.errorMessage = 'An error occurred while retrieving the history of this service. ' + err.error;
        }
      );
    }

    /** Recommendations -> **/
    // this.recommendationsService.getRecommendationsOverTime(this.catalogueId.concat('.',this.service.resourceOrganisation), this.catalogueId.concat('.',this.service.id)).subscribe(
    //   data => this.setRecommendationsOverTimeForService(data),
    //   err => this.errorMessage = 'An error occurred while retrieving visits for this service. ' + err.error
    // );
    //
    // this.recommendationsService.getCompetitorsServices(this.catalogueId.concat('.',this.service.resourceOrganisation), this.catalogueId.concat('.',this.service.id)).subscribe(
    //   data => this.setCompetitorsServices(data),
    //   err => this.errorMessage = 'An error occurred while retrieving recommended services. ' + err.error
    // );
    /** <- Recommendations **/
  }

  onRecommendationsTabClick() {
    if (!this.recommendationsOverTimeForService) {
      this.recommendationsService.getRecommendationsOverTime(this.catalogueId.concat('.',this.service.resourceOrganisation), this.catalogueId.concat('.',this.service.id)).subscribe(
        data => this.setRecommendationsOverTimeForService(data),
        err => this.errorMessage = 'An error occurred while retrieving visits for this service. ' + err.error
      );
    }
    if (this.enrichedRecommendationsOfCompetitorsServices.length == 0) {
      this.recommendationsService.getCompetitorsServices(this.catalogueId.concat('.',this.service.resourceOrganisation), this.catalogueId.concat('.',this.service.id)).subscribe(
        data => {
          if (data != []) {
            this.setCompetitorsServices(data);
            this.emptyResponseOnGetCompetitorsServices = false;
          } else {
            this.emptyResponseOnGetCompetitorsServices = true;
          }
        },
        err => this.errorMessage = 'An error occurred while retrieving recommended services. ' + err.error
      );
    }
  }

  onPeriodChange(event) {
    this.statisticPeriod = event.target.value;
    this.getDataForService(this.statisticPeriod, true);
  }

  setVisitsForService(data: any) {
    if (data) {
      this.serviceVisitsOptions = {
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

  setAddsToProjectForService(data: any) {
    if (data) {
      this.serviceAddsToProjectOptions = {
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

  setRatingsForService(data: any) {
    if (data) {
      this.serviceRatingsOptions = {
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

  setCountriesForService(data: any) {
    const places = this.resourceService.expandRegion(JSON.parse(JSON.stringify(data || [])), this.EU, this.WW);

    this.serviceMapOptions = {
      chart: {
        // map: 'custom/europe',
        map: mapWorld,
        // borderWidth: 1
      },
      title: {
        text: 'Countries serviced by ' + this.service.name
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

  setRecommendationsOverTimeForService(data: any) {
    const chartData = [];
    data.forEach((value) => {
      chartData.push([Date.parse(value.date), value.recommendations]);
    });

    if (data) {
      this.recommendationsOverTimeForService = {
        chart: {
          height: (3 / 4 * 100) + '%', // 3:4 ratio
        },
        title: {
          text: 'Recommendations over time'
        },
        xAxis: {
          type: 'datetime',
          // dateTimeLabelFormats: {
          //   month: '%e. %b',
          //   year: '%b'
          // },
          title: {
            text: 'Date'
          }
        },
        yAxis: {
          title: {
            text: 'Number of recommendations'
          }
        },
        series: [{
          name: 'Recommendations over time',
          color: '#013203',
          data: chartData
        }],
        credits: {
          enabled: false
        }
      };
    }
  }

  setCompetitorsServices(data: any) {
    this.recommendationsOfCompetitorsServices = data;
    this.enrichedRecommendationsOfCompetitorsServices = [];

    for (const item of data) {
      const competitorsWithDetails = [];

      // let competitorPublicIds = [];
      for (const competitor of item.competitors) {
        // if (competitor.service_id !== 'tnp.lumi_etais__regular_access') {
          // competitorPublicIds.push(competitor.service_id);
          const isPublicId = /\..*\./.test(competitor.service_id); // if it has two dot occurrences its a publicId
          this.resourceService.getService(competitor.service_id, isPublicId ? competitor.service_id.split(".")[0] : 'eosc').subscribe(
            res => {
              const competitorWithDetails = {
                service_id: competitor.service_id,
                recommendations: competitor.recommendations,
                logo: res.logo,
                name: res.name,
                description: res.description
              };
              competitorsWithDetails.push(competitorWithDetails);
            },
            error => {
            },
            () => {
            }
          );
        // }
      }
      const itemWithDetails = {
        service_id: item.service_id,
        total_competitor_recommendations: item.total_competitor_recommendations,
        competitors: competitorsWithDetails
      };
      this.enrichedRecommendationsOfCompetitorsServices.push(itemWithDetails);
    }

    for (const item of this.enrichedRecommendationsOfCompetitorsServices) {
      const isPublicId = /\..*\./.test(item.service_id); // if it has two dot occurrences its a publicId
      this.resourceService.getService(item.service_id, isPublicId ? item.service_id.split(".")[0] : 'eosc').subscribe(
        res => {
          item.logo = res.logo;
          item.name = res.name;
          item.description = res.description;
        },
        error => { },
        () => { }
      );
    }

    // console.log(this.enrichedRecommendationsOfCompetitorsServices);
    // console.log(competitorsPublicIds);
    // console.log(outerServicesPublicIds);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  handleError(error) {
    this.errorMessage = 'System error retrieving service (Server responded: ' + error + ')';
  }
}
