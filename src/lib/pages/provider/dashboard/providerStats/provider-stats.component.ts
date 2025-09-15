import {Component, OnInit} from '@angular/core';
import {isNullOrUndefined} from '../../../../shared/tools';
import {combineLatest, zip} from 'rxjs';
import {AuthenticationService} from '../../../../services/authentication.service';
import {ResourceService} from '../../../../services/resource.service';
import {RecommendationsService} from '../../../../services/recommendations.service';
import {NavigationService} from '../../../../services/navigation.service';
import {ActivatedRoute} from '@angular/router';
import {ServiceProviderService} from '../../../../services/service-provider.service';
import {ServiceBundle, Provider, ProviderBundle} from '../../../../domain/eic-model';
import {map} from 'rxjs/operators';
import {Paging} from '../../../../domain/paging';
import {environment} from '../../../../../environments/environment';
import {ConfigService} from '../../../../services/config.service';
import * as Highcharts from 'highcharts';
import MapModule from 'highcharts/modules/map';
MapModule(Highcharts);

declare var require: any;
// const mapWorld = require('@highcharts/map-collection/custom/world.geo.json');
const mapWorld = require('@highcharts/map-collection/custom/world.geo.json')
declare var UIkit: any;


@Component({
  selector: 'app-provider-stats',
  templateUrl: './provider-stats.component.html',
  // styleUrls: ['']
})

export class ProviderStatsComponent implements OnInit {

  catalogueConfigId: string = this.config.getProperty('catalogueId');
  catalogueName: string | null = null;
  serviceORresource = environment.serviceORresource;
  marketplaceServicesURL = environment.marketplaceServicesURL;
  marketplaceDatasourcesURL = environment.marketplaceDatasourcesURL;

  catalogueId: string;
  providerId: string;
  statisticPeriod: string;
  provider: Provider;
  providerBundle: ProviderBundle;
  providerServices: Paging<ServiceBundle>;
  providerServicesGroupedByPlace: any;
  providerCoverage: string[];
  public errorMessage: string;

  public EU: string[];
  public WW: string[];

  providerVisitsOptions: any = null;
  providerRatingsOptions: any = null;
  providerFavouritesOptions: any = null;
  providerAddsToProjectOptions: any = null;
  providerOrdersOptions: any = null;
  providerVisitationPercentageOptions: any = null;
  providerMapOptions: any = null;
  mapDistributionOfServicesOptions: any = null;
  categoriesPerServiceForProvider: any = null;
  domainsPerServiceForProvider: any = null;
  targetUsersPerServiceForProvider: any = null;
  accessModesPerServiceForProvider: any = null;
  accessTypesPerServiceForProvider: any = null;
  orderTypesPerServiceForProvider: any = null;
  recommendationsOverTimeForProvider: any = null;
  recommendationsOfTopServices: any = null;
  recommendationsOfCompetitorsServices: any[] = [];
  emptyResponseOnGetCompetitorsServices = false;
  enrichedRecommendationsOfCompetitorsServices: any[] = [];

  selectedCountryName: string = null;
  selectedCountryServices: any = null;
  geographicalDistributionMap: any = null;
  Highcharts: typeof Highcharts = Highcharts;
  chartConstructor = "mapChart";

  constructor(
    public authenticationService: AuthenticationService,
    public resourceService: ResourceService,
    public recommendationsService: RecommendationsService,
    public navigator: NavigationService,
    private route: ActivatedRoute,
    private providerService: ServiceProviderService,
    private config: ConfigService
  ) {
  }

