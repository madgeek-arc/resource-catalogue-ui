import { Component, OnInit } from '@angular/core';
import { isNullOrUndefined } from 'util';
import { zip } from 'rxjs/internal/observable/zip';
import {Observable} from 'rxjs';
import { AuthenticationService } from '../../../../services/authentication.service';
import { ResourceService } from '../../../../services/resource.service';
import { NavigationService } from '../../../../services/navigation.service';
import { ActivatedRoute } from '@angular/router';
import { ServiceProviderService } from '../../../../services/service-provider.service';
import { InfraService, Provider, Service } from '../../../../domain/eic-model';
import { map } from 'rxjs/operators';
import { Pagination } from '../../../../domain/pagination';
import UIkit from 'uikit';

declare var require: any;


@Component({
  selector: 'app-provider-stats',
  templateUrl: './stats.component.html',
  // styleUrls: ['']
})

export class StatsComponent implements OnInit {
  providerId: string;
  statisticPeriod: string;
  provider: Provider;
  providerServices: Pagination<InfraService>;
  providerServicesGroupedByPlace: any;
  providerCoverage: string[];
  public errorMessage: string;

  public EU: string[];
  public WW: string[];

  providerVisitsOptions: any = null;
  providerRatingsOptions: any = null;
  providerFavouritesOptions: any = null;
  providerVisitationPercentageOptions: any = null;
  providerMapOptions: any = null;
  mapDistributionOfServices: any = null;
  categoriesPerServiceForProvider: any = null;
  domainsPerServiceForProvider: any = null;
  targetUsersPerServiceForProvider: any = null;
  accessModesPerServiceForProvider: any = null;
  accessTypesPerServiceForProvider: any = null;
  orderTypesPerServiceForProvider: any = null;
  modalCoords: any = null;
  selectedCountryName = '';
  selectedCountryServices: Service[] = [];
  constructor(
    public authenticationService: AuthenticationService,
    // public userService: UserService,
    public resourceService: ResourceService,
    public router: NavigationService,
    private route: ActivatedRoute,
    private providerService: ServiceProviderService
  ) { }

  ngOnInit(): void {
    this.statisticPeriod = 'MONTH';
    this.providerId = this.route.parent.snapshot.paramMap.get('provider');
    if (!isNullOrUndefined(this.providerId) && (this.providerId !== '')) {
      zip(
        this.resourceService.getEU(),
        this.resourceService.getWW(),
        this.providerService.getServiceProviderById(this.providerId)
        /*this.resourceService.getProvidersNames()*/
      ).subscribe(suc => {
        this.EU = <string[]>suc[0];
        this.WW = <string[]>suc[1];
        this.provider = suc[2];
        this.getDataForProvider(this.statisticPeriod);
      });
    } else {
      this.providerService.getMyServiceProviders().subscribe(
        res => {
          this.providerId = res[0].id;
          zip(
            this.resourceService.getEU(),
            this.resourceService.getWW(),
            this.providerService.getServiceProviderById(this.providerId)
            /*this.resourceService.getProvidersNames()*/
          ).subscribe(suc => {
            this.EU = <string[]>suc[0];
            this.WW = <string[]>suc[1];
            this.provider = suc[2];
            this.getDataForProvider(this.statisticPeriod);
          });
        },
        err => {
          console.log(err);
          this.errorMessage = 'An error occurred while retrieving data for this service. ' + err.error;
        }
      );
    }
  }

