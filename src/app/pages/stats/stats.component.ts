import { Component, OnInit } from '@angular/core';
import { isNullOrUndefined } from 'util';
import { zip } from 'rxjs/internal/observable/zip';
import {Observable} from 'rxjs';
import { AuthenticationService } from '../../services/authentication.service';
import { ResourceService } from '../../services/resource.service';
import { NavigationService } from '../../services/navigation.service';
import { ActivatedRoute } from '@angular/router';
import { ServiceProviderService } from '../../services/service-provider.service';
import {InfraService, MapValues, Provider, Service} from '../../domain/eic-model';
import { map } from 'rxjs/operators';
import { Pagination } from '../../domain/pagination';

declare var UIkit: any;


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

  providerVisitationPercentageOptions: any = null;
  providerMapOptions: any = null;
  mapDistributionOfServicesOptions: any = null;
  categoriesPerServiceForProvider: any = null;
  domainsPerServiceForProvider: any = null;
  targetUsersPerServiceForProvider: any = null;
  accessModesPerServiceForProvider: any = null;
  accessTypesPerServiceForProvider: any = null;
  orderTypesPerServiceForProvider: any = null;

  selectedCountryName: string = null;
  selectedCountryServices: any = null;
  geographicalDistributionMap: any = null;

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

    /* bar charts */
    this.resourceService.getCategoriesPerServiceForProvider().subscribe(
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

    this.resourceService.getDomainsPerServiceForProvider().subscribe(
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

    this.resourceService.getTargetUsersPerServiceForProvider().subscribe(
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

    this.resourceService.getAccessModesPerServiceForProvider().subscribe(
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

    this.resourceService.getAccessTypesPerServiceForProvider().subscribe(
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

    this.resourceService.getOrderTypesPerServiceForProvider().subscribe(
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

  onMapSeriesClick(e) {
    this.selectedCountryName = e.originalEvent.point.name;
    this.selectedCountryServices = this.geographicalDistributionMap.get(e.originalEvent.point['hc-key']);

    UIkit.modal('#servicesPerCountryModal').show();
  }

  visitSelectedServicePage(serviceId: string) {
    UIkit.modal('#servicesPerCountryModal').hide();
    this.router.router.navigateByUrl('/service/' + serviceId);
  }

  setMapDistributionOfServices(mapData: any) {

    if (mapData) {

      this.mapDistributionOfServicesOptions = {
        chart: {
          map: 'custom/world-highres2',
          // map: 'custom/world',
          height: (3 / 4 * 100) + '%', // 3:4 ratio
        },
        title: {
          // text: 'Countries serviced by ' + this.provider.name
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
