import {UntypedFormBuilder, UntypedFormGroup, FormGroup} from '@angular/forms';
import {Component, Injector, OnInit, ViewChild, isDevMode} from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {NavigationService} from '../../services/navigation.service';
import {ResourceService} from '../../services/resource.service';
import {Provider, Service, Type, Adapter, Vocabulary} from '../../domain/eic-model';
import {Paging} from '../../domain/paging';
import {ConfigService} from "../../services/config.service";
import {environment} from '../../../environments/environment';
import {ActivatedRoute, Router} from '@angular/router';
import {Model} from "../../../dynamic-catalogue/domain/dynamic-form-model";
import {FormControlService} from "../../../dynamic-catalogue/services/form-control.service";
import {SurveyComponent} from "../../../dynamic-catalogue/pages/dynamic-form/survey.component";
import {AdaptersService} from "../../services/adapters.service";
import {pidHandler} from "../../shared/pid-handler/pid-handler.service";
import {DeduplicationService, SimilarResource} from '../../services/deduplication.service';

declare let UIkit: any;

@Component({
    selector: 'app-resource-adapters-form',
    templateUrl: './adapters-form.component.html',
    providers: [FormControlService],
    standalone: false
})
export class AdaptersFormComponent implements OnInit {
  @ViewChild(SurveyComponent) child: SurveyComponent
  model: Model = null;
  payloadAnswer: object = null;

  catalogueName: string | null = null;
  serviceORresource = environment.serviceORresource;
  serviceName = '';
  providerId: string;
  catalogueId: string;
  firstServiceForm = false;
  showLoader = false;
  pendingService = false;
  editMode = false;
  similarResources: SimilarResource[] = [];
  formDataToSubmit: any = null;
  hasChanges = false;
  serviceForm: UntypedFormGroup;
  provider: Provider;
  service: Service;
  adapter: Adapter;
  typeDescriptions = [];
  errorMessage = '';
  successMessage: string = null;
  weights: string[] = [];
  tabs: boolean[] = [false];
  fb: UntypedFormBuilder = this.injector.get(UntypedFormBuilder);
  disable = false;
  isPortalAdmin = false;
  adapterId: string = null;
  resourceType = '';
  //only one of these 2 ids will be filled from URL
  resourceId: string = null;
  trainingResourceId: string = null;

  providersPage: Paging<Provider>;
  serviceTypesVoc: any;
  resourceService: ResourceService = this.injector.get(ResourceService);
  navigator: NavigationService = this.injector.get(NavigationService);

  protected readonly isDevMode = isDevMode;

  constructor(protected injector: Injector,
              protected authenticationService: AuthenticationService,
              protected adaptersService: AdaptersService,
              protected route: ActivatedRoute,
              protected router: Router,
              protected config: ConfigService,
              public pidHandler: pidHandler,
              public deduplicationService: DeduplicationService
  ) {
    this.resourceService = this.injector.get(ResourceService);
    this.fb = this.injector.get(UntypedFormBuilder);
    this.navigator = this.injector.get(NavigationService);
    this.weights[0] = this.authenticationService.getUserEmail().split('@')[0];
  }

  submitForm(formData: FormGroup) {
    window.scrollTo(0, 0);
    this.showLoader = true;
    let adapterValue = formData.value.adapter;
    adapterValue = FormControlService.cleanObjectInPlace(adapterValue); // clean form before submission
    this.adaptersService.uploadAdapter(adapterValue, this.editMode).subscribe(
      _service => {
        this.showLoader = false;
        this.router.navigate(['/dashboard/' + this.pidHandler.customEncodeURIComponent(this.providerId) +'/adapters/']);
      },
      err => {
        this.showLoader = false;
        window.scrollTo(0, 0);
        console.log(err);
        this.errorMessage =
          (err?.status >= 500 && err?.status < 600)
            ? `Something went wrong. If the issue persists, please contact support and provide the following error code: ${err?.error?.traceId}`
            : `Something went bad, server responded: ${err?.error?.detail}`;
      }
    );
  }

  ngOnInit() {
    this.providerId = this.route.snapshot.paramMap.get('providerId');
    this.catalogueName = this.config.getProperty('catalogueName');
    // this.showLoader = true;
    this.getIdsFromCurrentPath();

    this.adaptersService.getFormModelById('m-b-adapter').subscribe(
      res => this.model = res,
      err => console.log(err),
      () => {
        if (!this.editMode) { //prefill field(s)
          const currentUser = this.getCurrentUserInfo();
          this.payloadAnswer = {
            'answer': {
              adapter: {
                'resourceOwner': decodeURIComponent(this.providerId),
                'type': "Adapter",
                'catalogueId': null,
                'nodePID': (this.config.getProperty('nodePidFixed')) ? this.config.getProperty('nodePid') : null
              }
            }
          };
        }
      }
    )

    if(this.adapterId){
      this.adaptersService.getAdapterById(this.adapterId).subscribe(
        res => { if(res!=null) {
          this.adapter = res;
          this.editMode = true;
          this.payloadAnswer = {'answer': {adapter: res}};
        }
        },
        err => { console.log(err); }
      );
    }

  }

  getIdsFromCurrentPath(){
    if (this.route.snapshot.paramMap.get('adapterId')) {
      this.adapterId = this.route.snapshot.paramMap.get('adapterId');
    }
  }

  getCurrentUserInfo(): { firstname: string; lastname: string; email: string } {
    return {
      firstname: this.authenticationService.getUserName(),
      lastname: this.authenticationService.getUserSurname(),
      email: this.authenticationService.getUserEmail()
    };
  }

  handleSubmit(formData: any) {
    if (this.editMode) {
      this.submitForm(formData);
    } else {
      this.checkDuplicatesAndProceed(formData);
    }
  }

  checkDuplicatesAndProceed(formData: any) {
    const value = FormControlService.cleanObjectInPlace({...formData.value?.adapter ?? formData});
    this.deduplicationService.checkBeforeAdd('adapter', value).subscribe({
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
}
