import {Component, isDevMode, OnInit, ViewChild} from '@angular/core';
import {UntypedFormArray, UntypedFormBuilder, FormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {AuthenticationService} from '../../services/authentication.service';
import {ServiceProviderService} from '../../services/service-provider.service';
import {ResourceService} from '../../services/resource.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Vocabulary, Type, Provider, InteroperabilityRecord} from '../../domain/eic-model';
import {ConfigService} from "../../services/config.service";
import {environment} from '../../../environments/environment';
import {GuidelinesService} from "../../services/guidelines.service";
import {pidHandler} from "../../shared/pid-handler/pid-handler.service";
import {SurveyComponent} from "../../../dynamic-catalogue/pages/dynamic-form/survey.component";
import {Model} from "../../../dynamic-catalogue/domain/dynamic-form-model";
import {FormControlService} from "../../../dynamic-catalogue/services/form-control.service";
import {DeduplicationService, SimilarResource} from '../../services/deduplication.service';

declare let UIkit: any;

@Component({
    selector: 'app-guidelines-form',
    templateUrl: './guidelines-form.component.html',
    standalone: false
})
export class GuidelinesFormComponent implements OnInit {
  @ViewChild(SurveyComponent) child: SurveyComponent
  model: Model = null;
  payloadAnswer: object = null;

  providerId: string;
  guideline: InteroperabilityRecord;
  guidelineId: string = null;
  errorMessage = '';
  guidelinesForm: UntypedFormGroup;
  editMode = false;
  similarResources: SimilarResource[] = [];
  formDataToSubmit: any = null;
  hasChanges = false;
  disable = false;
  showLoader = false;
  tabs: boolean[] = [false, false, false, false, false];
  isPortalAdmin = false;

  constructor(public fb: UntypedFormBuilder,
              public authService: AuthenticationService,
              public serviceProviderService: ServiceProviderService,
              public guidelinesService: GuidelinesService,
              public resourceService: ResourceService,
              public router: Router,
              public route: ActivatedRoute,
              public pidHandler: pidHandler,
              public config: ConfigService,
              public deduplicationService: DeduplicationService) {
  }

  ngOnInit() {
    this.showLoader = true;
    this.providerId = this.route.snapshot.paramMap.get('providerId');
    this.serviceProviderService.getFormModelById('m-b-guidelines').subscribe(
      res => this.model = res,
      err => console.log(err),
      ()=>{
        if (!this.editMode) { //prefill field(s)
          this.payloadAnswer = {
            'answer': {
              interoperabilityRecord:
                {
                  'resourceOwner': decodeURIComponent(this.providerId),
                  'type': "InteroperabilityGuidelines",
                  'catalogueId': null,
                  'nodePID': (this.config.getProperty('nodePidFixed')) ? this.config.getProperty('nodePid') : null
                }
            }
          };
        }
        this.showLoader = false;
      }
    )

    this.isPortalAdmin = this.authService.isAdmin();

  }

  submitForm(formData: any) {
    let guidelinesValue = formData.value.interoperabilityRecord;
    window.scrollTo(0, 0);
    if (!this.authService.isLoggedIn()) {
      sessionStorage.setItem('guideline', JSON.stringify(this.guidelinesForm.value));
      this.authService.login();
    }

    this.errorMessage = '';
    this.showLoader = true;

    guidelinesValue = FormControlService.cleanObjectInPlace(guidelinesValue);

    const method = this.editMode ? 'updateInteroperabilityRecord' : 'addInteroperabilityRecord';
    this.guidelinesService[method](guidelinesValue).subscribe(
      res => {},
      err => {
        this.showLoader = false;
                this.errorMessage =
          (err?.status >= 500 && err?.status < 600)
            ? `Something went wrong. If the issue persists, please contact support and provide the following error code: ${err?.error?.traceId}`
            : `Something went bad, server responded: ${err?.error?.detail}`;
      },
      () => {
        this.showLoader = false;
        this.router.navigate(['/dashboard/' + this.pidHandler.customEncodeURIComponent(this.providerId) +'/guidelines/']);
      }
    );
  }

  unsavedChangesPrompt() {
    this.hasChanges = true;
  }

  timeOut(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  showNotification() {
    UIkit.notification({
      message: 'Please remove duplicate entries.',
      status: 'danger',
      pos: 'top-center',
      timeout: 7000
    });
  }

  groupByKey(array, key) {
    return array.reduce((hash, obj) => {
      if (obj[key] === undefined) {
        return hash;
      }
      return Object.assign(hash, {[obj[key]]: (hash[obj[key]] || []).concat(obj)});
    }, {});
  }

  timestampToDate(timestamp: string) {
    return new Date(+timestamp).toUTCString();
    // return new Date(+timestamp).toISOString().split('T')[0]; //Date without time
  }

  switchToTab(id: string){
    const element: HTMLElement = document.getElementById(id) as HTMLElement;
    element.click();
    window.scrollTo(0, -1);
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.guidelinesForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    // return invalid;
    console.log('findInvalidControls ', invalid);
  }

  handleSubmit(formData: any) {
    if (this.editMode) {
      this.submitForm(formData);
    } else {
      this.checkDuplicatesAndProceed(formData);
    }
  }

  checkDuplicatesAndProceed(formData: any) {
    const value = FormControlService.cleanObjectInPlace({...formData.value?.interoperabilityRecord ?? formData});
    this.deduplicationService.checkBeforeAdd('interoperability_record', value).subscribe({
      next: similar => {
        if (similar && similar.length > 0) {
          this.similarResources = similar;
          this.formDataToSubmit = formData;
          UIkit.modal('#dupWarningModal').show();
        } else {
          this.submitForm(formData);
        }
      },
      error: () => this.submitForm(formData)
    });
  }

  proceedDespiteSimilar() {
    UIkit.modal('#dupWarningModal').hide();
    this.submitForm(this.formDataToSubmit);
  }

  copy = window.navigator.clipboard.writeText.bind(window.navigator.clipboard);

  protected readonly environment = environment;
  protected readonly isDevMode = isDevMode;
}
