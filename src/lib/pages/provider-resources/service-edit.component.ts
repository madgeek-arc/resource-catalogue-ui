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
import {CatalogueService} from "../../services/catalogue.service";
import {pidHandler} from "../../shared/pid-handler/pid-handler.service";
import {FormControlService} from "../../../dynamic-catalogue/services/form-control.service";
import {environment} from '../../../environments/environment';
import {ConfigService} from "../../services/config.service";
import {DeduplicationService} from "../../services/deduplication.service";

@Component({
    selector: 'app-service-edit',
    templateUrl: './service-form.component.html',
    standalone: false
})
export class ServiceEditComponent extends ServiceFormComponent implements OnInit {

  private sub: Subscription;
  // private serviceID: string;

  constructor(public route: ActivatedRoute,
              public authenticationService: AuthenticationService,
              protected serviceProviderService: ServiceProviderService,
              protected catalogueService: CatalogueService,
              protected injector: Injector,
              public datePipe: DatePipe,
              public navigator: NavigationService,
              public pidHandler: pidHandler,
              public dynamicFormService: FormControlService,
              public router: Router,
              public config: ConfigService,
              public deduplicationService: DeduplicationService) {
    super(injector, authenticationService, serviceProviderService, catalogueService, route, pidHandler, dynamicFormService, router, config, deduplicationService);
    this.editMode = true;
  }

  ngOnInit() {
    const path = this.route.snapshot.routeConfig.path;
    if (path === ':providerId/resource/view/:resourceId') this.disable = true; // view-only mode
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
                this.payloadAnswer = {'answer': {service: service}};
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
        this.resourceService.getServiceBundleById(this.serviceId)
          .subscribe(serviceBundle => {
              this.service = serviceBundle.service;
              const parsedService = {
                ...this.service,
                horizontalService: typeof this.service.horizontalService === 'boolean' ? this.service.horizontalService.toString() : this.service.horizontalService
              };
              this.payloadAnswer = {'answer': {service: parsedService}};
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
