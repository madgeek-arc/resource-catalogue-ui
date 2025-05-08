import {UntypedFormArray, UntypedFormBuilder, FormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {Component, Injector, isDevMode, OnInit, ViewChild} from '@angular/core';
import {AuthenticationService} from '../../../services/authentication.service';
import {NavigationService} from '../../../services/navigation.service';
import {ResourceService} from '../../../services/resource.service';
import {ServiceExtensionsService} from '../../../services/service-extensions.service';
import * as dm from '../../../shared/description.map';
import {Provider, Service, Helpdesk} from '../../../domain/eic-model';
import {Paging} from '../../../domain/paging';
import {URLValidator} from '../../../shared/validators/generic.validator';
import {environment} from '../../../../environments/environment';
import {ActivatedRoute} from '@angular/router';
import {ServiceProviderService} from '../../../services/service-provider.service';
import {SurveyComponent} from "../../../../dynamic-catalogue/pages/dynamic-form/survey.component";
import {Model} from "../../../../dynamic-catalogue/domain/dynamic-form-model";

@Component({
  selector: 'app-helpdesk-extension-form',
  templateUrl: './helpdesk-extension-form.component.html',
  styleUrls: ['../../provider/service-provider-form.component.css']
})
export class HelpdeskExtensionFormComponent implements OnInit {
  @ViewChild(SurveyComponent) child: SurveyComponent
  model: Model = null;
  vocabulariesMap: Map<string, object[]> = null;
  // vocabulariesMap: { [name: string]: { id: string, name: string }[]; } = {}
  payloadAnswer: object = null;

  serviceORresource = environment.serviceORresource;
  projectName = environment.projectName;
  projectMail = environment.projectMail;
  serviceName = '';
  firstServiceForm = false;
  showLoader = false;
  pendingService = false;
  editMode = false;
  hasChanges = false;
  serviceForm: UntypedFormGroup;
  provider: Provider;
  service: Service;
  helpdesk: Helpdesk;
  errorMessage = '';
  successMessage: string = null;
  weights: string[] = [];
  tabs: boolean[] = [false];
  fb: UntypedFormBuilder = this.injector.get(UntypedFormBuilder);
  disable = false;
  isPortalAdmin = false;

  serviceId: string = null; //filled for all types (service, training)
  resourceType = '';
  //only one of these 2 ids will be filled from URL
  resourceId: string = null;
  trainingResourceId: string = null;

  readonly servicesDesc: dm.Description = dm.helpdeskDescMap.get('servicesDesc');
  readonly supportGroupsDesc: dm.Description = dm.helpdeskDescMap.get('supportGroupsDesc');
  readonly organisationDesc: dm.Description = dm.helpdeskDescMap.get('organisationDesc');
  readonly emailsDesc: dm.Description = dm.helpdeskDescMap.get('emailsDesc');
  readonly emailForTicketDesc: dm.Description = dm.helpdeskDescMap.get('emailForTicketDesc');
  readonly agentsDesc: dm.Description = dm.helpdeskDescMap.get('agentsDesc');
  readonly signaturesDesc: dm.Description = dm.helpdeskDescMap.get('signaturesDesc');
  readonly webformDesc: dm.Description = dm.helpdeskDescMap.get('webformDesc');
  readonly ticketPreservationDesc: dm.Description = dm.helpdeskDescMap.get('ticketPreservationDesc');


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

  navigator: NavigationService = this.injector.get(NavigationService);

  constructor(protected injector: Injector,
              protected authenticationService: AuthenticationService,
              protected serviceProviderService: ServiceProviderService,
              protected route: ActivatedRoute
  ) {
    this.resourceService = this.injector.get(ResourceService);
    this.fb = this.injector.get(UntypedFormBuilder);
    this.navigator = this.injector.get(NavigationService);
    this.serviceForm = this.fb.group(this.formGroupMeta);
    this.weights[0] = this.authenticationService.user.email.split('@')[0];
  }

  submitForm(value) {//todo
    window.scrollTo(0, 0);

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
      this.serviceExtensionsService.uploadHelpdeskService(this.serviceForm.value, this.editMode, 'eosc', this.resourceType).subscribe(
        _service => {
          this.showLoader = false;
          if (this.resourceType==='service') return this.navigator.resourceDashboard(this.serviceForm.value.resourceOrganisation, this.serviceId); // navigate to resource-dashboard
          if (this.resourceType==='training_resource') return this.navigator.trainingResourceDashboard(this.serviceForm.value.resourceOrganisation, this.serviceId); // navigate to training-resource-dashboard
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
    this.serviceProviderService.getFormModelById('m-b-helpdesk').subscribe(
      res => this.model = res,
      err => console.log(err)
    )

    if (this.route.snapshot.paramMap.get('resourceId')) {
      this.serviceId = this.route.snapshot.paramMap.get('resourceId');
      this.resourceType = 'service';
    }
    if (this.route.snapshot.paramMap.get('trainingResourceId')) {
      this.serviceId = this.route.snapshot.paramMap.get('trainingResourceId');
      this.resourceType = 'training_resource';
    }
    this.serviceForm.get('serviceId').setValue(decodeURIComponent(this.serviceId));

    this.serviceExtensionsService.getHelpdeskByServiceId(this.serviceId).subscribe(
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
    return this.serviceForm.get(field) as UntypedFormArray;
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

  protected readonly environment = environment;
  protected readonly isDevMode = isDevMode;
}