  ngOnInit(): void {
    this.catalogueName = this.config.getProperty('catalogueName');
    this.statisticPeriod = 'MONTH';
    this.providerId = this.route.parent.snapshot.paramMap.get('provider');
    this.catalogueId = this.route.parent.snapshot.paramMap.get('catalogueId');
    if (!isNullOrUndefined(this.providerId) && (this.providerId !== '')) {
      zip(
        this.resourceService.getEU(),
        this.resourceService.getWW(),
        this.providerService.getServiceProviderBundleById(this.providerId, this.catalogueId)
        /*this.resourceService.getProvidersNames()*/
      ).subscribe(suc => {
        this.EU = <string[]>suc[0];
        this.WW = <string[]>suc[1];
        this.providerBundle = suc[2];
        this.getDataForProvider(this.statisticPeriod);
      });
    } else {
      this.providerService.getMyServiceProviders().subscribe(
        res => {
          this.providerId = res[0].id;
          zip(
            this.resourceService.getEU(),
            this.resourceService.getWW(),
            this.providerService.getServiceProviderBundleById(this.providerId, this.catalogueId)
            /*this.resourceService.getProvidersNames()*/
          ).subscribe(suc => {
            this.EU = <string[]>suc[0];
            this.WW = <string[]>suc[1];
            this.providerBundle = suc[2];
            this.getDataForProvider(this.statisticPeriod);
          });
        },
        err => {
          this.errorMessage = 'An error occurred while retrieving data for this service. ' + err.error;
        }
      );
    }
  }

