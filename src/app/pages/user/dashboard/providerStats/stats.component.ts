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
  modalCoords: any = null;
  selectedCountry: any = {};
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
      this.setCategoriesPerServiceForProvider(this.resourceService.getCategoriesPerServiceForProvider(this.providerId));
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
  public getSelectedCountry(): any {
    const selectedCountry = new Observable(observer => {
           setTimeout(() => {
               observer.next(this.selectedCountry);
           }, 1000);
    });

    return selectedCountry;
}
  selectCountryOnMapDistribution(ev: any) {
    console.log(ev);
    this.modalCoords = JSON.stringify({
      'top.px': ev.x,
      'left.px': ev.y,
    });
    this.selectedCountry = {
      title: ev.point.properties["country-abbrev"],
      services: ev.point.value.values
    }
    const modal = UIkit.modal('#country-service-modal');
    modal.toggle();
    modal.on('hide', function () {
      this.modalCoords = null
    })
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
  setCategoriesPerServiceForProvider(data: any) {
    this.categoriesPerServiceForProvider = {
      chart: {
        type: 'bar'
      },
      title: {
        text: 'Provider Dummy'
      },
      subtitle: {
        text: 'Source: <a href="dummy.url">Dummy.com</a>'
      },
      xAxis: {
        categories: Object.keys(data),
        title: {
          text: 'Service Type'
        }
      },
      series: [{
        data: Object.values(data)
      }],
      yAxis: {
        min: 0,
        title: {
          text: 'Quantity',
          align: 'high'
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
            enabled: false
          }
        }
      },

      credits: {
        enabled: false
      },
    };
  }
}
