import {UntypedFormArray, UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {Component, Injector, OnInit} from '@angular/core';
import {AuthenticationService} from '../../../services/authentication.service';
import {NavigationService} from '../../../services/navigation.service';
import {Service, ResourceInteroperabilityRecord, InteroperabilityRecord} from '../../../domain/eic-model';
import {environment} from '../../../../environments/environment';
import {ActivatedRoute} from '@angular/router';
import {ServiceProviderService} from '../../../services/service-provider.service';
import {GuidelinesService} from "../../../services/guidelines.service";

declare var UIkit: any;

@Component({
  selector: 'app-resource-guidelines-form',
  templateUrl: './resource-guidelines-form.component.html',
  styleUrls: ['../../provider/service-provider-form.component.css']
})
export class ResourceGuidelinesFormComponent implements OnInit {

  serviceORresource = environment.serviceORresource;
  projectMail = environment.projectMail;
  showLoader = false;
  pendingService = false; // revisit
  providerId: string;
  editMode = false;
  hasChanges = false;
  guidelinesForm: UntypedFormGroup;
  service: Service;
  serviceId: string = null;
  resourceGuidelines: ResourceInteroperabilityRecord;
  guidelines: InteroperabilityRecord[] = [];
  errorMessage = '';
  loadingMessage = '';
  successMessage: string = null;
  fb: UntypedFormBuilder = this.injector.get(UntypedFormBuilder);
  disable = false;

  formGroupMeta = {
    id: [''],
    resourceId: [''],
    catalogueId: ['eosc'],
    interoperabilityRecordIds: this.fb.array([this.fb.control('')]),
  };

  navigator: NavigationService = this.injector.get(NavigationService);

  constructor(protected injector: Injector,
              protected authenticationService: AuthenticationService,
              protected serviceProviderService: ServiceProviderService,
              protected guidelinesService: GuidelinesService,
              protected route: ActivatedRoute
  ) {
    this.fb = this.injector.get(UntypedFormBuilder);
    this.navigator = this.injector.get(NavigationService);
    this.guidelinesForm = this.fb.group(this.formGroupMeta);
  }

  ngOnInit() {
    this.serviceId = this.route.parent.snapshot.paramMap.get('resourceId');
    this.guidelinesForm.get('resourceId').setValue(decodeURIComponent(this.serviceId));

    this.guidelinesService.getGuidelinesOfResource(this.serviceId).subscribe(
      res => { if(res!=null) {
        this.resourceGuidelines = res;
        console.log(this.resourceGuidelines.interoperabilityRecordIds.length)
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
        this.guidelinesService.getInteroperabilityRecords('0', '9999').subscribe( //get all
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

  submitGuidelines() {
    if (!this.authenticationService.isLoggedIn()) {
      sessionStorage.setItem('service', JSON.stringify(this.guidelinesForm.value));
      this.authenticationService.login();
    }

    this.errorMessage = '';
    this.showLoader = true;

    window.scrollTo(0, 0);
    this.guidelinesService.assignGuidelinesToResource('service', this.editMode, this.guidelinesForm.value).subscribe(
      _ir => {
        this.showLoader = false;
      },
      err => {
        this.showLoader = false;
        window.scrollTo(0, 0);
        this.errorMessage = 'Something went bad, server responded: ' + JSON.stringify(err.error);
      },
      () => {
        console.log('reload page');
        window.location.reload();
      }
    );
  }

  removeAll() {
    this.errorMessage = '';
    this.showLoader = true;

    this.guidelinesService.deleteGuidelinesOfResource(this.serviceId, this.resourceGuidelines.id).subscribe(
      _ir => {
        window.location.reload();
      },
      err => {
        this.showLoader = false;
        this.errorMessage = 'Something went bad, server responded: ' + JSON.stringify(err.error);
      }
    );
  }

  /** manage form arrays--> **/
  getFieldAsFormArray(field: string) {
    return this.guidelinesForm.get(field) as UntypedFormArray;
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

  showDeletionModal() {
    UIkit.modal('#deletionModal').show();
  }

  onSubmit(){
    if(this.resourceGuidelines?.interoperabilityRecordIds?.length>0) {
      UIkit.modal('#submissionModal').show();
    } else {
      this.submitGuidelines();
    }
  }

}