  getDataForProvider(period: string, dontGetServices?: boolean) {

    if (!dontGetServices) {
      this.providerService.getServicesOfProvider(this.providerId, this.catalogueId, '0', '50', 'ASC', 'name', 'true')
        .subscribe(res => {
            this.providerServices = res;
            // this.providerServicesGroupedByPlace = this.groupServicesOfProviderPerPlace(this.providerServices.results);
            if (this.providerServicesGroupedByPlace) {
              this.providerCoverage = Object.keys(this.providerServicesGroupedByPlace);

              this.setCountriesForProvider(this.providerCoverage);
            }
          },
          err => {
            this.errorMessage = 'An error occurred while retrieving the services of this provider. ' + err.error;
          }
        );
    }

    this.resourceService.getVisitsForProvider(this.providerId, period).pipe(
      map(data => {
        // THESE 3 weird lines should be deleted when pgl makes everything ok :)
        return Object.entries(data).map((d) => {
          return [new Date(d[0]).getTime(), d[1]];
        }).sort((l, r) => l[0] - r[0]);
      })).subscribe(
      data => this.setVisitsForProvider(data),
      err => {
        this.errorMessage = 'An error occurred while retrieving visits for this provider. ' + err.error;
      }
    );

    if (this.catalogueName === 'EOSC') {

      this.resourceService.getAddsToProjectForProvider(this.providerId, period).pipe(
        map(data => {
          // THESE 3 weird lines should be deleted when pgl makes everything ok :)
          return Object.entries(data).map((d) => {
            return [new Date(d[0]).getTime(), d[1]];
          }).sort((l, r) => l[0] - r[0]);
        })).subscribe(
        data => this.setAddsToProjectOptions(data),
        err => {
          this.errorMessage = 'An error occurred while retrieving favourites for this provider. ' + err.error;
        }
      );

      // this.resourceService.getOrdersForProvider(this.providerId, period).pipe(
      //   map(data => {
      //     // THESE 3 weird lines should be deleted when pgl makes everything ok :)
      //     return Object.entries(data).map((d) => {
      //       return [new Date(d[0]).getTime(), d[1]];
      //     }).sort((l, r) => l[0] - r[0]);
      //   })).subscribe(
      //   data => this.setOrdersOptions(data),
      //   err => {
      //     this.errorMessage = 'An error occurred while retrieving favourites for this provider. ' + err.error;
      //   }
      // );

    }

    /* bar charts */
    this.resourceService.getCategoriesPerServiceForProvider(this.providerId).subscribe(
      data => {
        const barChartCategories: string[] = [];
        const barChartData: number[] = [];
        for (let i = 0; i < Object.keys(data).length; i++) {
          const str = (Object.values(data[i])[0]).toString();
          const key = str.substring(str.lastIndexOf('-') + 1).replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
          barChartCategories.push(key);
          barChartData.push(Object.keys(Object.values(data[i])[1]).length);
        }
        this.setCategoriesPerServiceForProvider(barChartCategories, barChartData);
      },
      err => {
        this.errorMessage = 'An error occurred while retrieving categories for this provider. ' + err.error;
      }
    );

    this.resourceService.getDomainsPerServiceForProvider(this.providerId).subscribe(
      data => {
        const barChartCategories: string[] = [];
        const barChartData: number[] = [];
        for (let i = 0; i < Object.keys(data).length; i++) {
          const str = (Object.values(data[i])[0]).toString();
          const key = str.substring(str.lastIndexOf('-') + 1).replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
          barChartCategories.push(key);
          barChartData.push(Object.keys(Object.values(data[i])[1]).length);
        }
        this.setDomainsPerServiceForProvider(barChartCategories, barChartData);
      },
      err => {
        this.errorMessage = 'An error occurred while retrieving domains for this provider. ' + err.error;
      }
    );

    this.resourceService.getTargetUsersPerServiceForProvider(this.providerId).subscribe(
      data => {
        const barChartCategories: string[] = [];
        const barChartData: number[] = [];
        for (let i = 0; i < Object.keys(data).length; i++) {
          const str = (Object.values(data[i])[0]).toString();
          const key = str.substring(str.lastIndexOf('-') + 1).replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
          barChartCategories.push(key);
          barChartData.push(Object.keys(Object.values(data[i])[1]).length);
        }
        this.setTargetUsersPerServiceForProvider(barChartCategories, barChartData);
      },
      err => {
        this.errorMessage = 'An error occurred while retrieving target users for this provider. ' + err.error;
      }
    );

    this.resourceService.getAccessModesPerServiceForProvider(this.providerId).subscribe(
      data => {
        const barChartCategories: string[] = [];
        const barChartData: number[] = [];
        for (let i = 0; i < Object.keys(data).length; i++) {
          const str = (Object.values(data[i])[0]).toString();
          const key = str.substring(str.lastIndexOf('-') + 1).replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
          barChartCategories.push(key);
          barChartData.push(Object.keys(Object.values(data[i])[1]).length);
        }
        this.setAccessModesPerServiceForProvider(barChartCategories, barChartData);
      },
      err => {
        this.errorMessage = 'An error occurred while retrieving access modes for this provider. ' + err.error;
      }
    );

    this.resourceService.getAccessTypesPerServiceForProvider(this.providerId).subscribe(
      data => {
        const barChartCategories: string[] = [];
        const barChartData: number[] = [];
        for (let i = 0; i < Object.keys(data).length; i++) {
          const str = (Object.values(data[i])[0]).toString();
          const key = str.substring(str.lastIndexOf('-') + 1).replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
          barChartCategories.push(key);
          barChartData.push(Object.keys(Object.values(data[i])[1]).length);
        }
        this.setAccessTypesPerServiceForProvider(barChartCategories, barChartData);
      },
      err => {
        this.errorMessage = 'An error occurred while retrieving access types for this provider. ' + err.error;
      }
    );

    this.resourceService.getOrderTypesPerServiceForProvider(this.providerId).subscribe(
      data => {
        const barChartCategories: string[] = [];
        const barChartData: number[] = [];
        for (let i = 0; i < Object.keys(data).length; i++) {
          const str = (Object.values(data[i])[0]).toString();
          const key = str.substring(str.lastIndexOf('-') + 1).replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
          barChartCategories.push(key);
          barChartData.push(Object.keys(Object.values(data[i])[1]).length);
        }
        this.setOrderTypesPerServiceForProvider(barChartCategories, barChartData);
      },
      err => {
        this.errorMessage = 'An error occurred while retrieving order types for this provider. ' + err.error;
      }
    );

    if (dontGetServices) {
    } else {
      this.resourceService.getVisitationPercentageForProvider(this.providerId).pipe(
        map(data => {
          // THESE 3 weird lines should be deleted when pgl makes everything ok :)
          return Object.entries(data).map((d) => {
            if (d[1] !== 'NaN') {
              return {name: d[0], y: d[1]};
            }
          });
        })).subscribe(
        data => this.setVisitationsForProvider(data),
        err => {
          this.errorMessage = 'An error occurred while retrieving service visitation percentages for this provider. ' + err.error;
        }
      );
    }

    this.resourceService.getMapDistributionOfServices(this.providerId).subscribe(
      data => {
        this.geographicalDistributionMap = new Map();

        for (const [key, value] of Object.entries(data)) {
          this.geographicalDistributionMap.set(value.key.toLowerCase(), value.values);
        }
        this.setMapDistributionOfServices(data);
      },
      err => {
        this.errorMessage = 'An error occurred while retrieving geographical distribution of services for this provider. ' + err.error;
      }
    );

    /** Recommendations -> **/
    // this.recommendationsService.getRecommendationsOverTime(this.catalogueId.concat('.',this.providerId)).subscribe(
    //     data => this.setRecommendationsOverTimeForProvider(data),
    //     err => this.errorMessage = 'An error occurred while retrieving visits for this provider. ' + err.error
    //   );
    //
    // this.recommendationsService.getMostRecommendedServices(this.catalogueId.concat('.',this.providerId)).subscribe(
    //   data => this.enrichMostRecommendedServices(data),
    //   err => this.errorMessage = 'An error occurred while retrieving most recommended services for this provider. ' + err.error
    // );
    //
    // this.recommendationsService.getCompetitorsServices(this.catalogueId.concat('.',this.providerId)).subscribe(
    //   data => this.setCompetitorsServices(data),
    //   err => this.errorMessage = 'An error occurred while retrieving recommended services for this provider. ' + err.error
    // );
    /** <- Recommendations **/
  }

