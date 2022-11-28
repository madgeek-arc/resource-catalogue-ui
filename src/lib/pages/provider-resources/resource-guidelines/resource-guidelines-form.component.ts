import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Component, Injector, OnInit} from '@angular/core';
import {AuthenticationService} from '../../../services/authentication.service';
import {NavigationService} from '../../../services/navigation.service';
import {ResourceService} from '../../../services/resource.service';
import {Provider, Service, ResourceInteroperabilityRecord, InteroperabilityRecord} from '../../../domain/eic-model';
import {environment} from '../../../../environments/environment';
import {ActivatedRoute} from '@angular/router';
import {ServiceProviderService} from '../../../services/service-provider.service';
import {ResourceExtrasService} from "../../../services/resource-extras.service";

declare var UIkit: any;

@Component({
  selector: 'app-resource-guidelines-form',
  templateUrl: './resource-guidelines-form.component.html',
  styleUrls: ['../../provider/service-provider-form.component.css']
})
export class ResourceGuidelinesFormComponent implements OnInit {

  serviceORresource = environment.serviceORresource;
  projectName = environment.projectName;
  projectMail = environment.projectMail;
  showLoader = false;
  pendingService = false; // revisit
  providerId: string;
  editMode = false;
  hasChanges = false;
  guidelinesForm: FormGroup;
  service: Service;
  serviceId: string = null;
  resourceGuidelines: ResourceInteroperabilityRecord;
  guidelines: InteroperabilityRecord[] = [];
  errorMessage = '';
  loadingMessage = '';
  successMessage: string = null;
  fb: FormBuilder = this.injector.get(FormBuilder);
  disable = false;

  formGroupMeta = {
    id: [''],
    resourceId: [''],
    catalogueId: ['eosc'],
    interoperabilityRecordIds: this.fb.array([this.fb.control('')]),
  };

  router: NavigationService = this.injector.get(NavigationService);

  constructor(protected injector: Injector,
              protected authenticationService: AuthenticationService,
              protected serviceProviderService: ServiceProviderService,
              protected resourceExtrasService: ResourceExtrasService,
              protected route: ActivatedRoute
  ) {
    this.fb = this.injector.get(FormBuilder);
    this.router = this.injector.get(NavigationService);
    this.guidelinesForm = this.fb.group(this.formGroupMeta);
  }

  ngOnInit() {
    this.serviceId = this.route.snapshot.paramMap.get('resourceId');
    this.guidelinesForm.get('resourceId').setValue(this.serviceId);

    this.resourceExtrasService.getGuidelinesOfResource(this.serviceId).subscribe(
      res => { if(res!=null) {
        this.resourceGuidelines = res;
        this.editMode = true;
        }
      },
      err => {
        console.log(err);
      },
      () => {
        if (this.resourceGuidelines) { //fill the form -->
          this.formPrepare(this.resourceGuidelines);
          this.guidelinesForm.patchValue(this.resourceGuidelines);
        }
        this.loadingMessage = 'Loading guidelines...';
        this.resourceExtrasService.getInteroperabilityRecords().subscribe( //get all
          res => {
            if (res != null) {
              this.guidelines = res['results'];
            }
          },
          err => {
            console.log(err);
            this.errorMessage = 'The list could not be retrieved';
            this.loadingMessage = '';
          },
          () => {
            this.loadingMessage = '';
          }
        );
      }
    );

  }

  onSubmit() {
    if (!this.authenticationService.isLoggedIn()) {
      sessionStorage.setItem('service', JSON.stringify(this.guidelinesForm.value));
      this.authenticationService.login();
    }

    this.errorMessage = '';
    this.showLoader = true;

    window.scrollTo(0, 0);
    this.resourceExtrasService.assignGuidelinesToResource('service', this.editMode, this.guidelinesForm.value).subscribe(
      _ir => {
        this.showLoader = false;
        return this.router.resourceDashboard(this.providerId, this.serviceId);  // redirect to resource-dashboard
      },
      err => {
        this.showLoader = false;
        window.scrollTo(0, 0);
        this.errorMessage = 'Something went bad, server responded: ' + JSON.stringify(err.error);
      }
    );
  }

  removeAll() {
    this.errorMessage = '';
    this.showLoader = true;

    this.resourceExtrasService.deleteGuidelinesOfResource(this.serviceId, this.resourceGuidelines.id).subscribe(
      _ir => {
        return this.router.resourceDashboard(this.providerId, this.serviceId);  // redirect to resource-dashboard
      },
      err => this.errorMessage = 'Something went bad, server responded: ' + JSON.stringify(err.error)
    );
  }

  /** manage form arrays--> **/
  getFieldAsFormArray(field: string) {
    return this.guidelinesForm.get(field) as FormArray;
  }

  push(field: string) {
    this.getFieldAsFormArray(field).push(this.fb.control(''));
  }

  remove(field: string, i: number) {
    this.getFieldAsFormArray(field).removeAt(i);
  }

  /** <--manage form arrays **/

  formPrepare(assignedGuidelines: ResourceInteroperabilityRecord) {
    if (assignedGuidelines.interoperabilityRecordIds) {
      for (let i = 0; i < assignedGuidelines.interoperabilityRecordIds.length - 1; i++) {
        this.push('interoperabilityRecordIds');
      }
    }
  }

  checkForDuplicates(formControlName) {
    if (this.guidelinesForm.get(formControlName).value.length > 1) {
      for (let i = 0; i < this.guidelinesForm.get(formControlName).value.length; i++) {
        for (let j = 0; j < this.guidelinesForm.get(formControlName).value.length; j++) {
          if (i !== j && this.guidelinesForm.get(formControlName).value[i] === this.guidelinesForm.get(formControlName).value[j]) {
            this.showNotification();
            return;
          }
        }
      }
    }
  }

  unsavedChangesPrompt() {
    this.hasChanges = true;
  }

  showNotification() {
    UIkit.notification({
      message: 'Please remove duplicate entries.',
      status: 'danger',
      pos: 'top-center',
      timeout: 7000
    });
  }

}
