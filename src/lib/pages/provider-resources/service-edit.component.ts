import {Component, Injector, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DatePipe} from '@angular/common';
import {ServiceFormComponent} from './service-form.component';
import {AuthenticationService} from '../../services/authentication.service';
import {Subscription} from 'rxjs';
import {Service, ServiceBundle} from '../../domain/eic-model';
import {ResourceService} from '../../services/resource.service';
import {ServiceProviderService} from '../../services/service-provider.service';
import {NavigationService} from "../../services/navigation.service";
import {RecommendationsService} from "../../services/recommendations.service";
import {CatalogueService} from "../../services/catalogue.service";
import {pidHandler} from "../../shared/pid-handler/pid-handler.service";
import {FormControlService} from "../../../dynamic-catalogue/services/form-control.service";
import {environment} from '../../../environments/environment';
import {ConfigService} from "../../services/config.service";

@Component({
    selector: 'app-service-edit',
    templateUrl: './service-form.component.html',
    styleUrls: ['../provider/service-provider-form.component.css'],
    standalone: false
})
export class ServiceEditComponent extends ServiceFormComponent implements OnInit {

  catalogueConfigId: string = this.config.getProperty('catalogueId');
  private sub: Subscription;
  // private serviceID: string;

  constructor(public route: ActivatedRoute,
              public authenticationService: AuthenticationService,
              protected serviceProviderService: ServiceProviderService,
              protected recommendationsService: RecommendationsService,
              protected catalogueService: CatalogueService,
              protected injector: Injector,
              public datePipe: DatePipe,
              public navigator: NavigationService,
              public pidHandler: pidHandler,
              public dynamicFormService: FormControlService,
              public router: Router,
              public config: ConfigService) {
    super(injector, authenticationService, serviceProviderService, recommendationsService, catalogueService, route, pidHandler, dynamicFormService, router, config);
    this.editMode = true;
  }

  ngOnInit() {
    const path = this.route.snapshot.routeConfig.path;
    if (path.includes(':catalogueId')) { this.catalogueId = this.route.snapshot.paramMap.get('catalogueId') }
    else { this.catalogueId = this.catalogueConfigId }
    if (path === ':catalogueId/:providerId/resource/view/:resourceId') this.disable = true; // view-only mode
    super.ngOnInit();
    if (sessionStorage.getItem('service')) {
      sessionStorage.removeItem('service');
    } else {
      this.sub = this.route.params.subscribe(params => {
        // this.serviceId = params['resourceId'];
        this.serviceId = this.route.snapshot.paramMap.get('resourceId');
        const pathName = window.location.pathname;
        if (pathName.includes('draft-resource/update')) this.pendingService = true;
        if (this.pendingService) {
          this.resourceService.getPendingService(this.serviceId)
            .subscribe(service => {
                this.payloadAnswer = {'answer': {Service: service}};
                //clear below
                if (service.mainContact === null) //in case of unauthorized access backend will not show sensitive info
                  this.navigator.go('/forbidden')
                ResourceService.removeNulls(service);
                //remove catalogueId. prefix for same catalogue entries
                if (service.requiredResources) {
                  service.requiredResources = service.requiredResources.map(value => value.startsWith(this.catalogueId) ? value.substring(this.catalogueId.length + 1) : value);
                }
                if (service.relatedResources) {
                  service.relatedResources = service.relatedResources.map(value => value.startsWith(this.catalogueId) ? value.substring(this.catalogueId.length + 1) : value);
                }
                this.serviceForm.patchValue(service);
                for (const i in this.serviceForm.controls) {
                  if (this.serviceForm.controls[i].value === null) {
                    this.serviceForm.controls[i].setValue('');
                  }
                }
                if (this.serviceForm.get('lastUpdate').value) {
                  const lastUpdate = new Date(this.serviceForm.get('lastUpdate').value);
                  this.serviceForm.get('lastUpdate').setValue(this.datePipe.transform(lastUpdate, 'yyyy-MM-dd'));
                }
              },
              err => this.errorMessage = 'Could not get the data for the requested service. ' + err.error,
              () => {
                if (window.location.href.indexOf('/add/use-template') > -1) {
                  this.editMode = false;
                  this.serviceForm.get('id').setValue('');
                  this.serviceForm.get('name').setValue('');
                }
                if (this.disable) {
                  this.serviceForm.disable();
                  this.serviceName = this.serviceForm.get('name').value;
                } else {
                  // this.initServiceBitSets();
                }
              }
            );
        }
      });
      if (!this.pendingService) {
        this.resourceService.getServiceBundleById(this.serviceId, this.catalogueId)
          .subscribe(serviceBundle => {
              this.service = serviceBundle.service;
              const parsedService = {
                ...this.service,
                horizontalService: typeof this.service.horizontalService === 'boolean' ? this.service.horizontalService.toString() : this.service.horizontalService
              };
              this.payloadAnswer = {'answer': {Service: parsedService}};
              //clear below

/*              if (serviceBundle.service.mainContact === null) //in case of unauthorized access backend will not show sensitive info
                this.navigator.go('/forbidden')
              ResourceService.removeNulls(serviceBundle.service);
              //remove catalogueId. prefix for same catalogue entries
              if (serviceBundle.service.requiredResources) {
                serviceBundle.service.requiredResources = serviceBundle.service.requiredResources.map(value => value.startsWith(this.catalogueId) ? value.substring(this.catalogueId.length + 1) : value);
              }
              if (serviceBundle.service.relatedResources) {
                serviceBundle.service.relatedResources = serviceBundle.service.relatedResources.map(value => value.startsWith(this.catalogueId) ? value.substring(this.catalogueId.length + 1) : value);
              }*/
              this.serviceForm.patchValue(serviceBundle.service);
              for (const i in this.serviceForm.controls) {
                if (this.serviceForm.controls[i].value === null) {
                  this.serviceForm.controls[i].setValue('');
                }
              }
              if (this.serviceForm.get('lastUpdate').value) {
                const lastUpdate = new Date(this.serviceForm.get('lastUpdate').value);
                this.serviceForm.get('lastUpdate').setValue(this.datePipe.transform(lastUpdate, 'yyyy-MM-dd'));
              }
            },
            err => this.errorMessage = 'Could not get the data for the requested service. ' + err.error,
            () => {
              if (window.location.href.indexOf('/add/use-template') > -1) {
                this.editMode = false;
                this.serviceForm.get('id').setValue('');
                this.serviceForm.get('name').setValue('');
              }
              if (this.disable) {
                this.serviceForm.disable();
                this.serviceName = this.serviceForm.get('name').value;
              } else {
                // this.initServiceBitSets();
              }
            }
          );
      }
    }
  }

}