  onRecommendationsTabClick() {
    if (!this.recommendationsOverTimeForProvider) {
      this.recommendationsService.getRecommendationsOverTime(this.catalogueId.concat('.', this.providerId)).subscribe(
        data => this.setRecommendationsOverTimeForProvider(data),
        err => this.errorMessage = 'An error occurred while retrieving visits for this provider. ' + err.error
      );
    }
    if (!this.recommendationsOfTopServices) {
      this.recommendationsService.getMostRecommendedServices(this.catalogueId.concat('.', this.providerId)).subscribe(
        data => this.enrichMostRecommendedServices(data),
        err => this.errorMessage = 'An error occurred while retrieving most recommended services for this provider. ' + err.error
      );
    }
    if (this.enrichedRecommendationsOfCompetitorsServices.length == 0) {
      this.recommendationsService.getCompetitorsServices(this.catalogueId.concat('.', this.providerId)).subscribe(
        (data: any[]) => {
          if (data && data.length === 0) {
            this.emptyResponseOnGetCompetitorsServices = true;
          } else {
            this.setCompetitorsServices(data);
            this.emptyResponseOnGetCompetitorsServices = false;
          }
        },
        err => this.errorMessage = 'An error occurred while retrieving recommended services for this provider. ' + err.error
      );
    }
  }


  onPeriodChange(event) {
    this.statisticPeriod = event.target.value;
    this.getDataForProvider(this.statisticPeriod, true);
  }

/*  groupServicesOfProviderPerPlace(services: ServiceBundle[]) {
    const ret = {};
    if (this.providerServices && this.providerServices?.results?.length > 0) {
      for (const service of services) {
        if (service?.service?.geographicalAvailabilities) {
          for (const place of service.service.geographicalAvailabilities) {
            if (ret[place]) {
              ret[place].push(this.providerServices);
            } else {
              ret[place] = [];
            }
          }
        }
      }
    }
    return ret;
  }*/

