import {Component, Injector, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DatePipe} from '@angular/common';
import {ServiceFormComponent} from './service-form.component';
import {AuthenticationService} from '../../services/authentication.service';
import {Subscription} from 'rxjs';
import {Service} from '../../domain/eic-model';
import {ResourceService} from '../../services/resource.service';
import {ServiceProviderService} from '../../services/service-provider.service';
import {NavigationService} from "../../services/navigation.service";
import {RecommendationsService} from "../../services/recommendations.service";
import {CatalogueService} from "../../services/catalogue.service";

@Component({
  selector: 'app-service-edit',
  templateUrl: './service-form.component.html',
  styleUrls: ['../provider/service-provider-form.component.css']
})
export class ServiceEditComponent extends ServiceFormComponent implements OnInit {
  private sub: Subscription;

  // private serviceID: string;

  constructor(public route: ActivatedRoute,
              public authenticationService: AuthenticationService,
              protected serviceProviderService: ServiceProviderService,
              protected recommendationsService: RecommendationsService,
              protected catalogueService: CatalogueService,
              protected injector: Injector,
              public datePipe: DatePipe,
              public navigator: NavigationService) {
    super(injector, authenticationService, serviceProviderService, recommendationsService, catalogueService, route);
    this.editMode = true;
  }

  ngOnInit() {
    const path = this.route.snapshot.routeConfig.path;
    if (path.includes(':catalogueId')) { this.catalogueId = this.route.snapshot.paramMap.get('catalogueId') }
    else { this.catalogueId = 'eosc' }
    if (path === ':catalogueId/:provider_prefix/:provider_suffix/resource/view/:resource_prefix/:resource_suffix') this.disable = true; // view-only mode
    super.ngOnInit();
    if (sessionStorage.getItem('service')) {
      sessionStorage.removeItem('service');
    } else {
      this.sub = this.route.params.subscribe(params => {
        // this.serviceId = params['resourceId'];
        this.serviceId = this.navigator.createId(this.route, 'resource_prefix', 'resource_suffix');
        const pathName = window.location.pathname;
        if (pathName.includes('draft-resource/update')) this.pendingService = true;
        // this.resourceService.getService(this.serviceID).subscribe(service => {
        this.resourceService[this.pendingService ? 'getPendingService' : 'getServiceBundleById'](this.serviceId, this.catalogueId)
          .subscribe(serviceBundle => {
              if (serviceBundle.service.mainContact === null) //in case of unauthorized access backend will not show sensitive info
                this.navigator.go('/forbidden')
              ResourceService.removeNulls(serviceBundle.service);
              //remove catalogueId. prefix for same catalogue entries
              if (serviceBundle.service.requiredResources) {
                serviceBundle.service.requiredResources = serviceBundle.service.requiredResources.map(value => value.startsWith(this.catalogueId) ? value.substring(this.catalogueId.length+1) : value);
              }
              if (serviceBundle.service.relatedResources) {
                serviceBundle.service.relatedResources = serviceBundle.service.relatedResources.map(value => value.startsWith(this.catalogueId) ? value.substring(this.catalogueId.length+1) : value);
              }
              this.formPrepare(serviceBundle.service);
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
                this.initServiceBitSets();
              }
            }
          );
      });
    }
  }

  onSubmit(service: Service, tempSave: boolean) {
    super.onSubmit(service, tempSave, this.pendingService);
  }

  initServiceBitSets() {
    this.handleBitSets(0, 0, 'name');
    this.handleBitSets(0, 21, 'abbreviation');
    this.handleBitSets(0, 1, 'resourceOrganisation');
    this.handleBitSets(0, 2, 'webpage');
    this.handleBitSets(1, 3, 'description');
    this.handleBitSets(1, 4, 'tagline');
    this.handleBitSets(1, 5, 'logo');
    this.handleBitSetsOfGroups(2, 7, 'scientificSubdomain', 'scientificDomains');
    this.handleBitSetsOfGroups(2, 9, 'subcategory', 'categories');
    this.handleBitSets(2, 10, 'targetUsers');
    this.handleBitSets(3, 11, 'geographicalAvailabilities');
    this.handleBitSets(3, 12, 'languageAvailabilities');
    this.handleBitSetsOfGroups(5, 13, 'firstName', 'mainContact');
    this.handleBitSetsOfGroups(5, 14, 'lastName', 'mainContact');
    this.handleBitSetsOfGroups(5, 15, 'email', 'mainContact');
    this.handleBitSetsOfPublicContact(5, 20, 'email', 'publicContacts');
    this.handleBitSets(5, 16, 'helpdeskEmail');
    this.handleBitSets(5, 17, 'securityContactEmail');
    this.handleBitSets(6, 18, 'trl');
    this.handleBitSets(9, 22, 'termsOfUse');
    this.handleBitSets(9, 23, 'privacyPolicy');
    this.handleBitSets(10, 19, 'orderType');
  }

}
