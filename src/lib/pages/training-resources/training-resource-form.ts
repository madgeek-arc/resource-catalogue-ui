import {UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {Component, Injector, isDevMode, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {NavigationService} from '../../services/navigation.service';
import {TrainingResourceService} from '../../services/training-resource.service';
import {Provider, Service, TrainingResource, Type, Vocabulary} from '../../domain/eic-model';
import {Paging} from '../../domain/paging';
import {URLValidator} from '../../shared/validators/generic.validator';
import {zip} from 'rxjs';
import {environment} from '../../../environments/environment';
import {ActivatedRoute} from '@angular/router';
import {ServiceProviderService} from '../../services/service-provider.service';
import {ResourceService} from "../../services/resource.service";
import {SurveyComponent} from "../../../dynamic-catalogue/pages/dynamic-form/survey.component";
import {Model} from "../../../dynamic-catalogue/domain/dynamic-form-model";
import {FormControlService} from "../../../dynamic-catalogue/services/form-control.service";
import {ConfigService} from "../../services/config.service";
import {DeduplicationService, SimilarResource} from "../../services/deduplication.service";
import {SuggestionConfig, SuggestionService, SuggestionState} from "../../services/suggestion.service";

declare let UIkit: any;

@Component({
    selector: 'app-training-resource-form',
    templateUrl: './training-resource-form.html',
    standalone: false
})
export class TrainingResourceForm implements OnInit, OnDestroy {
  @ViewChild(SurveyComponent) child: SurveyComponent
  model: Model = null;
  payloadAnswer: object = null;
  formDataToSubmit: any = null;

  protected _marketplaceServicesURL = environment.marketplaceServicesURL;
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
  trainingResourceId: string = null;
  errorMessage = '';
  successMessage: string = null;
  weights: string[] = [];
  tabs: boolean[] = [false, false, false, false, false, false, false, false, false, false, false, false];
  fb: UntypedFormBuilder = this.injector.get(UntypedFormBuilder);
  isPortalAdmin = false;

  vocabularyEntryForm: UntypedFormGroup;
  suggestionsForm = {
    targetGroupsVocabularyEntryValueName: '', //targetUsersVocabularyEntryValueName: '',
    contentResourceTypesVocabularyEntryValueName: '',
    learningResourceTypesVocabularyEntryValueName: '',
    scientificDomainVocabularyEntryValueName: '',
    scientificSubDomainVocabularyEntryValueName: '',
    languagesVocabularyEntryValueName: '',
    geographicalVocabularyEntryValueName: '',
    vocabulary: '',
    errorMessage: '',
    successMessage: ''
  };

  commentControl = new UntypedFormControl();

  formGroupMeta = {
    id: [''],
    title: ['', Validators.required],
    resourceOrganisation: ['', Validators.required],
    resourceProviders: this.fb.array([this.fb.control('')]),
    authors: this.fb.array([this.fb.control('')], Validators.required), // tags but REQUIRED
    url: ['', Validators.compose([Validators.required, URLValidator])], //webpage
    urlType: [''], //lifeCycleStatus
    eoscRelatedServices: this.fb.array([this.fb.control('')]), //relatedResources
    alternativeIdentifiers: this.fb.array([
      this.fb.group({
        type: [''],
        value: ['']
      })
    ]),

    description: ['', Validators.required],
    keywords: this.fb.array([this.fb.control('')]), //tags
    license: ['', Validators.required],
    accessRights: ['', Validators.required], //orderType
    versionDate: ['', Validators.required], //version

    targetGroups: this.fb.array([this.fb.control('', Validators.required)], Validators.required),//targetUsers
    learningResourceTypes: this.fb.array([this.fb.control('')]),//accessModes
    learningOutcomes: this.fb.array([this.fb.control('')], Validators.required), // tags but REQUIRED
    expertiseLevel: ['', Validators.required], //orderType
    contentResourceTypes: this.fb.array([this.fb.control('')]),//accessModes
    qualifications: this.fb.array([this.fb.control('')]),//accessModes
    duration: [''],

    languages: this.fb.array([this.fb.control('', Validators.required)], Validators.required),
    geographicalAvailabilities: this.fb.array([this.fb.control('', Validators.required)], Validators.required),

    scientificDomains: this.fb.array([], Validators.required),

    contact: this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      phone: ['', Validators.pattern('^(((\\+)|(00))\\d{1,3}( )?)?((\\(\\d{3}\\))|\\d{3})[- .]?\\d{3}[- .]?\\d{4}$')],
      position: [''],
      organisation: ['']
    }, Validators.required),

    catalogueId: ['']
  };

  providersPage: Paging<Provider>;
  resourceService: ResourceService = this.injector.get(ResourceService);
  trainingResourceService: TrainingResourceService = this.injector.get(TrainingResourceService);

  router: NavigationService = this.injector.get(NavigationService);

  /** config for suggestions --> **/
  suggestionConfig: SuggestionConfig = {
    resourceType: 'training_resource',
    formKey: 'trainingResource',
    fields: [
      {
        fieldName: 'target_groups',
        label: 'Target Groups',
        type: 'checkbox',
        vocabularyType: Type.TARGET_USER,
        formArrayName: 'targetGroups'
      },
      {
        fieldName: 'qualifications',
        label: 'Qualifications',
        type: 'checkbox',
        vocabularyType: Type.QUALIFICATION,
        formArrayName: 'qualifications'
      },
      {
        fieldName: 'expertise_level',
        label: 'Expertise Level',
        type: 'radio',
        vocabularyType: Type.EXPERTISE_LEVEL,
        formArrayName: 'expertiseLevel'
      },
      {
        fieldName: 'learning_resource_types',
        label: 'Learning Resource Types',
        type: 'checkbox',
        vocabularyType: Type.LEARNING_RESOURCE_TYPE,
        formArrayName: 'learningResourceTypes'
      },
      {
        fieldName: 'content_resource_types',
        label: 'Content Resource Types',
        type: 'checkbox',
        vocabularyType: Type.CONTENT_RESOURCE_TYPE,
        formArrayName: 'contentResourceTypes'
      },
      {
        fieldName: 'access_rights',
        label: 'Access Rights',
        type: 'radio',
        vocabularyType: Type.ACCESS_RIGHT,
        formArrayName: 'accessRights'
      },
      {
        fieldName: 'tags',
        label: 'Keywords',
        type: 'checkbox',
        vocabularyType: null,
        formArrayName: 'keywords'
      }
    ]
  };

  suggestionService: SuggestionService = this.injector.get(SuggestionService);
  suggestionState: SuggestionState = this.suggestionService.getInitialState();
  // unique per component instance so two 'training_resource' forms can never collide on the same modal id
  suggestionModalId: string = this.suggestionService.generateModalId(this.suggestionConfig.resourceType);

  vocabularies: Map<string, Vocabulary[]> = null;
  /** <--config for suggestions **/

  constructor(protected injector: Injector,
              protected authenticationService: AuthenticationService,
              protected serviceProviderService: ServiceProviderService,
              protected route: ActivatedRoute,
              public dynamicFormService: FormControlService,
              public config: ConfigService,
              public deduplicationService: DeduplicationService
  ) {
    this.resourceService = this.injector.get(ResourceService);
    this.trainingResourceService = this.injector.get(TrainingResourceService);
    this.fb = this.injector.get(UntypedFormBuilder);
    this.router = this.injector.get(NavigationService);
    this.serviceForm = this.fb.group(this.formGroupMeta);
    this.weights[0] = this.authenticationService.getUserEmail().split('@')[0];
  }

  submitForm(formData: any, tempSave: boolean, pendingService: boolean) {//TODO
    let trValue = formData.value.trainingResource;
    window.scrollTo(0, 0);

    if (!this.authenticationService.isLoggedIn()) {
      sessionStorage.setItem('service', JSON.stringify(this.serviceForm.value));
      this.authenticationService.login();
    }

    this.errorMessage = '';
    this.showLoader = true;

    trValue = FormControlService.cleanObjectInPlace(trValue);

    if (tempSave) {//TODO
      this.trainingResourceService.saveServiceAsDraft(this.serviceForm.value).subscribe(
        _service => {
          // console.log(_service);
          this.showLoader = false;
          // return this.router.dashboardDraftResources(this.providerId); // navigate to draft list
          return this.router.go('/provider/' + _service.resourceOwner + '/draft-resource/update/' + _service.id);
        },
        err => {
          this.showLoader = false;
          window.scrollTo(0, 0);
          this.scientificDomainArray.enable();
          this.errorMessage =
          (err?.status >= 500 && err?.status < 600)
            ? `Something went wrong. If the issue persists, please contact support and provide the following error code: ${err?.error?.traceId}`
            : `Something went bad, server responded: ${err?.error?.detail}`;
        }
      );
    } else {
      this.trainingResourceService[pendingService ? 'submitPendingService' : 'submitService']
      (trValue, this.editMode, this.commentControl.value).subscribe(
        _resource => {
          // console.log(_resource);
          this.showLoader = false;
          return this.router.trainingResourceDashboard(this.providerId, _resource.id);  // navigate to training-resource-dashboard
          // return this.router.dashboardResources(this.providerId);                  // navigate to provider dashboard -> resource list
          // return this.router.dashboard(this.providerId);                          // navigate to provider dashboard
          // return this.router.service(_resource.id);                               // navigate to old service info page
          // return window.location.href = this._marketplaceServicesURL + _resource.id; // navigate to marketplace
        },
        err => {
          this.showLoader = false;
          window.scrollTo(0, 0);
          this.scientificDomainArray.enable();
          this.errorMessage =
          (err?.status >= 500 && err?.status < 600)
            ? `Something went wrong. If the issue persists, please contact support and provide the following error code: ${err?.error?.traceId}`
            : `Something went bad, server responded: ${err?.error?.detail}`;
        }
      );
    }
  }

  onSubmit(service: Service, tempSave: boolean, pendingService?: boolean) {
    // console.log('Submit');
    // console.log(this.commentControl.value);
    if (!this.authenticationService.isLoggedIn()) {
      sessionStorage.setItem('service', JSON.stringify(this.serviceForm.value));
      this.authenticationService.login();
    }

    this.errorMessage = '';
    this.showLoader = true;
    // this.scientificDomainArray.disable();
    // console.log('this.serviceForm.valid ', this.serviceForm.valid);
    // console.log('Submitted service --> ', service);
    // console.log('Submitted service value--> ', this.serviceForm.value);
    for (let i = 0; i < this.alternativeIdentifiersArray.length; i++) {
      if (this.alternativeIdentifiersArray.controls[i].get('value').value === ''
        || this.alternativeIdentifiersArray.controls[i].get('value').value === null) {
        this.removeAlternativeIdentifier(i);
      }
    }
    if (tempSave) {
      this.trainingResourceService.saveServiceAsDraft(this.serviceForm.value).subscribe(
        _service => {
          // console.log(_service);
          this.showLoader = false;
          // return this.router.dashboardDraftResources(this.providerId); // navigate to draft list
          return this.router.go('/provider/' + _service.resourceOwner + '/draft-resource/update/' + _service.id);
        },
        err => {
          this.showLoader = false;
          window.scrollTo(0, 0);
          this.scientificDomainArray.enable();
          this.errorMessage =
          (err?.status >= 500 && err?.status < 600)
            ? `Something went wrong. If the issue persists, please contact support and provide the following error code: ${err?.error?.traceId}`
            : `Something went bad, server responded: ${err?.error?.detail}`;
        }
      );
    } else if (this.serviceForm.valid) {
      window.scrollTo(0, 0);
      this.trainingResourceService[pendingService ? 'submitPendingService' : 'submitService']
      (this.serviceForm.value, this.editMode, this.commentControl.value).subscribe(
        _resource => {
          // console.log(_service);
          this.showLoader = false;
          return this.router.trainingResourceDashboard(this.providerId, _resource.id);  // navigate to training-resource-dashboard
          // return this.router.dashboardResources(this.providerId);                  // navigate to provider dashboard -> resource list
          // return this.router.dashboard(this.providerId);                          // navigate to provider dashboard
          // return this.router.service(_resource.id);                               // navigate to old service info page
          // return window.location.href = this._marketplaceServicesURL + _resource.id; // navigate to marketplace
        },
        err => {
          this.showLoader = false;
          window.scrollTo(0, 0);
          this.scientificDomainArray.enable();
          this.errorMessage =
          (err?.status >= 500 && err?.status < 600)
            ? `Something went wrong. If the issue persists, please contact support and provide the following error code: ${err?.error?.traceId}`
            : `Something went bad, server responded: ${err?.error?.detail}`;
        }
      );
    } else {
      window.scrollTo(0, 0);
      this.showLoader = false;

      this.scientificDomainArray.enable();
      this.setAsTouched();
      this.markTabs();
      this.serviceForm.markAsDirty();
      this.serviceForm.updateValueAndValidity();
      if (!this.serviceForm.valid) {
        this.errorMessage = 'Please fill in all required fields (marked with an asterisk), ' +
          'and fix the data format in fields underlined with a red colour.';
        if (!this.serviceForm.controls['description'].valid) {
          this.errorMessage += ' Description is an mandatory field.';
        }
      }
    }
  }

  ngOnInit() {
    this.showLoader = true;
    const path = this.route.snapshot.routeConfig.path;
    if (path.includes('view/:trainingResourceId')) {
      this.viewOnlyMode = true;
    }
    zip(
      this.trainingResourceService.getProvidersNames('approved'),
      this.serviceProviderService.getFormModelById('m-b-training'),
      this.resourceService.getAllVocabulariesByType()
    ).subscribe(suc => {
        this.providersPage = <Paging<Provider>>suc[0];
        this.model = suc[1];
        this.vocabularies = <Map<string, Vocabulary[]>>suc[2];
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
              trainingResource:
                {
                  'resourceOwner': decodeURIComponent(this.providerId),
                  'type': "TrainingMaterial",
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

    this.vocabularyEntryForm = this.fb.group(this.suggestionsForm);

    this.pushScientificDomain();

    if (sessionStorage.getItem('service')) {
      const data = JSON.parse(sessionStorage.getItem('service'));
      for (const i in data) {
        if (data.hasOwnProperty(i)) {
          if (Array.isArray(data[i])) {
            // console.log(i);
            for (let j = 0; j < data[i].length - 1; j++) {
              if (i === 'scientificDomains') {
                this.scientificDomainArray.push(this.newScientificDomain());
              } else if (i === 'providers' || i === 'targetUsers' || i === 'geographicalAvailabilities' || i === 'languages') {
                this.push(i, true);
              } else {
                this.push(i, false);
              }
            }
          }
        }
      }
      this.serviceForm.patchValue(data);
      if (!this.editMode) {
        sessionStorage.removeItem('service');
      }
    }
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

  /** check form fields and tabs validity--> **/
  checkFormValidity(name: string, edit: boolean, required?: boolean): boolean {
    // console.log(name, edit, required);
    if (required && edit && (this.serviceForm.get(name).value === "")) return false; // for dropdown required fields that get red on edit
    return (this.serviceForm.get(name).invalid && (edit || this.serviceForm.get(name).dirty));
  }

  checkFormArrayValidity(name: string, position: number, edit: boolean, groupName?: string, position2?: number, contactField?: string): boolean {
    if (contactField) {
      return this.getFieldAsFormArray(name).controls[position].get(groupName).get([position2]).get(contactField).valid
        && (edit || this.getFieldAsFormArray(name).controls[position].get(groupName).get([position2]).get(contactField).dirty);
    }
    if (groupName) {
      return this.getFieldAsFormArray(name).get([position]).get(groupName).invalid
        && (edit || this.getFieldAsFormArray(name).get([position]).get(groupName).dirty);
    }
    return (this.getFieldAsFormArray(name).get([position]).invalid && (edit || this.getFieldAsFormArray(name).get([position]).dirty));
  }

  checkEveryArrayFieldValidity(name: string, edit: boolean, groupName?: string, contactField?: string): boolean {
    for (let i = 0; i < this.getFieldAsFormArray(name).length; i++) {
      if (groupName && contactField) {
        for (let j = 0; j < this.getFieldAsFormArray(name).controls[i].get(groupName)[length]; j++) {
          if (this.getFieldAsFormArray(name).controls[i].get(groupName).get([j]).get(contactField).valid
            && (edit || this.getFieldAsFormArray(name).controls[i].get(groupName).get([j]).get(contactField).dirty)) {
            return true;
          }
        }
      }
      if (groupName) {
        if (this.getFieldAsFormArray(name).get([i]).get(groupName).invalid && (edit || this.getFieldAsFormArray(name).get([i]).get(groupName).dirty)) {
          return true;
        }
      } else if (this.getFieldAsFormArray(name).get([i]).invalid && (edit || this.getFieldAsFormArray(name).get([i]).dirty)) {
        return true;
      }
    }
    return false;
  }

  markTabs() {
    this.tabs[0] = (this.checkFormValidity('title', this.editMode)
      || this.checkFormValidity('resourceOrganisation', this.editMode)
      || this.checkEveryArrayFieldValidity('resourceProviders', this.editMode)
      || this.checkEveryArrayFieldValidity('authors', this.editMode)
      || this.checkFormValidity('url', this.editMode)
      || this.checkFormValidity('urlType', this.editMode)
      || this.checkEveryArrayFieldValidity('eoscRelatedServices', this.editMode));
    this.tabs[1] = (this.checkFormValidity('description', this.editMode)
      || this.checkEveryArrayFieldValidity('keywords', this.editMode)
      || this.checkFormValidity('license', this.editMode)
      || this.checkFormValidity('accessRights', this.editMode)
      || this.checkFormValidity('versionDate', this.editMode));
    this.tabs[2] = (this.checkEveryArrayFieldValidity('targetGroups', this.editMode)
      || this.checkEveryArrayFieldValidity('learningResourceTypes', this.editMode)
      || this.checkEveryArrayFieldValidity('learningOutcomes', this.editMode)
      || this.checkFormValidity('expertiseLevel', this.editMode)
      || this.checkEveryArrayFieldValidity('contentResourceTypes', this.editMode)
      || this.checkEveryArrayFieldValidity('qualifications', this.editMode)
      || this.checkFormValidity('duration', this.editMode));
    this.tabs[3] = (this.checkEveryArrayFieldValidity('languages', this.editMode)
      || this.checkEveryArrayFieldValidity('geographicalAvailabilities', this.editMode));
    this.tabs[4] = (this.checkEveryArrayFieldValidity('scientificDomains', this.editMode, 'scientificDomain')
      || this.checkEveryArrayFieldValidity('scientificDomains', this.editMode, 'scientificSubdomain'));
    this.tabs[5] = (this.checkFormValidity('contact.firstName', this.editMode)
      || this.checkFormValidity('contact.lastName', this.editMode)
      || this.checkFormValidity('contact.email', this.editMode)
      || this.checkFormValidity('contact.phone', this.editMode)
      || this.checkFormValidity('contact.position', this.editMode)
      || this.checkFormValidity('contact.organisation', this.editMode));

    // console.log(this.tabs);
  }

  /** <--check form fields and tabs validity **/

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

  /** Scientific Domain--> **/

  newScientificDomain(): UntypedFormGroup {
    return this.fb.group({
      scientificDomain: ['', Validators.required],
      scientificSubdomain: ['', Validators.required]
    });
  }

  get scientificDomainArray() {
    return this.serviceForm.get('scientificDomains') as UntypedFormArray;
  }

  pushScientificDomain() {
    this.scientificDomainArray.push(this.newScientificDomain());
    this.scientificDomainArray.controls[this.scientificDomainArray.length - 1].get('scientificSubdomain').disable();
  }

  removeScientificDomain(index: number) {
    this.scientificDomainArray.removeAt(index);
  }

  onScientificDomainChange(index: number) {
    this.scientificDomainArray.controls[index].get('scientificSubdomain').enable();
    this.scientificDomainArray.controls[index].get('scientificSubdomain').reset();
  }

  /** <-- Scientific Domain**/

  /** Alternative Identifiers-->**/
  newAlternativeIdentifier(): UntypedFormGroup {
    return this.fb.group({
      type: [''],
      value: ['']
    });
  }

  get alternativeIdentifiersArray() {
    return this.serviceForm.get('alternativeIdentifiers') as UntypedFormArray;
  }

  pushAlternativeIdentifier() {
    this.alternativeIdentifiersArray.push(this.newAlternativeIdentifier());
  }

  removeAlternativeIdentifier(index: number) {
    this.alternativeIdentifiersArray.removeAt(index);
  }
  /** <--Alternative Identifiers**/

  formPrepare(trainingResource: TrainingResource) {

    this.removeScientificDomain(0);
    if (trainingResource.scientificDomains) {
      for (let i = 0; i < trainingResource.scientificDomains.length; i++) {
        this.scientificDomainArray.push(this.newScientificDomain());
        this.scientificDomainArray.controls[this.scientificDomainArray.length - 1]
          .get('scientificDomain').setValue(trainingResource.scientificDomains[i].scientificDomain);
        this.scientificDomainArray.controls[this.scientificDomainArray.length - 1]
          .get('scientificSubdomain').setValue(trainingResource.scientificDomains[i].scientificSubdomain);
      }
    } else {
      this.scientificDomainArray.push(this.newScientificDomain());
    }

    if (trainingResource.serviceProviders) {
      for (let i = 0; i < trainingResource.serviceProviders.length - 1; i++) {
        this.push('resourceProviders', true);
      }
    }
    if (trainingResource.authors) {
      for (let i = 0; i < trainingResource.authors.length - 1; i++) {
        this.push('authors', true);
      }
    }
    if (trainingResource.eoscRelatedServices) {
      for (let i = 0; i < trainingResource.eoscRelatedServices.length - 1; i++) {
        this.push('eoscRelatedServices', true);
      }
    }
    if (trainingResource.alternativeIdentifiers) {
      for (let i = 0; i < trainingResource.alternativeIdentifiers.length - 1; i++) {
        this.pushAlternativeIdentifier();
      }
    }
    if (trainingResource.keywords) {
      for (let i = 0; i < trainingResource.keywords.length - 1; i++) {
        this.push('keywords', true);
      }
    }
    if (trainingResource.targetGroups) {
      for (let i = 0; i < trainingResource.targetGroups.length - 1; i++) {
        this.push('targetGroups', true);
      }
    }
    if (trainingResource.learningResourceTypes) {
      for (let i = 0; i < trainingResource.learningResourceTypes.length - 1; i++) {
        this.push('learningResourceTypes', false);
      }
    }
    if (trainingResource.learningOutcomes) {
      for (let i = 0; i < trainingResource.learningOutcomes.length - 1; i++) {
        this.push('learningOutcomes', false);
      }
    }
    if (trainingResource.contentResourceTypes) {
      for (let i = 0; i < trainingResource.contentResourceTypes.length - 1; i++) {
        this.push('contentResourceTypes', false);
      }
    }
    if (trainingResource.qualifications) {
      for (let i = 0; i < trainingResource.qualifications.length - 1; i++) {
        this.push('qualifications', false);
      }
    }
    if (trainingResource.languages) {
      for (let i = 0; i < trainingResource.languages.length - 1; i++) {
        this.push('languages', true);
      }
    }
    if (trainingResource.geographicalAvailabilities) {
      for (let i = 0; i < trainingResource.geographicalAvailabilities.length - 1; i++) {
        this.push('geographicalAvailabilities', true);
      }
    }
  }

  unsavedChangesPrompt() {
    this.hasChanges = true;
  }

  timeOut(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  checkForDuplicates(formControlName, group?) {
    if (group === 'scientificDomains') {
      for (let i = 0; i < this.scientificDomainArray.controls.length; i++) {
        for (let j = 0; j <  this.scientificDomainArray.controls.length; j++) {
          if (i !== j && this.scientificDomainArray.controls[i].get('scientificDomain').value === this.scientificDomainArray.controls[j].get('scientificDomain').value ) {
            if (this.scientificDomainArray.controls[i].get('scientificSubdomain').value === this.scientificDomainArray.controls[j].get('scientificSubdomain').value) {
              this.showNotification();
              return;
            }
          }
        }
      }
    } else {
      if (this.serviceForm.get(formControlName).value.length > 1) {
        for (let i = 0; i < this.serviceForm.get(formControlName).value.length; i++) {
          for (let j = 0; j < this.serviceForm.get(formControlName).value.length; j++) {
            if (i !== j && this.serviceForm.get(formControlName).value[i] === this.serviceForm.get(formControlName).value[j]) {
              this.showNotification();
              return;
            }
          }
        }
      }
    }
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
    const value = FormControlService.cleanObjectInPlace({...formData.value?.trainingResource ?? formData});
    this.deduplicationService.checkBeforeAdd('training_resource', value).subscribe({
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

  submitSuggestion(entryValueName, vocabulary, parent) {
    if (entryValueName.trim() !== '') {
      this.serviceProviderService.submitVocabularyEntry(entryValueName, vocabulary, parent, 'training_resource', this.providerId, this.trainingResourceId).subscribe(
        res => {
        },
        error => {
          console.log(error);
          this.vocabularyEntryForm.get('errorMessage').setValue(error.error.detail);
        },
        () => {
          this.vocabularyEntryForm.reset();
          this.vocabularyEntryForm.get('successMessage').setValue('Suggestion submitted!');
        }
      );
    }
  }

  groupByKey(array, key) {
    return array.reduce((hash, obj) => {
      if (obj[key] === undefined) {
        return hash;
      }
      return Object.assign(hash, {[obj[key]]: (hash[obj[key]] || []).concat(obj)});
    }, {});
  }

  switchToTab(id: string){
    const element: HTMLElement = document.getElementById(id) as HTMLElement;
    element.click();
    window.scrollTo(0, -1);
  }

  /** Suggestions(Recommendations) Autocomplete--> **/
  showSuggestionsModal() {
    this.suggestionService.fetchSuggestions(
      this.suggestionConfig,
      this.child.form,
      this.vocabularies,
      this.suggestionState,
      (newState) => {
        this.suggestionState = newState;
        UIkit.modal('#' + this.suggestionModalId).show(); // safe to call multiple times
      }
    );
  }

  ngOnDestroy() {
    UIkit.modal('#' + this.suggestionModalId)?.$destroy(true);
  }

  onCheckboxChange(event: any, fieldName: string, type: 'checkbox' | 'radio') {
    this.suggestionState.selections = this.suggestionService.toggleSelection(
      this.suggestionState, fieldName, event.target.value, event.target.checked, type
    );
  }

  isSuggestionSelected(fieldName: string, itemId: string, type: 'checkbox' | 'radio'): boolean {
    return this.suggestionService.isSelected(this.suggestionState, fieldName, itemId, type);
  }

  autocomplete() {
    this.suggestionService.autocomplete(
      this.suggestionConfig,
      this.child.form,
      this.suggestionState,
      this.vocabularies,
      this.child,
      this.dynamicFormService,
      this.model
    );
  }
  /** <--Suggestions(Recommendations) Autocomplete **/

  copy = window.navigator.clipboard.writeText.bind(window.navigator.clipboard);

  protected readonly environment = environment;
  protected readonly isDevMode = isDevMode;
}