  setVisitsForProvider(data: any) {
    if (data) {
      this.providerVisitsOptions = {
        chart: {
          height: (3 / 4 * 100) + '%', // 3:4 ratio
        },
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
          data: data
        }],
        credits: {
          enabled: false
        }
      };
    }
  }

  setAddsToProjectOptions(data: any) {
    if (data) {
      this.providerAddsToProjectOptions = {
        chart: {
          height: (3 / 4 * 100) + '%', // 3:4 ratio
        },
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
          name: 'Number of adds to project over time',
          color: '#C72B28',
          data: data
        }],
        credits: {
          enabled: false
        }
      };
    }
  }

  setOrdersOptions(data: any) {
    if (data) {
      this.providerOrdersOptions = {
        chart: {
          height: (3 / 4 * 100) + '%', // 3:4 ratio
        },
        title: {
          text: 'Number of orders over time'
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
            text: 'Number of orders'
          }
        },
        series: [{
          name: 'Favourites orders time',
          color: '#C72B28',
          data: data
        }],
        credits: {
          enabled: false
        }
      };
    }
  }

  setRatingsForProvider(data: any) {
    if (data) {
      this.providerRatingsOptions = {
        chart: {
          height: (3 / 4 * 100) + '%', // 3:4 ratio
        },
        title: {
          text: 'Number of Ratings over time'
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
          name: 'Average ratings over time',
          color: '#013203',
          data: data
        }],
        credits: {
          enabled: false
        }
      };
    }
  }

  setVisitationsForProvider(data: any) {
    if (data) {
      this.providerVisitationPercentageOptions = {
        chart: {
          height: (3 / 4 * 100) + '%', // 3:4 ratio
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false,
          type: 'pie'
        },
        title: {
          text: ''
        },
        // xAxis: {
        //     type: 'datetime',
        //     dateTimeLabelFormats: { // don't display the dummy year
        //         month: '%e. %b',
        //         year: '%b'
        //     },
        //     title: {
        //         text: 'Date'
        //     }
        // },
        // yAxis: {
        //     title: {
        //         text: 'Number of visits'
        //     }
        // },
        series: [{
          name: 'Services\' visitation percentage',
          data: data
        }],
        credits: {
          enabled: false
        }
      };
    }
  }

  setCountriesForProvider(data: any) {
    const places = this.resourceService.expandRegion(JSON.parse(JSON.stringify(data || [])), this.EU, this.WW);

    this.providerMapOptions = {
      chart: {
        map: 'custom/europe',
        height: (3 / 4 * 100) + '%', // 3:4 ratio
        // borderWidth: 1
      },
      title: {
        text: 'Countries serviced by ' + this.providerBundle.provider.name
      },
      // subtitle: {
      //     text: 'Demo of drawing all areas in the map, only highlighting partial data'
      // },
      legend: {
        enabled: false
      },
      series: [{
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

  onMapSeriesClick(e) {
    this.selectedCountryName = e.point.name;
    this.selectedCountryServices = this.geographicalDistributionMap.get(e.point.options['hc-key']);

    UIkit.modal('#servicesPerCountryModal').show();
  }

  visitSelectedServicePage(serviceId: string) {
    UIkit.modal('#servicesPerCountryModal').hide();
    this.navigator.router.navigateByUrl('/service/' + serviceId);
  }

  setMapDistributionOfServices(mapData: any) {
    if (mapData) {

      this.mapDistributionOfServicesOptions = {
        chart: {
          map: mapWorld,
          // map: 'custom/world',
          height: (3 / 4 * 100) + '%', // 3:4 ratio
        },
        title: {
          // text: 'Countries serviced by ' + this.providerBundle.provider.name
          text: ''
        },
        colorAxis: {
          min: 0,
          stops: [
            [0, '#EFEFFF'],
            [0.5, '#7BB4EB'],
            [1, '#1f3e5b']
          ]
        },

        plotOptions: {
          series: {
            events: {
              click: function(e) {
                this.onMapSeriesClick(e);
              }.bind(this)
            }
          }
        },

        legend: {
          layout: 'vertical',
          align: 'left',
          verticalAlign: 'bottom'
        },
        // legend: {
        //   enabled: false
        // },
        mapNavigation: {
          enabled: true,
          enableMouseWheelZoom: false,
          buttonOptions: {
            verticalAlign: 'top'
          }
        },
        series: [{
          name: 'Country',
          // data: mapData.map(item => ([item.country, item])),
          data: mapData.map(item => ([item.key.toLowerCase(), item.values.length])),
          // data: mapData.map(item => ([item.key.toLowerCase(), item.values])),
          // data: mapData,
          // point: {
          //   events: {
          //     click: this.selectCountryOnMapDistribution
          //   }
          // },
          // tooltip: {
          //   useHTML: true,
          //   hideDelay: 1500,
          //   style: {
          //     pointerEvents: 'auto'
          //   },
          //   headerFormat: '',
          //   pointFormat: '{point.value.values.length}'
          // }
        }],
        credits: {
          enabled: false
        }
      };
    }
  }

  setCategoriesPerServiceForProvider(categories: string[], data: number[]) {
    this.categoriesPerServiceForProvider = {
      chart: {
        type: 'bar',
        height: (3 / 4 * 100) + '%' // 3:4 ratio
      },
      title: {
        text: environment.serviceORresource + ' distribution in categories'
      },
      xAxis: {
        categories: categories,
        title: {
          text: ''
        }
      },
      series: [{
        name: 'Categories',
        color: '#7720b6',
        data: data
      }],
      yAxis: {
        min: 0,
        title: {
          text: 'Number of services'
        },
        labels: {
          overflow: 'justify',
          display: 'none'
        }
      },
      tooltip: {
        valueSuffix: ' services'
      },
      plotOptions: {
        bar: {
          dataLabels: {
            enabled: true
          }
        }
      },
      credits: {
        enabled: false
      }
    };
  }

  setDomainsPerServiceForProvider(categories: string[], data: number[]) {
    this.domainsPerServiceForProvider = {
      chart: {
        type: 'bar',
        height: (3 / 4 * 100) + '%' // 3:4 ratio
      },
      title: {
        text: environment.serviceORresource + ' distribution in scientific domains'
      },
      xAxis: {
        categories: categories,
        title: {
          text: ''
        }
      },
      series: [{
        name: 'Scientific Domains',
        color: '#1326a8',
        data: data
      }],
      yAxis: {
        min: 0,
        title: {
          text: 'Number of services'
        },
        labels: {
          overflow: 'justify',
          display: 'none'
        }
      },
      tooltip: {
        valueSuffix: ' services'
      },
      plotOptions: {
        bar: {
          dataLabels: {
            enabled: true
          }
        }
      },
      credits: {
        enabled: false
      }
    };
  }

  setTargetUsersPerServiceForProvider(categories: string[], data: number[]) {
    this.targetUsersPerServiceForProvider = {
      chart: {
        type: 'bar',
        height: (3 / 4 * 100) + '%' // 3:4 ratio
      },
      title: {
        text: environment.serviceORresource + ' distribution in target users'
      },
      xAxis: {
        categories: categories,
        title: {
          text: ''
        }
      },
      series: [{
        name: 'Target users',
        color: '#80116d',
        data: data
      }],
      yAxis: {
        min: 0,
        title: {
          text: 'Number of services'
        },
        labels: {
          overflow: 'justify',
          display: 'none'
        }
      },
      tooltip: {
        valueSuffix: ' services'
      },
      plotOptions: {
        bar: {
          dataLabels: {
            enabled: true
          }
        }
      },
      credits: {
        enabled: false
      }
    };
  }

  setAccessModesPerServiceForProvider(categories: string[], data: number[]) {
    this.accessModesPerServiceForProvider = {
      chart: {
        type: 'bar',
        height: (3 / 4 * 100) + '%' // 3:4 ratio
      },
      title: {
        text: environment.serviceORresource + ' distribution in access modes'
      },
      xAxis: {
        categories: categories,
        title: {
          text: ''
        }
      },
      series: [{
        name: 'Access modes',
        color: '#de882d',
        data: data
      }],
      yAxis: {
        min: 0,
        title: {
          text: 'Number of services'
        },
        labels: {
          overflow: 'justify',
          display: 'none'
        }
      },
      tooltip: {
        valueSuffix: ' services'
      },
      plotOptions: {
        bar: {
          dataLabels: {
            enabled: true
          }
        }
      },
      credits: {
        enabled: false
      }
    };
  }

  setAccessTypesPerServiceForProvider(categories: string[], data: number[]) {
    this.accessTypesPerServiceForProvider = {
      chart: {
        type: 'bar',
        height: (3 / 4 * 100) + '%' // 3:4 ratio
      },
      title: {
        text: environment.serviceORresource + ' distribution in access types'
      },
      xAxis: {
        categories: categories,
        title: {
          text: ''
        }
      },
      series: [{
        name: 'Access types',
        color: '#db510b',
        data: data
      }],
      yAxis: {
        min: 0,
        title: {
          text: 'Number of services'
        },
        labels: {
          overflow: 'justify',
          display: 'none'
        }
      },
      tooltip: {
        valueSuffix: ' services'
      },
      plotOptions: {
        bar: {
          dataLabels: {
            enabled: true
          }
        }
      },
      credits: {
        enabled: false
      }
    };
  }

  setOrderTypesPerServiceForProvider(categories: string[], data: number[]) {
    this.orderTypesPerServiceForProvider = {
      chart: {
        type: 'bar',
        height: (3 / 4 * 100) + '%' // 3:4 ratio
      },
      title: {
        text: environment.serviceORresource + ' distribution in order types'
      },
      xAxis: {
        categories: categories,
        title: {
          text: ''
        }
      },
      series: [{
        name: 'Order types',
        color: '#298e13',
        data: data
      }],
      yAxis: {
        min: 0,
        title: {
          text: 'Number of services'
        },
        labels: {
          overflow: 'justify',
          display: 'none'
        }
      },
      tooltip: {
        valueSuffix: ' services'
      },
      plotOptions: {
        bar: {
          dataLabels: {
            enabled: true
          }
        }
      },
      credits: {
        enabled: false
      }
    };
  }

  setRecommendationsOverTimeForProvider(data: any) {
    const chartData = [];
    data.forEach((value) => {
      chartData.push([Date.parse(value.date), value.recommendations]);
    });

    if (data) {
      this.recommendationsOverTimeForProvider = {
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

  enrichMostRecommendedServices(data: any) {
    const observables = data.map(item =>
      this.resourceService.getService(item.service_id, /\..*\./.test(item.service_id) ? item.service_id.split(".")[0] : this.catalogueConfigId)
    );

    combineLatest(observables).subscribe({
      next: results => {
        const updatedData = data.map((item, index) => ({
          ...item,
          service_name: results[index]?.name
        }));
        this.setMostRecommendedServices(updatedData);
      },
      error: err => {
        this.errorMessage = err;
      }
    });
  }

  setMostRecommendedServices(data: any) {
    this.recommendationsOfTopServices = {
      chart: {
        type: 'bar',
        height: (3 / 4 * 100) + '%' // 3:4 ratio
      },
      title: {
        text: 'Most recommended'
      },
      xAxis: {
        type: 'category',
        title: {
          text: 'Service'
        }
      },
      series: [{
        name: 'Recommendations',
        data: data.map(item => [item.service_name, item.recommendations])
      }],
      yAxis: {
        min: 0,
        title: {
          text: 'Number of recommendations'
        },
        labels: {
          overflow: 'justify',
          display: 'none'
        }
      },
      // tooltip: {
      //   valueSuffix: ' services'
      // },
      plotOptions: {
        bar: {
          dataLabels: {
            enabled: true
          }
        }
      },
      credits: {
        enabled: false
      }
    };
  }

  setCompetitorsServices(data: any) {
    this.recommendationsOfCompetitorsServices = data;
    this.enrichedRecommendationsOfCompetitorsServices = [];

    for (const item of data) {
      const competitorsWithDetails = [];

      // let competitorPublicIds = [];
      for (const competitor of item.competitors) {
        if (competitor.service_id !== 'tnp.lumi_etais__regular_access') {
          // competitorPublicIds.push(competitor.service_id);
          const isPublicId = /\..*\./.test(competitor.service_id); // if it has two dot occurrences its a publicId
          this.resourceService.getService(competitor.service_id, isPublicId ? competitor.service_id.split(".")[0] : this.catalogueConfigId).subscribe(
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
        }
      }
      const itemWithDetails = {
        service_id: item.service_id,
        total_competitor_recommendations: item.total_competitor_recommendations,
        competitors: competitorsWithDetails
      };
      this.enrichedRecommendationsOfCompetitorsServices.push(itemWithDetails);
    }

    // let outerServicesPublicIds = [];
    for (const item of this.enrichedRecommendationsOfCompetitorsServices) {
      // outerServicesPublicIds.push(item.service_id);
      const isPublicId = /\..*\./.test(item.service_id); // if it has two dot occurrences its a publicId
      this.resourceService.getService(item.service_id, isPublicId ? item.service_id.split(".")[0] : this.catalogueConfigId).subscribe(
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

}
