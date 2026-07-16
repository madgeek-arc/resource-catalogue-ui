import {UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {Component, Injector, isDevMode, OnInit, ViewChild} from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {NavigationService} from '../../services/navigation.service';
import {TrainingResourceService} from '../../services/training-resource.service';
import {DeployableService, Provider, Service, Type} from '../../domain/eic-model';
import {Paging} from '../../domain/paging';
import {zip} from 'rxjs';
import {ConfigService} from '../../services/config.service';
import {environment} from '../../../environments/environment';
import BitSet from 'bitset';
import {ActivatedRoute} from '@angular/router';
import {ResourceService} from "../../services/resource.service";
import {SurveyComponent} from "../../../dynamic-catalogue/pages/dynamic-form/survey.component";
import {Model} from "../../../dynamic-catalogue/domain/dynamic-form-model";
import {FormControlService} from "../../../dynamic-catalogue/services/form-control.service";
import {DeployableServiceService} from "../../services/deployable-service.service";
import {DeduplicationService, SimilarResource} from '../../services/deduplication.service';

declare let UIkit: any;

@Component({
    selector: 'app-deployable-service-form',
    templateUrl: './deployable-service-form.html',
    standalone: false
})
export class DeployableServiceForm implements OnInit {
  @ViewChild(SurveyComponent) child: SurveyComponent
  model: Model = null;
  payloadAnswer: object = null;
  formDataToSubmit: any = null;

  _marketplaceServicesURL = environment.marketplaceServicesURL;
  serviceName = '';
  firstServiceForm = false;
  showLoader = false;
  pendingResource = false;
  similarResources: SimilarResource[] = [];
  catalogueId: string;
  providerId: string;
  viewOnlyMode = false;
  editMode = false;
  hasChanges = false;
  serviceForm: UntypedFormGroup;
  provider: Provider;
  service: Service;
  deployableServiceId: string = null;
  errorMessage = '';
  successMessage: string = null;
  weights: string[] = [];
  tabs: boolean[] = [false, false, false, false, false, false, false, false, false, false, false, false];
  fb: UntypedFormBuilder = this.injector.get(UntypedFormBuilder);
  disable = false;
  isPortalAdmin = false;

  commentControl = new UntypedFormControl();

  providersPage: Paging<Provider>;
  resourceService: ResourceService = this.injector.get(ResourceService);
  trainingResourceService: TrainingResourceService = this.injector.get(TrainingResourceService);

  router: NavigationService = this.injector.get(NavigationService);


  constructor(protected injector: Injector,
              protected authenticationService: AuthenticationService,
              protected deployableServiceService: DeployableServiceService,
              protected route: ActivatedRoute,
              public dynamicFormService: FormControlService,
              public config: ConfigService,
              public deduplicationService: DeduplicationService
  ) {
    this.resourceService = this.injector.get(ResourceService);
    this.trainingResourceService = this.injector.get(TrainingResourceService);
    this.fb = this.injector.get(UntypedFormBuilder);
    this.router = this.injector.get(NavigationService);
    this.weights[0] = this.authenticationService.getUserEmail().split('@')[0];
  }

  submitForm(formData: any, tempSave: boolean, pendingService: boolean) {//TODO
    let dsValue = formData.value.deployableApplication;
    window.scrollTo(0, 0);

/*    if (!this.authenticationService.isLoggedIn()) {
      sessionStorage.setItem('service', JSON.stringify(this.serviceForm.value));
      this.authenticationService.login();
    }*/

    this.errorMessage = '';
    this.showLoader = true;

    dsValue = FormControlService.cleanObjectInPlace(dsValue);

    if (tempSave) {//TODO
      // this.deployableServiceService.saveServiceAsDraft(this.serviceForm.value).subscribe(
      //   _service => {
      //     // console.log(_service);
      //     this.showLoader = false;
      //     // return this.router.dashboardDraftResources(this.providerId); // navigate to draft list
      //     return this.router.go('/provider/' + _service.resourceOrganisation + '/draft-resource/update/' + _service.id);
      //   },
      //   err => {
      //     this.showLoader = false;
      //     window.scrollTo(0, 0);
      //     this.scientificDomainArray.enable();
      //     this.errorMessage =
      //           (err?.status >= 500 && err?.status < 600)
      //             ? `Something went wrong. If the issue persists, please contact support and provide the following error code: ${err?.error?.traceId}`
      //             : `Something went bad, server responded: ${err?.error?.detail}`;
      //   }
      // );
    } else {
      this.deployableServiceService[pendingService ? 'submitPendingService' : 'submitService']
      (dsValue, this.editMode, this.commentControl.value).subscribe(
        _service => {
          this.showLoader = false;
          return this.router.deployableServiceDashboard(this.providerId, _service.id);  // navigate to deployable-service-dashboard
        },
        err => {
          this.showLoader = false;
          window.scrollTo(0, 0);
          this.errorMessage =
          (err?.status >= 500 && err?.status < 600)
            ? `Something went wrong. If the issue persists, please contact support and provide the following error code: ${err?.error?.traceId}`
            : `Something went bad, server responded: ${err?.error?.detail}`;
          console.log(err);
          console.log(this.errorMessage);
        }
      );
    }
  }

  ngOnInit() {
    const path = this.route.snapshot.routeConfig.path;
    if (path.includes('view/:deployableServiceId')) {
      this.viewOnlyMode = true;
    }
    this.showLoader = true;
    zip(
      this.trainingResourceService.getProvidersNames('approved'),
      this.deployableServiceService.getFormModelById('m-b-deployable')
    ).subscribe(suc => {
        this.providersPage = <Paging<Provider>>suc[0];
        this.model = suc[1];
      },
      err => {
                this.errorMessage =
          (err?.status >= 500 && err?.status < 600)
            ? `Something went wrong. If the issue persists, please contact support and provide the following error code: ${err?.error?.traceId}`
            : `Something went bad while getting the data for page initialization: ${err?.error?.detail}`;
      },
      () => {
        this.providerId = this.route.snapshot.paramMap.get('providerId');

        if(!this.editMode){ //prefill field(s)
          this.payloadAnswer = {
            'answer': {
              deployableApplication:
                {
                  'resourceOwner': decodeURIComponent(this.providerId),
                  'type': "DeployableApplication",
                  'catalogueId': null,
                  'nodePID': (this.config.getProperty('nodePidFixed')) ? this.config.getProperty('nodePid') : null
                }
            }
          };
        }
        this.showLoader = false;
      }
    );

    this.isPortalAdmin = this.authenticationService.isAdmin();

  }

  public setAsTouched() {
    const ret = {};
    this.setAsTouched_(this.serviceForm, ret);
  }

  private setAsTouched_(form: UntypedFormGroup, ret: any) {
    Object.keys(form.controls).forEach(control => {
      const control_ = form.controls[control];
      // console.log(control, control_);
      if (!control_.valid) {
        ret[control] = {};
        if (control_.hasOwnProperty('controls')) {
          this.setAsTouched_(control_ as UntypedFormGroup, ret[control]);
        } else {
          if (control_.enabled && !control_.valid) {
            // console.log(control);
            ret[control] = control_.valid;
            (control_ as UntypedFormGroup).markAsDirty();
            (control_ as UntypedFormGroup).markAsTouched();
            // console.log(control, form.controls[control].valid);
          }
        }
      }
    });
  }

  unsavedChangesPrompt() {
    this.hasChanges = true;
  }

  timeOut(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /** Modals--> **/
  handleSubmit(formData: any) {
    if (this.editMode && !this.pendingResource) {
      this.formDataToSubmit = formData;
      UIkit.modal('#commentModal').show();
    } else {
      this.checkDuplicatesAndProceed(formData);
    }
  }

  checkDuplicatesAndProceed(formData: any) {
    const value = FormControlService.cleanObjectInPlace({...formData.value?.deployableApplication ?? formData});
    this.deduplicationService.checkBeforeAdd('deployable_application', value).subscribe({
      next: similar => {
        if (similar && similar.length > 0) {
          this.similarResources = similar;
          this.formDataToSubmit = formData;
          UIkit.modal('#dupWarningModal').show();
        } else {
          this.submitForm(formData, false, false);
        }
      },
      error: () => this.submitForm(formData, false, false)
    });
  }

  proceedDespiteSimilar() {
    UIkit.modal('#dupWarningModal').hide();
    this.submitForm(this.formDataToSubmit, false, false);
  }

  openPreviewModal() {
    // console.log('Resource ==>', this.serviceForm.value);
    UIkit.modal('#modal-preview').show();
  }

  showNotification() {
    UIkit.notification({
      // message: `Please remove duplicate entries for ${label}.`,
      message: 'Please remove duplicate entries.',
      status: 'danger',
      pos: 'top-center',
      timeout: 7000
    });
  }

  /** <--Modals **/

  groupByKey(array, key) {
    return array.reduce((hash, obj) => {
      if (obj[key] === undefined) {
        return hash;
      }
      return Object.assign(hash, {[obj[key]]: (hash[obj[key]] || []).concat(obj)});
    }, {});
  }

  copy = window.navigator.clipboard.writeText.bind(window.navigator.clipboard);

  protected readonly environment = environment;
  protected readonly isDevMode = isDevMode;
}
