import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Component, Injector, OnInit} from '@angular/core';
import {AuthenticationService} from '../../../services/authentication.service';
import {NavigationService} from '../../../services/navigation.service';
import {ResourceService} from '../../../services/resource.service';
import {ServiceExtensionsService} from '../../../services/service-extensions.service';
import * as sd from '../../provider-resources/services.description';
import {Provider, Service, Helpdesk} from '../../../domain/eic-model';
import {Paging} from '../../../domain/paging';
import {URLValidator} from '../../../shared/validators/generic.validator';
import {environment} from '../../../../environments/environment';
import {ActivatedRoute} from '@angular/router';
import {ServiceProviderService} from '../../../services/service-provider.service';

@Component({
  selector: 'app-datasource-helpdesk-extension-form',
  templateUrl: './datasource-helpdesk-extension-form.component.html',
  styleUrls: ['../../provider/service-provider-form.component.css']
})
export class DatasourceHelpdeskExtensionFormComponent implements OnInit {

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
  datasourceId: string = null;
  helpdesk: Helpdesk;
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
    helpdeskType: ['', Validators.required],
    services: this.fb.array([this.fb.control('')]),
    supportGroups: this.fb.array([this.fb.control('')]), //Validators.required,
    organisation: [''],
    emails: this.fb.array([this.fb.control('')]),
    // emailForTicket: this.fb.array([this.fb.control('')]), //Validators.required,
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

  constructor(protected injector: Injector,
              protected authenticationService: AuthenticationService,
              protected serviceProviderService: ServiceProviderService,
              protected route: ActivatedRoute
  ) {
    this.resourceService = this.injector.get(ResourceService);
    this.fb = this.injector.get(FormBuilder);
    this.router = this.injector.get(NavigationService);
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
    // for (let i = 0; i < this.monitoringGroupsArray.length; i++) {
    //   if (this.monitoringGroupsArray.controls[i].get('serviceType').value === ''
    //     || this.monitoringGroupsArray.controls[i].get('endpoint').value === null) {
    //     this.removeMonitoringGroup(i);
    //   }
    // }

    // console.log('this.serviceForm.valid ', this.serviceForm.valid);
    // console.log('Submitted service value--> ', this.serviceForm.value);
    if (this.serviceForm.valid) {
      window.scrollTo(0, 0);
      if(this.serviceForm.get('helpdeskType').value==='direct usage'){
        this.serviceForm.get('ticketPreservation').setValue('');
      }
      else if(this.serviceForm.get('helpdeskType').value==='ticket redirection'){
        while (this.getFieldAsFormArray('supportGroups').length !== 0) {
          this.getFieldAsFormArray('supportGroups').removeAt(0);
        }
        while (this.getFieldAsFormArray('agents').length !== 0) {
          this.getFieldAsFormArray('agents').removeAt(0);
        }
        while (this.getFieldAsFormArray('signatures').length !== 0) {
          this.getFieldAsFormArray('signatures').removeAt(0);
          // (this.serviceForm.controls['signatures'] as FormArray).clear(); //alt
        }
      } else if(this.serviceForm.get('helpdeskType').value==='full integration') {
        this.serviceForm.get('ticketPreservation').setValue('');
        while (this.getFieldAsFormArray('signatures').length !== 0) {
          this.getFieldAsFormArray('signatures').removeAt(0);
        }
      }
      this.serviceExtensionsService.uploadHelpdeskService(this.serviceForm.value, this.editMode, 'eosc', 'datasource').subscribe(
        _service => {
          this.showLoader = false;
          return this.router.datasourceDashboard(this.providerId, this.datasourceId);  // redirect to datasource-dashboard
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
    this.datasourceId = this.route.snapshot.paramMap.get('datasourceId');
    this.serviceForm.get('serviceId').setValue(this.datasourceId);

    this.serviceExtensionsService.getHelpdeskByServiceId(this.datasourceId).subscribe(
      res => { if(res!=null) {
        this.helpdesk = res;
        this.editMode = true;
      }
      },
      err => { console.log(err); },
      () => {
        if (this.helpdesk) { //fill the form -->
          this.formPrepare(this.helpdesk);
          this.serviceForm.patchValue(this.helpdesk);
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
        this.getFieldAsFormArray(field).push(this.fb.control('', Validators.compose([Validators.required, URLValidator])));
      } else {
        this.getFieldAsFormArray(field).push(this.fb.control('', Validators.required));
      }
    } else if (url) {
      // console.log('added non mandatory url field');
      this.getFieldAsFormArray(field).push(this.fb.control('', URLValidator));
    } else {
      this.getFieldAsFormArray(field).push(this.fb.control(''));
    }
  }

  remove(field: string, i: number) {
    this.getFieldAsFormArray(field).removeAt(i);
  }

  /** <--manage form arrays **/

  formPrepare(helpdesk: Helpdesk) {
    if (helpdesk.services) {
      for (let i = 0; i < helpdesk.services.length - 1; i++) {
        this.push('services', false);
      }
    }
    if (helpdesk.supportGroups) {
      for (let i = 0; i < helpdesk.supportGroups.length - 1; i++) {
        this.push('supportGroups', true);
      }
    }
    if (helpdesk.emails) {
      for (let i = 0; i < helpdesk.emails.length - 1; i++) {
        this.push('emails', false);
      }
    }
    if (helpdesk.agents) {
      for (let i = 0; i < helpdesk.agents.length - 1; i++) {
        this.push('agents', true);
      }
    }
    if (helpdesk.signatures) {
      for (let i = 0; i < helpdesk.signatures.length - 1; i++) {
        this.push('signatures', false);
      }
    }
  }

  unsavedChangesPrompt() {
    this.hasChanges = true;
  }

  selectChangeHandler (event: any) {
    this.serviceForm.get('helpdeskType').setValue(event.target.value);
  }

}