  getDataForProvider(period: string, dontGetServices?: boolean) {

    if (!dontGetServices) {
      this.providerService.getServicesOfProvider(this.providerId)
        .subscribe(res => {
          this.providerServices = res;
          this.providerServicesGroupedByPlace = this.groupServicesOfProviderPerPlace(this.providerServices.results);
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

    this.resourceService.getFavouritesForProvider(this.providerId, period).pipe(
      map(data => {
        // THESE 3 weird lines should be deleted when pgl makes everything ok :)
        return Object.entries(data).map((d) => {
          return [new Date(d[0]).getTime(), d[1]];
        }).sort((l, r) => l[0] - r[0]);
      })).subscribe(
      data => this.setFavouritesForProvider(data),
      err => {
        this.errorMessage = 'An error occurred while retrieving favourites for this provider. ' + err.error;
      }
    );

    this.resourceService.getRatingsForProvider(this.providerId, period).pipe(
      map(data => {
        // THESE 3 weird lines should be deleted when pgl makes everything ok :)
        return Object.entries(data).map((d) => {
          return [new Date(d[0]).getTime(), d[1]];
        }).sort((l, r) => l[0] - r[0]);
      })).subscribe(
      data => this.setRatingsForProvider(data),
      err => {
        this.errorMessage = 'An error occurred while retrieving ratings for this provider. ' + err.error;
      }
    );

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
    this.setMapDistributionOfServices(this.resourceService.getMapDistributionOfServices());
    // console.log('Places', this.resourceService.getPlacesForProvider(this.provider));
  }

  onPeriodChange(event) {
    this.statisticPeriod = event.target.value;
    this.getDataForProvider(this.statisticPeriod, true);
  }

  groupServicesOfProviderPerPlace(services: InfraService[]) {
    const ret = {};
    if (this.providerServices && this.providerServices.results.length > 0) {
      for (const service of services) {
        for (const place of service.service.places) {
          if (ret[place]) {
            ret[place].push(this.providerServices);
          } else {
            ret[place] = [];
          }
        }
      }
    }
    return ret;
  }

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
        }]
      };
    }
  }

  setFavouritesForProvider(data: any) {
    if (data) {
      this.providerFavouritesOptions = {
        chart: {
          height: (3 / 4 * 100) + '%', // 3:4 ratio
        },
        title: {
          text: 'Number of favorites over time'
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
            text: 'Number of favourites'
          }
        },
        series: [{
          name: 'Favourites over time',
          color: '#C72B28',
          data: data
        }]
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
          text: ''
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
        }]
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
        }]
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
        text: 'Countries serviced by ' + this.provider.name
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
      }]
    };
  }
  selectCountryOnMapDistribution(ev: any) {
    console.log(ev);
    this.modalCoords = JSON.stringify({
      'top.px': ev.x,
      'left.px': ev.y,
    });
    this.selectedCountryName = ev.point.properties["country-abbrev"]
    this.selectedCountryServices = ev.point.value.values
    const modal = UIkit.modal('#country-service-modal');
    modal.toggle();
  }
  getModalCoords() {
    return this.modalCoords;
  }
  setMapDistributionOfServices(data: any) {
    if (data) {
      this.mapDistributionOfServices = {
        chart: {
          map: 'custom/world-highres2',
          height: (3 / 4 * 100) + '%', // 3:4 ratio
        },
        title: {
          text: 'Countries serviced by ' + this.provider.name
        },

        legend: {
          enabled: false
        },
        mapNavigation: {
          enabled: true,
          buttonOptions: {
            verticalAlign: 'bottom'
          }
        },
        series: [{
          name: 'Country',
          data: data.map(item => ([item.country, item])),
          point: {
            events: {
              click: this.selectCountryOnMapDistribution
            }
          },
          tooltip: {
            useHTML: true,
            hideDelay: 1500,
            style: {
              pointerEvents: 'auto'
            },
            headerFormat: '',
            pointFormat: '{point.value.values.length}'
          }
        }]
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
        text: 'Service distribution in categories'
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
        enabled: true
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
        text: 'Service distribution in scientific domains'
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
        enabled: true
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
        text: 'Service distribution in target users'
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
        enabled: true
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
        text: 'Service distribution in access modes'
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
        enabled: true
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
        text: 'Service distribution in access types'
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
        enabled: true
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
        text: 'Service distribution in order types'
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
        enabled: true
      }
    };
  }

}
