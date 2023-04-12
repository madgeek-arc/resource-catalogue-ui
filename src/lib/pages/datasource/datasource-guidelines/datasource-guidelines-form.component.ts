import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Component, Injector, OnInit} from '@angular/core';
import {AuthenticationService} from '../../../services/authentication.service';
import {NavigationService} from '../../../services/navigation.service';
import {
  ResourceInteroperabilityRecord,
  InteroperabilityRecord,
} from '../../../domain/eic-model';
import {environment} from '../../../../environments/environment';
import {ActivatedRoute} from '@angular/router';
import {ServiceProviderService} from '../../../services/service-provider.service';
import {GuidelinesService} from "../../../services/guidelines.service";

declare var UIkit: any;

@Component({
  selector: 'app-datasource-guidelines-form',
  templateUrl: './datasource-guidelines-form.component.html',
  styleUrls: ['../../provider/service-provider-form.component.css']
})
export class DatasourceGuidelinesFormComponent implements OnInit {

  projectName = environment.projectName;
  projectMail = environment.projectMail;
  showLoader = false;
  pendingDatasource = false; // revisit
  providerId: string;
  editMode = false;
  hasChanges = false;
  guidelinesForm: FormGroup;
  datasourceId: string = null;
  datasourceGuidelines: ResourceInteroperabilityRecord;
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
              protected guidelinesService: GuidelinesService,
              protected route: ActivatedRoute
  ) {
    this.fb = this.injector.get(FormBuilder);
    this.router = this.injector.get(NavigationService);
    this.guidelinesForm = this.fb.group(this.formGroupMeta);
  }

  ngOnInit() {
    this.datasourceId = this.route.snapshot.paramMap.get('datasourceId');
    this.guidelinesForm.get('resourceId').setValue(this.datasourceId);

    this.guidelinesService.getGuidelinesOfResource(this.datasourceId).subscribe(
      res => { if(res!=null) {
        this.datasourceGuidelines = res;
        this.editMode = true;
      }
      },
      err => {
        console.log(err);
      },
      () => {
        if (this.datasourceGuidelines) { //fill the form -->
          this.formPrepare(this.datasourceGuidelines);
          this.guidelinesForm.patchValue(this.datasourceGuidelines);
        }
        this.loadingMessage = 'Loading guidelines...';
        this.guidelinesService.getInteroperabilityRecords().subscribe( //get all
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
      sessionStorage.setItem('datasource', JSON.stringify(this.guidelinesForm.value));
      this.authenticationService.login();
    }

    this.errorMessage = '';
    this.showLoader = true;

    window.scrollTo(0, 0);
    this.guidelinesService.assignGuidelinesToResource('datasource', this.editMode, this.guidelinesForm.value).subscribe(
      _ir => {
        this.showLoader = false;
        return this.router.datasourceDashboard(this.providerId, this.datasourceId);  // redirect to datasource-dashboard
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

    this.guidelinesService.deleteGuidelinesOfResource(this.datasourceId, this.datasourceGuidelines.id).subscribe(
      _ir => {
        // return this.router.resourceDashboard(this.providerId, this.datasourceId);  // redirect to resource-dashboard TODO: revisit when datasource stats/history are ready
      },
      err => this.errorMessage = 'Something went bad, server responded: ' + JSON.stringify(err.error),
      () => {
        this.showLoader = false;
        location.reload();
      }
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
