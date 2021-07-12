import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';
import {ProviderBundle, RichService, Type, Vocabulary} from '../../../domain/eic-model';
import {AuthenticationService} from '../../../services/authentication.service';
import {NavigationService} from '../../../services/navigation.service';
import {ResourceService} from '../../../services/resource.service';
import {UserService} from '../../../services/user.service';
import {ServiceProviderService} from '../../../services/service-provider.service';
import {FormBuilder} from '@angular/forms';
import {flatMap} from 'rxjs/operators';
import {zip} from 'rxjs';
import {EmailService} from '../../../services/email.service';
import {environment} from '../../../../environments/environment';
import {MatomoTracker} from 'ngx-matomo';
import * as Highcharts from 'highcharts';
import MapModule from 'highcharts/modules/map';
MapModule(Highcharts);

declare var require: any;
const mapWorld = require('@highcharts/map-collection/custom/world.geo.json')
declare var UIkit: any;

@Component({
  selector: 'app-service-landing-page',
  templateUrl: './service-landing-page.component.html',
  styleUrls: ['../landing-page.component.css']
})
export class ServiceLandingPageComponent implements OnInit, OnDestroy {

  public projectName = environment.projectName;

  serviceORresource = environment.serviceORresource;

  Highcharts: typeof Highcharts = Highcharts;
  chartConstructor = 'mapChart';
  services: RichService[] = [];
  public richService: RichService;
  public errorMessage: string;
  public EU: string[];
  public WW: string[];
  public serviceId;
  private sub: Subscription;

  weights: string[] = ['EU', 'WW'];
  serviceMapOptions: any = null;
  myProviders: ProviderBundle[] = [];
  context = '';

  formError = '';
  showForm = false;
  canEditService = false;
  canAddOrEditService = false;
  placesVocIdArray: string[] = [];
  places: Vocabulary[] = null;

  constructor(public route: ActivatedRoute,
              public router: NavigationService,
              public resourceService: ResourceService,
              public authenticationService: AuthenticationService,
              public userService: UserService,
              private fb: FormBuilder,
              private providerService: ServiceProviderService,
              private matomoTracker: MatomoTracker,
              public emailService: EmailService) {
  }

  ngOnInit() {
    this.canEditService = false;

    if (this.authenticationService.isLoggedIn()) {
      this.sub = this.route.params.subscribe(params => {
        zip(
          this.resourceService.getEU(),
          this.resourceService.getWW(),
          // this.resourceService.getSelectedServices([params["id"]]),
          this.resourceService.getRichService(params['id'], params['version']),
          this.providerService.getMyServiceProviders(),
          // this.resourceService.recordEvent(params["id"], "INTERNAL"),
        ).subscribe(suc => {
            this.EU = <string[]>suc[0];
            this.WW = <string[]>suc[1];
            this.richService = <RichService>suc[2];
            this.myProviders = suc[3];
            this.serviceId = params['id'];
            this.getLocations();
            this.router.breadcrumbs = this.richService.service.name;
            this.setCountriesForService(this.richService.service.geographicalAvailabilities);

            /* check if the current user can edit the service */
            this.canEditService = this.myProviders.some(p => this.richService.service.resourceProviders.some(x => x === p.id));

            if (this.projectName === 'OpenAIRE Catalogue') {
              this.canAddOrEditService = this.myProviders.some(p => p.id === 'openaire');
            }

            const serviceIDs = (this.richService.service.requiredResources || []).concat(this.richService.service.relatedResources || [])
              .filter((e, i, a) => a.indexOf(e) === i && e !== '');
            if (serviceIDs.length > 0) {
              this.resourceService.getSelectedServices(serviceIDs).subscribe(
                services => this.services = services,
                err => {
                  console.log(err.error);
                  this.errorMessage = err.error;
                });
            }
          },
          err => {
            if (err.status === 404) {
              this.router.go('/404');
            }
            this.errorMessage = 'An error occurred while retrieving data for this service. ' + err.error;
          },
          () => {
            this.context = this.richService.service.description;
            this.matomoTracker.trackEvent('Recommendations', this.authenticationService.getUserEmail() + ' ' + this.serviceId, 'visit', 1);
          });
      });
    } else {
      this.sub = this.route.params.subscribe(params => {
        zip(
          this.resourceService.getEU(),
          this.resourceService.getWW(),
          this.resourceService.getRichService(params['id'])
          // this.resourceService.recordEvent(params["id"], "INTERNAL"),
        ).subscribe(suc => {
            this.EU = <string[]>suc[0];
            this.WW = <string[]>suc[1];
            this.richService = <RichService>suc[2];
            this.router.breadcrumbs = this.richService.service.name;
            this.setCountriesForService(this.richService.service.geographicalAvailabilities);

            const serviceIDs = (this.richService.service.requiredResources || []).concat(this.richService.service.relatedResources || [])
              .filter((e, i, a) => a.indexOf(e) === i && e !== '');
            if (serviceIDs.length > 0) {
              this.resourceService.getSelectedServices(serviceIDs)
                .subscribe(services => this.services = services,
                  err => {
                    console.log(err.error);
                    this.errorMessage = err.error;
                  });
            }
          },
          err => {
            this.errorMessage = 'An error occurred while retrieving data for this service. ' + err.error;
          },
          () => {
            this.context = this.richService.service.description;
          });
      });
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  setCountriesForService(data: any) {
    if (this.richService) {
      const places = this.resourceService.expandRegion(JSON.parse(JSON.stringify(data || [])), this.EU, this.WW);

      let map = 'custom/europe';
      data.forEach(function (element) {
        if (element === 'WW') {
          map = 'custom/world-highres2';
        }
      });

      this.serviceMapOptions = {
        chart: {
          map: map,
          // map: 'custom/europe',
          // borderWidth: 1
        },
        title: {
          text: 'Countries serviced by ' + this.richService.service.name
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
  }

  addToFavourites() {
    this.userService.addFavourite(this.richService.service.id, !this.richService.isFavourite).pipe(
      flatMap(e => this.resourceService.getSelectedServices([e.service])))
      .subscribe(
        res => {
          Object.assign(this.richService, res[0]);
        },
        err => {
          this.errorMessage = 'Could not add service to favourites. ' + err.error;
        }
      );
  }

  rateService(rating: number) {
    this.userService.rateService(this.richService.service.id, rating).pipe(
      flatMap(e => this.resourceService.getSelectedServices([e.service])))
      .subscribe(
        res => {
          Object.assign(this.richService, res[0]);
        },
        err => {
          this.errorMessage = 'Could not add a rating to this service. ' + err.error;
        }
      );
  }

  getPrettyService(id) {
    return (this.services || []).find(e => e.service.id === id);
    // || {id, name: 'Name not found!'};
  }

  handleError(error) {
    this.errorMessage = 'System error loading service (Server responded: ' + error + ')';
  }

  showFormFields() {
    this.showForm = !this.showForm;
  }

  getLocations() {
    this.resourceService.getNewVocabulariesByType(Type.COUNTRY).subscribe(
      suc => {
        this.places = suc;
        this.placesVocIdArray = this.places.map(place => place.id);
      },
      err => {
        this.errorMessage = 'Could not retrieve Places from server. ' + err.error;
      }
    );
  }

  getPlace(placeId: string) {
    return this.places.find(value => value.id === placeId);
  }

}
