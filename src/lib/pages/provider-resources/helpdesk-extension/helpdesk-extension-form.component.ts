import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Component, Injector, OnInit} from '@angular/core';
import {AuthenticationService} from '../../../services/authentication.service';
import {NavigationService} from '../../../services/navigation.service';
import {ResourceService} from '../../../services/resource.service';
import {ServiceExtensionsService} from '../../../services/service-extensions.service';
import {UserService} from '../../../services/user.service';
import * as sd from '../services.description';
import {Provider, RichService, Service, Type, Vocabulary} from '../../../domain/eic-model';
import {Paging} from '../../../domain/paging';
import {urlAsyncValidator, URLValidator} from '../../../shared/validators/generic.validator';
import {zip} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {ActivatedRoute} from '@angular/router';
import {ServiceProviderService} from '../../../services/service-provider.service';
import {helpdeskDescMap} from "../services.description";

declare var UIkit: any;

@Component({
  selector: 'app-helpdesk-extension-form',
  templateUrl: './helpdesk-extension-form.component.html',
  styleUrls: ['../../provider/service-provider-form.component.css']
})
export class HelpdeskExtensionFormComponent implements OnInit {

  protected _marketplaceBaseURL = environment.marketplaceBaseURL;
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
  errorMessage = '';
  successMessage: string = null;
  weights: string[] = [];
  tabs: boolean[] = [false];
  fb: FormBuilder = this.injector.get(FormBuilder);
  disable = false;
  isPortalAdmin = false;

  commentControl = new FormControl();

  readonly servicesDesc: sd.Description = sd.helpdeskDescMap.get('servicesDesc');
  readonly supportGroupsDesc: sd.Description = sd.helpdeskDescMap.get('supportGroupsDesc');
  readonly organisationDesc: sd.Description = sd.helpdeskDescMap.get('organisationDesc');
  readonly emailsDesc: sd.Description = sd.helpdeskDescMap.get('emailsDesc');
  readonly emailForTicketDesc: sd.Description = sd.helpdeskDescMap.get('emailForTicketDesc');
  readonly agentsDesc: sd.Description = sd.helpdeskDescMap.get('agentsDesc');
  readonly signaturesDesc: sd.Description = sd.helpdeskDescMap.get('signaturesDesc');
  readonly webformDesc: sd.Description = sd.helpdeskDescMap.get('webformDesc');
  readonly ticketPreservationDesc: sd.Description = sd.helpdeskDescMap.get('ticketPreservationDesc');


  formGroupMeta = {
    id: [''],
    serviceId: [''],
    helpdeskType: [''],
    services: this.fb.array([this.fb.control('')]),
    supportGroups: this.fb.array([this.fb.control('')]), //Validators.required,
    organisation: [''],
    emails: this.fb.array([this.fb.control('')]),
    emailForTicket: this.fb.array([this.fb.control('')]), //Validators.required,
    agents: this.fb.array([this.fb.control('')]), //Validators.required,
    signatures: this.fb.array([this.fb.control('')]),
    webform: [''],
    ticketPreservation: ['']
  };

  providersPage: Paging<Provider>;
  requiredResources: any;
  relatedResources: any;
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

  onSubmit(edit: boolean) {
    console.log('Submit');
    if (!this.authenticationService.isLoggedIn()) {
      sessionStorage.setItem('service', JSON.stringify(this.serviceForm.value));
      this.authenticationService.login();
    }

    this.errorMessage = '';
    this.showLoader = true;
    // for (let i = 0; i < this.monitoringGroupsArray.length; i++) {
    //   if (this.monitoringGroupsArray.controls[i].get('serviceType').value === ''
    //     || this.monitoringGroupsArray.controls[i].get('endpoint').value === null) {
    //     this.removeMonitoringGroup(i);
    //   }
    // }

    // console.log('this.serviceForm.valid ', this.serviceForm.valid);
    // console.log('Submitted service --> ', service);
    // console.log('Submitted service value--> ', this.serviceForm.value);
    if (this.serviceForm.valid) {
      window.scrollTo(0, 0);
      this.serviceExtensionsService.uploadHelpdeskService(this.serviceForm.value, this.editMode).subscribe(
        _service => {
          console.log(_service);
          this.showLoader = false;
          return this.router.resourceDashboard(this.providerId, this.serviceId);  // redirect to resource-dashboard
        },
        err => {
          this.showLoader = false;
          window.scrollTo(0, 0);
          // this.monitoringGroupsArray.enable();
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
  }

  checkFormValidity(name: string, edit: boolean): boolean {
    return (!this.serviceForm.get(name).valid && (edit || this.serviceForm.get(name).dirty));
  }

  checkFormArrayValidity(name: string, position: number, edit: boolean, groupName?: string): boolean {
    if (groupName) {
      return !this.getFieldAsFormArray(name).get([position]).get(groupName).valid
        && (edit || this.getFieldAsFormArray(name).get([position]).get(groupName).dirty);
    }
    return (!this.getFieldAsFormArray(name).get([position]).valid && (edit || this.getFieldAsFormArray(name).get([position]).dirty));
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

  unsavedChangesPrompt() {
    this.hasChanges = true;
  }

  selectChangeHandler (event: any) {
    this.serviceForm.get('helpdeskType').setValue(event.target.value);
  }

}
