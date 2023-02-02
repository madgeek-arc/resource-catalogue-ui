import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Component, Injector, OnInit} from '@angular/core';
import {AuthenticationService} from '../../../services/authentication.service';
import {NavigationService} from '../../../services/navigation.service';
import {ResourceService} from '../../../services/resource.service';
import {ServiceExtensionsService} from '../../../services/service-extensions.service';
import {UserService} from '../../../services/user.service';
import * as sd from '../services.description';
import {Monitoring, Provider, Service} from '../../../domain/eic-model';
import {Paging} from '../../../domain/paging';
import {urlAsyncValidator, URLValidator} from '../../../shared/validators/generic.validator';
import {environment} from '../../../../environments/environment';
import {ActivatedRoute} from '@angular/router';
import {ServiceProviderService} from '../../../services/service-provider.service';

@Component({
  selector: 'app-monitoring-extension-form',
  templateUrl: './monitoring-extension-form.component.html',
  styleUrls: ['../../provider/service-provider-form.component.css']
})
export class MonitoringExtensionFormComponent implements OnInit {

  serviceORresource = environment.serviceORresource;
  projectName = environment.projectName;
  projectMail = environment.projectMail;
  serviceName = '';
  firstServiceForm = false;
  showLoader = false;
  pendingService = false;
  providerId: string;
  editMode = false;
  hasChanges = false;
  serviceForm: FormGroup;
  provider: Provider;
  service: Service;
  serviceId: string = null;
  monitoring: Monitoring;
  typeDescriptions = [];
  errorMessage = '';
  successMessage: string = null;
  weights: string[] = [];
  tabs: boolean[] = [false];
  fb: FormBuilder = this.injector.get(FormBuilder);
  disable = false;
  isPortalAdmin = false;

  commentControl = new FormControl();

  readonly serviceTypeDesc: sd.Description = sd.monitoringDescMap.get('serviceTypeDesc');
  readonly endpointDesc: sd.Description = sd.monitoringDescMap.get('endpointDesc');
  readonly probeDesc: sd.Description = sd.monitoringDescMap.get('probeDesc');
  readonly metricDesc: sd.Description = sd.monitoringDescMap.get('metricDesc');


  formGroupMeta = {
    id: [''],
    serviceId: [''],
    monitoringGroups: this.fb.array([
      this.fb.group({
        serviceType: ['', Validators.required],
        endpoint: ['', Validators.required]
      })
    ]),
    // metrics: this.fb.array([
    //   this.fb.group({
    //     probe: ['', URLValidator, urlAsyncValidator(this.serviceProviderService)],
    //     metric: ['', URLValidator, urlAsyncValidator(this.serviceProviderService)],
    //   })
    // ])
  };

  providersPage: Paging<Provider>;
  requiredResources: any;
  relatedResources: any;
  serviceTypesVoc: any;
  resourceService: ResourceService = this.injector.get(ResourceService);
  serviceExtensionsService: ServiceExtensionsService = this.injector.get(ServiceExtensionsService);

  router: NavigationService = this.injector.get(NavigationService);
  userService: UserService = this.injector.get(UserService);

  constructor(protected injector: Injector,
              protected authenticationService: AuthenticationService,
              protected serviceProviderService: ServiceProviderService,
              protected route: ActivatedRoute
  ) {
    this.resourceService = this.injector.get(ResourceService);
    this.fb = this.injector.get(FormBuilder);
    this.router = this.injector.get(NavigationService);
    this.userService = this.injector.get(UserService);
    this.serviceForm = this.fb.group(this.formGroupMeta);
    this.weights[0] = this.authenticationService.user.email.split('@')[0];
  }

  onSubmit() {
    if (!this.authenticationService.isLoggedIn()) {
      sessionStorage.setItem('service', JSON.stringify(this.serviceForm.value));
      this.authenticationService.login();
    }

    this.errorMessage = '';
    this.showLoader = true;
    for (let i = 0; i < this.monitoringGroupsArray.length; i++) {
      if (this.monitoringGroupsArray.controls[i].get('serviceType').value === ''
        || this.monitoringGroupsArray.controls[i].get('endpoint').value === null) {
        this.removeMonitoringGroup(i);
      }
    }

    // console.log('this.serviceForm.valid ', this.serviceForm.valid);
    // console.log('Submitted service --> ', service);
    // console.log('Submitted service value--> ', this.serviceForm.value);
    if (this.serviceForm.valid) {
      window.scrollTo(0, 0);
      this.serviceExtensionsService.uploadMonitoringService(this.serviceForm.value, this.editMode, 'eosc','service').subscribe(
        _service => {
          this.showLoader = false;
          return this.router.resourceDashboard(this.providerId, this.serviceId);  // redirect to resource-dashboard
        },
        err => {
          this.showLoader = false;
          window.scrollTo(0, 0);
          this.monitoringGroupsArray.enable();
          this.errorMessage = 'Something went bad, server responded: ' + JSON.stringify(err.error);
        }
      );
    } else {
      window.scrollTo(0, 0);
      this.showLoader = false;

      this.serviceForm.markAsDirty();
      this.serviceForm.updateValueAndValidity();
      if (!this.serviceForm.valid) {
        this.errorMessage = 'Please fill in all required fields (marked with an asterisk), ' +
          'and fix the data format in fields underlined with a red colour.';
      }
    }
  }

