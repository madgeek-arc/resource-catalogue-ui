import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Subscription, Observable} from 'rxjs';
import {Provider, Service, ServiceHistory} from '../../../domain/eic-model';
import {AuthenticationService} from '../../../services/authentication.service';
import {NavigationService} from '../../../services/navigation.service';
import {ResourceService} from '../../../services/resource.service';
import {UserService} from '../../../services/user.service';
import {SearchResults} from '../../../domain/search-results';
import {ServiceProviderService} from '../../../services/service-provider.service';
import {map} from 'rxjs/operators';
import {zip} from 'rxjs/internal/observable/zip';

@Component({
  selector: 'app-service-dashboard',
  templateUrl: './service-dashboard.component.html',
  styleUrls: ['./service-dashboard.component.css']
})
export class ServiceDashboardComponent implements OnInit {

  public service: Service;
  public errorMessage: string;
  private sub: Subscription;

  public EU: string[];
  public WW: string[];

  serviceVisitsOptions: any = null;
  serviceRatingsOptions: any = null;
  serviceFavouritesOptions: any = null;
  serviceMapOptions: any = null;

  serviceHistory: SearchResults<ServiceHistory>;
  myProviders: Provider[] = [];
  canEditService = false;

  constructor(private route: ActivatedRoute, private router: NavigationService, private resourceService: ResourceService,
              private authenticationService: AuthenticationService, private userService: UserService,
              private providerService: ServiceProviderService) {
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      zip(
        this.resourceService.getEU(),
        this.resourceService.getWW(),
        this.resourceService.getService(params['id']),
        this.providerService.getMyServiceProviders()
      ).subscribe(suc => {
        this.EU = <string[]>suc[0];
        this.WW = <string[]>suc[1];
        this.service = <Service>suc[2];
        this.myProviders = suc[3];
        this.getDataForService(this.service);

        /* check if the current user can edit the service */
        this.canEditService = this.myProviders.some(p => this.service.providers.some(x => x === p.id));
      });
    });
  }

  getDataForService(service) {

    this.setCountriesForService(this.service.places);

    this.resourceService.getVisitsForService(this.service.id).pipe(
      map(data => {
        // THESE 3 weird lines should be deleted when pgl makes everything ok :)
        return Object.entries(data).map((d) => {
          return [new Date(d[0]).getTime(), d[1]];
        }).sort((l, r) => l[0] - r[0]);
      })).subscribe(
      data => this.setVisitsForService(data),
      // error => this.handleError(<any>error)
    );

    this.resourceService.getFavouritesForService(this.service.id).pipe(
      map(data => {
      // THESE 3 weird lines should be deleted when pgl makes everything ok :)
      return Object.entries(data).map((d) => {
        return [new Date(d[0]).getTime(), d[1]];
      }).sort((l, r) => l[0] - r[0]);
    })).subscribe(
      data => this.setFavouritesForService(data),
      // error => this.handleError(<any>error)
    );

    this.resourceService.getRatingsForService(this.service.id).pipe(
      map(data => {
      // console.log('Ratings', data);
      // THESE 3 weird lines should be deleted when pgl makes everything ok :)
      return Object.entries(data).map((d) => {
        return [new Date(d[0]).getTime(), d[1]];
      }).sort((l, r) => l[0] - r[0]);
    })).subscribe(
      data => this.setRatingsForService(data),
      // error => this.handleError(<any>error)
    );


    this.resourceService.getServiceHistory(this.service.id).subscribe(
      searchResults => this.serviceHistory = searchResults,
      error => this.handleError(<any>error));
  }

  setVisitsForService(data: any) {
    if (data) {
      this.serviceVisitsOptions = {
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
          color: '#036166',
          data: data
        }]
      };
    }
  }

  setFavouritesForService(data: any) {
    if (data) {
      this.serviceFavouritesOptions = {
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
          color: '#C36000',
          data: data
        }]
      };

    }
  }

  setRatingsForService(data: any) {
    if (data) {
      this.serviceRatingsOptions = {
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
          name: 'Average rating over time',
          color: '#6B0035',
          data: data
        }]
      };

    }
  }

  setCountriesForService(data: any) {
    const places = this.resourceService.expandRegion(JSON.parse(JSON.stringify(data || [])), this.EU, this.WW);

    this.serviceMapOptions = {
      chart: {
        map: 'custom/europe',
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
    this.errorMessage = 'System error retrieving service (Server responded: ' + error + ')';
  }
}