  ngOnInit() {
    this.serviceId = this.route.snapshot.paramMap.get('resourceId');
    this.serviceForm.get('serviceId').setValue(this.serviceId);

    this.setServiceTypes();

    this.serviceExtensionsService.getMonitoringByServiceId(this.serviceId).subscribe(
      res => { if(res!=null) {
        this.monitoring = res;
        this.editMode = true;
        // console.log(this.monitoring);
      }
      },
      err => { console.log(err); },
      () => {
        if (this.monitoring) { //fill the form -->
          this.formPrepare(this.monitoring);
          this.serviceForm.patchValue(this.monitoring);
        }
      }
    );
  }

  checkFormValidity(name: string, edit: boolean): boolean {
    return (this.serviceForm.get(name).invalid && (edit || this.serviceForm.get(name).dirty));
  }

  checkFormArrayValidity(name: string, position: number, edit: boolean, groupName?: string): boolean {
    if (groupName) {
      return this.getFieldAsFormArray(name).get([position]).get(groupName).invalid
        && (edit || this.getFieldAsFormArray(name).get([position]).get(groupName).dirty);
    }
    return (this.getFieldAsFormArray(name).get([position]).invalid && (edit || this.getFieldAsFormArray(name).get([position]).dirty));
  }

  /** manage form arrays--> **/
  getFieldAsFormArray(field: string) {
    return this.serviceForm.get(field) as FormArray;
  }

  push(field: string, required: boolean, url?: boolean) {
    if (required) {
      if (url) {
        this.getFieldAsFormArray(field).push(this.fb.control('', Validators.compose([Validators.required, URLValidator]), urlAsyncValidator(this.serviceProviderService)));
      } else {
        this.getFieldAsFormArray(field).push(this.fb.control('', Validators.required));
      }
    } else if (url) {
      // console.log('added non mandatory url field');
      this.getFieldAsFormArray(field).push(this.fb.control('', URLValidator, urlAsyncValidator(this.serviceProviderService)));
    } else {
      this.getFieldAsFormArray(field).push(this.fb.control(''));
    }
  }

  remove(field: string, i: number) {
    this.getFieldAsFormArray(field).removeAt(i);
  }

  /** <--manage form arrays **/

  /** MonitoringGroups -->**/
  newMonitoringGroup(): FormGroup {
    return this.fb.group({
      serviceType: ['', Validators.required],
      endpoint: ['', Validators.required]
    });
  }

  get monitoringGroupsArray() {
    return this.serviceForm.get('monitoringGroups') as FormArray;
  }

  pushMonitoringGroup() {
    this.monitoringGroupsArray.push(this.newMonitoringGroup());
  }

  removeMonitoringGroup(index: number) {
    this.monitoringGroupsArray.removeAt(index);
    this.initTypeDescriptions();
  }
  /** <--MonitoringGroups**/

  /** MetricsGroups -->**/
  newMetricsGroup(): FormGroup {
    return this.fb.group({
      probe: ['', URLValidator, urlAsyncValidator(this.serviceProviderService)],
      metric: ['', URLValidator, urlAsyncValidator(this.serviceProviderService)],
    });
  }

  get metricsGroupsArray() {
    return this.serviceForm.get('metrics') as FormArray;
  }

  pushMetricsGroup() {
    this.metricsGroupsArray.push(this.newMetricsGroup());
  }

  removeMetricsGroup(index: number) {
    this.metricsGroupsArray.removeAt(index);
  }
  /** <--MetricsGroups**/

  formPrepare(monitoring: Monitoring) {

    this.monitoringGroupsArray.removeAt(0); //this.removeMonitoringGroup(0); would also trigger the this.initTypeDescriptions();
    if (monitoring.monitoringGroups) {
      for (let i = 0; i < monitoring.monitoringGroups.length; i++) {
        this.monitoringGroupsArray.push(this.newMonitoringGroup());
        this.monitoringGroupsArray.controls[this.monitoringGroupsArray.length - 1].get('serviceType').setValue(monitoring.monitoringGroups[i].serviceType);
        this.monitoringGroupsArray.controls[this.monitoringGroupsArray.length - 1].get('endpoint').setValue(monitoring.monitoringGroups[i].endpoint);
      }
    } else {
      this.monitoringGroupsArray.push(this.newMonitoringGroup());
    }
    //
    // this.removeScientificDomain(0);
    // if (helpdesk.scientificDomains) {
    //   for (let i = 0; i < helpdesk.scientificDomains.length; i++) {
    //     this.scientificDomainArray.push(this.newScientificDomain());
    //     this.scientificDomainArray.controls[this.scientificDomainArray.length - 1]
    //       .get('scientificDomain').setValue(helpdesk.scientificDomains[i].scientificDomain);
    //     this.scientificDomainArray.controls[this.scientificDomainArray.length - 1]
    //       .get('scientificSubdomain').setValue(helpdesk.scientificDomains[i].scientificSubdomain);
    //   }
    // } else {
    //   this.scientificDomainArray.push(this.newScientificDomain());
    // }

  }

  unsavedChangesPrompt() {
    this.hasChanges = true;
  }

  initTypeDescriptions(){
    this.typeDescriptions = [];
    if(this.monitoring && this.serviceTypesVoc){
      for(let i=0; i<this.monitoring.monitoringGroups.length; i++) {
        this.findTypeDescription(i);
      }
    }
  }

  findTypeDescription(i){
    for(let j=0; j<this.serviceTypesVoc.length; j++) {
      if(this.serviceTypesVoc[j].name === this.monitoringGroupsArray.controls[i].get('serviceType').value){
        this.typeDescriptions[i] = this.serviceTypesVoc[j].description;
        break;
      }
    }
  }

  setServiceTypes() {
    this.serviceExtensionsService.getServiceTypes().subscribe(
      res => {
        this.serviceTypesVoc = res;
      },
      error => console.log(JSON.stringify(error.error)),
      () => {this.initTypeDescriptions()}
    );
  }

}
