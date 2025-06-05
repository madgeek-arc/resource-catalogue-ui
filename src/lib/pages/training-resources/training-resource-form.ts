import {UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {Component, Injector, isDevMode, OnInit, ViewChild} from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {NavigationService} from '../../services/navigation.service';
import {TrainingResourceService} from '../../services/training-resource.service';
import * as dm from '../../shared/description.map';
import {Provider, RichService, Service, TrainingResource, Type, Vocabulary} from '../../domain/eic-model';
import {Paging} from '../../domain/paging';
import {URLValidator} from '../../shared/validators/generic.validator';
import {zip} from 'rxjs';
import {PremiumSortPipe} from '../../shared/pipes/premium-sort.pipe';
import {environment} from '../../../environments/environment';
import BitSet from 'bitset';
import {ActivatedRoute} from '@angular/router';
import {ServiceProviderService} from '../../services/service-provider.service';
import {ResourceService} from "../../services/resource.service";
import {SurveyComponent} from "../../../dynamic-catalogue/pages/dynamic-form/survey.component";
import {Model} from "../../../dynamic-catalogue/domain/dynamic-form-model";
import {FormControlService} from "../../../dynamic-catalogue/services/form-control.service";

declare var UIkit: any;

@Component({
  selector: 'app-training-resource-form',
  templateUrl: './training-resource-form.html',
  styleUrls: ['../provider/service-provider-form.component.css']
})
export class TrainingResourceForm implements OnInit {
  @ViewChild(SurveyComponent) child: SurveyComponent
  model: Model = null;
  vocabulariesMap: Map<string, object[]> = null;
  subVocabulariesMap: Map<string, object[]> = null
  payloadAnswer: object = null;
  formDataToSubmit: any = null;

  protected _marketplaceServicesURL = environment.marketplaceServicesURL;
  projectMail = environment.projectMail;
  serviceName = '';
  firstServiceForm = false;
  showLoader = false;
  pendingResource = false;
  catalogueId: string;
  providerId: string;
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
  disable = false;
  isPortalAdmin = false;

  requiredOnTab0 = 4;
  requiredOnTab1 = 3;
  requiredOnTab2 = 3;
  requiredOnTab3 = 2;
  requiredOnTab4 = 1;
  requiredOnTab5 = 1;

  remainingOnTab0 = this.requiredOnTab0;
  remainingOnTab1 = this.requiredOnTab1;
  remainingOnTab2 = this.requiredOnTab2;
  remainingOnTab3 = this.requiredOnTab3;
  remainingOnTab4 = this.requiredOnTab4;
  remainingOnTab5 = this.requiredOnTab5;

  BitSetTab0 = new BitSet;
  BitSetTab1 = new BitSet;
  BitSetTab2 = new BitSet;
  BitSetTab3 = new BitSet;
  BitSetTab4 = new BitSet;
  BitSetTab5 = new BitSet;

  requiredTabs = 6;
  completedTabs = 0;
  completedTabsBitSet = new BitSet;

  allRequiredFields = 17;
  loaderBitSet = new BitSet;
  loaderPercentage = 0;

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

  readonly titleDesc: dm.Description = dm.trainingDescMap.get('titleDesc');
  readonly resourceOrganisationDesc: dm.Description = dm.trainingDescMap.get('resourceOrganisationDesc');
  readonly resourceProvidersDesc: dm.Description = dm.trainingDescMap.get('resourceProvidersDesc');
  readonly authorsDesc: dm.Description = dm.trainingDescMap.get('authorsDesc');
  readonly urlDesc: dm.Description = dm.trainingDescMap.get('urlDesc');
  readonly urlTypeDesc: dm.Description = dm.trainingDescMap.get('urlTypeDesc');
  readonly eoscRelatedServiceDesc: dm.Description = dm.trainingDescMap.get('eoscRelatedServiceDesc');
  readonly altIdTypeDesc: dm.Description = dm.serviceDescMap.get('altIdTypeDesc');
  readonly altIdValueDesc: dm.Description = dm.serviceDescMap.get('altIdValueDesc');

  readonly descriptionDesc: dm.Description = dm.trainingDescMap.get('descriptionDesc');
  readonly keywordsDesc: dm.Description = dm.trainingDescMap.get('keywordsDesc');
  readonly licenseDesc: dm.Description = dm.trainingDescMap.get('licenseDesc');
  readonly accessRightsDesc: dm.Description = dm.trainingDescMap.get('accessRightsDesc');
  readonly versionDateDesc: dm.Description = dm.trainingDescMap.get('versionDateDesc');

  readonly targetGroupDesc: dm.Description = dm.trainingDescMap.get('targetGroupDesc');
  readonly learningResourceTypeDesc: dm.Description = dm.trainingDescMap.get('learningResourceTypeDesc');
  readonly learningOutcomesDesc: dm.Description = dm.trainingDescMap.get('learningOutcomesDesc');
  readonly expertiseLevelDesc: dm.Description = dm.trainingDescMap.get('expertiseLevelDesc');
  readonly contentResourceTypeDesc: dm.Description = dm.trainingDescMap.get('contentResourceTypeDesc');
  readonly qualificationDesc: dm.Description = dm.trainingDescMap.get('qualificationDesc');
  readonly durationDesc: dm.Description = dm.trainingDescMap.get('durationDesc');

  readonly languagesDesc: dm.Description = dm.trainingDescMap.get('languagesDesc');
  readonly geographicalAvailabilityDesc: dm.Description = dm.trainingDescMap.get('geographicalAvailabilityDesc');

  readonly scientificDomainDesc: dm.Description = dm.trainingDescMap.get('scientificDomainDesc');
  readonly scientificSubDomainDesc: dm.Description = dm.trainingDescMap.get('scientificSubDomainDesc');

  readonly firstNameDesc: dm.Description = dm.trainingDescMap.get('firstNameDesc');
  readonly lastNameDesc: dm.Description = dm.trainingDescMap.get('lastNameDesc');
  readonly emailDesc: dm.Description = dm.trainingDescMap.get('emailDesc');
  readonly phoneDesc: dm.Description = dm.trainingDescMap.get('phoneDesc');
  readonly positionDesc: dm.Description = dm.trainingDescMap.get('positionDesc');
  readonly organisationDesc: dm.Description = dm.trainingDescMap.get('organisationDesc');


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
  providersAsVocs: any;
  resourcesAsVocs: any;
  territoriesVoc: any;
  vocabularies: Map<string, Vocabulary[]> = null;
  subVocabularies: Map<string, Vocabulary[]> = null;
  premiumSort = new PremiumSortPipe();
  resourceService: ResourceService = this.injector.get(ResourceService);
  trainingResourceService: TrainingResourceService = this.injector.get(TrainingResourceService);

  router: NavigationService = this.injector.get(NavigationService);

  public fundingBodyVocabulary: Vocabulary[] = null;
  public fundingProgramVocabulary: Vocabulary[] = null;
  public relatedPlatformsVocabulary: Vocabulary[] = null;
  public targetUsersVocabulary: Vocabulary[] = null;
  public accessTypesVocabulary: Vocabulary[] = null;
  public accessModesVocabulary: Vocabulary[] = null;
  public orderTypeVocabulary: Vocabulary[] = null;
  public phaseVocabulary: Vocabulary[] = null;
  public trlVocabulary: Vocabulary[] = null;
  public superCategoriesVocabulary: Vocabulary[] = null;
  public categoriesVocabulary: Vocabulary[] = null;
  public subCategoriesVocabulary: Vocabulary[] = null;
  public scientificDomainVocabulary: Vocabulary[] = null;
  public scientificSubDomainVocabulary: Vocabulary[] = null;
  public placesVocabulary: Vocabulary[] = [];
  public geographicalVocabulary: Vocabulary[] = null;
  public languagesVocabulary: Vocabulary[] = null;

  public accessRightsVocabulary: Vocabulary[] = null;
  public contentResourceTypesVocabulary: Vocabulary[] = null;
  public learningResourceTypesVocabulary: Vocabulary[] = null;
  public expertiseLevelVocabulary: Vocabulary[] = null;
  public qualificationsVocabulary: Vocabulary[] = null;
  public urlTypeVocabulary: Vocabulary[] = null;


  constructor(protected injector: Injector,
              protected authenticationService: AuthenticationService,
              protected serviceProviderService: ServiceProviderService,
              protected route: ActivatedRoute,
              public dynamicFormService: FormControlService
  ) {
    this.resourceService = this.injector.get(ResourceService);
    this.trainingResourceService = this.injector.get(TrainingResourceService);
    this.fb = this.injector.get(UntypedFormBuilder);
    this.router = this.injector.get(NavigationService);
    this.serviceForm = this.fb.group(this.formGroupMeta);
    this.weights[0] = this.authenticationService.user.email.split('@')[0];
  }

  submitForm(value: any, tempSave: boolean, pendingService: boolean) {//TODO
    let trValue = value[0].value.TrainingResource;
    window.scrollTo(0, 0);

    if (!this.authenticationService.isLoggedIn()) {
      sessionStorage.setItem('service', JSON.stringify(this.serviceForm.value));
      this.authenticationService.login();
    }

    this.errorMessage = '';
    this.showLoader = true;

    this.cleanArrayProperty(trValue, 'alternativeIdentifiers');
    this.cleanArrayProperty(trValue, 'scientificDomains');

    if (tempSave) {//TODO
      this.trainingResourceService.saveServiceAsDraft(this.serviceForm.value).subscribe(
        _service => {
          // console.log(_service);
          this.showLoader = false;
          // return this.router.dashboardDraftResources(this.providerId); // navigate to draft list
          return this.router.go('/provider/' + _service.resourceOrganisation + '/draft-resource/update/' + _service.id);
        },
        err => {
          this.showLoader = false;
          window.scrollTo(0, 0);
          this.scientificDomainArray.enable();
          this.errorMessage = 'Something went bad, server responded: ' + JSON.stringify(err.error.message);
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
          this.errorMessage = 'Something went bad, server responded: ' + JSON.stringify(err.error.message);
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
          return this.router.go('/provider/' + _service.resourceOrganisation + '/draft-resource/update/' + _service.id);
        },
        err => {
          this.showLoader = false;
          window.scrollTo(0, 0);
          this.scientificDomainArray.enable();
          this.errorMessage = 'Something went bad, server responded: ' + JSON.stringify(err.error.message);
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
          this.errorMessage = 'Something went bad, server responded: ' + JSON.stringify(err.error.message);
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
    zip(
      this.trainingResourceService.getProvidersNames('approved'),
      this.trainingResourceService.getAllVocabulariesByType(),
      this.resourceService.getProvidersAsVocs(this.catalogueId ? this.catalogueId : 'eosc'),
      this.resourceService.getResourcesAsVocs(this.catalogueId ? this.catalogueId : 'eosc'),
      this.trainingResourceService.getTerritories(),
      this.serviceProviderService.getFormModelById('m-b-training')
    ).subscribe(suc => {
        this.providersPage = <Paging<Provider>>suc[0];
        this.vocabularies = <Map<string, Vocabulary[]>>suc[1];
        this.vocabulariesMap = suc[1];
        this.providersAsVocs = suc[2];
        this.resourcesAsVocs = suc[3];
        this.territoriesVoc = suc[4]; //combined COUNTRY and REGION vocs
        this.model = suc[5];
        // this.getLocations();

        this.vocabulariesMap = suc[1];
        let subVocs: Vocabulary[] = this.vocabulariesMap['SCIENTIFIC_SUBDOMAIN'].concat(this.vocabulariesMap['SUBCATEGORY']);
        this.subVocabulariesMap = this.groupByKey(subVocs, 'parentId');

        [this.providersAsVocs, this.resourcesAsVocs, this.territoriesVoc].forEach(vocSet => {
          Object.entries(vocSet).forEach(([key, newItems]) => {
            // Type assertion to ensure newItems is an array
            const additionalItems = newItems as Vocabulary[];
            const existingItems = this.vocabulariesMap[key] || [];
            this.vocabulariesMap[key] = [...existingItems, ...additionalItems];
          });
        });

/*        this.targetUsersVocabulary = this.vocabularies[Type.TARGET_USER];
        this.accessTypesVocabulary = this.vocabularies[Type.ACCESS_TYPE];
        this.accessModesVocabulary = this.vocabularies[Type.ACCESS_MODE];
        this.orderTypeVocabulary = this.vocabularies[Type.ORDER_TYPE];
        this.phaseVocabulary = this.vocabularies[Type.LIFE_CYCLE_STATUS];
        this.trlVocabulary = this.vocabularies[Type.TRL];
        this.superCategoriesVocabulary = this.vocabularies[Type.SUPERCATEGORY];
        this.categoriesVocabulary = this.vocabularies[Type.CATEGORY];
        this.subCategoriesVocabulary = this.vocabularies[Type.SUBCATEGORY];
        this.scientificDomainVocabulary = this.vocabularies[Type.SCIENTIFIC_DOMAIN];
        this.scientificSubDomainVocabulary = this.vocabularies[Type.SCIENTIFIC_SUBDOMAIN];
        this.fundingBodyVocabulary = this.vocabularies[Type.FUNDING_BODY];
        this.fundingProgramVocabulary = this.vocabularies[Type.FUNDING_PROGRAM];
        this.relatedPlatformsVocabulary = this.vocabularies[Type.RELATED_PLATFORM];
        this.placesVocabulary = this.vocabularies[Type.COUNTRY];
        // this.geographicalVocabulary = Object.assign(this.vocabularies[Type.COUNTRY],this.vocabularies[Type.REGION]);
        this.geographicalVocabulary = this.vocabularies[Type.REGION];
        this.geographicalVocabulary.push(...this.vocabularies[Type.COUNTRY]);
        this.languagesVocabulary = this.vocabularies[Type.LANGUAGE];


        this.accessRightsVocabulary = this.vocabularies[Type.TR_ACCESS_RIGHT];
        this.contentResourceTypesVocabulary = this.vocabularies[Type.TR_CONTENT_RESOURCE_TYPE];
        this.learningResourceTypesVocabulary = this.vocabularies[Type.TR_DCMI_TYPE];
        this.expertiseLevelVocabulary = this.vocabularies[Type.TR_EXPERTISE_LEVEL];
        this.qualificationsVocabulary = this.vocabularies[Type.TR_QUALIFICATION];
        this.urlTypeVocabulary = this.vocabularies[Type.TR_URL_TYPE];*/
      },
      error => {
        this.errorMessage = 'Something went bad while getting the data for page initialization. ' + JSON.stringify(error.error.message);
      },
      () => {
        this.premiumSort.transform(this.geographicalVocabulary, ['Europe', 'Worldwide']);
        this.premiumSort.transform(this.languagesVocabulary, ['English']);
        this.providersPage.results.sort((a, b) => 0 - (a.name > b.name ? -1 : 1));

        let voc: Vocabulary[] = this.vocabularies[Type.SUBCATEGORY].concat(this.vocabularies[Type.SCIENTIFIC_SUBDOMAIN]);
        this.subVocabularies = this.groupByKey(voc, 'parentId');

        this.providerId = this.route.snapshot.paramMap.get('providerId');

        if(!this.editMode){ //prefill field(s)
          this.payloadAnswer = {'answer': { TrainingResource:
                { 'resourceOrganisation': decodeURIComponent(this.providerId)}
            }};
        }

/*        if (!this.editMode) { // prefill main contact info
          this.serviceProviderService.getServiceProviderById(this.providerId).subscribe(
            res => { this.provider = res; },
            err => { console.log(err); },
            () => {
              Object.entries(this.provider.mainContact).forEach(([key, val]) => {
                if (val !== '' && val != null) {
                  this.serviceForm.controls['contact'].get(key).setValue(val);
                }
              });
              this.handleBitSetsOfGroups(5, 14, 'firstName', 'contact');
              this.handleBitSetsOfGroups(5, 15, 'lastName', 'contact');
              this.handleBitSetsOfGroups(5, 16, 'email', 'contact');
            }
          );
        }*/
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

  getVocabularyById(vocabularies: Vocabulary[], id: string) {
    return vocabularies.find(entry => entry.id === id);
  }

  getSortedChildrenCategories(childrenCategory: Vocabulary[], parentId: string) {
    return this.sortVocabulariesByName(childrenCategory.filter(entry => entry.parentId === parentId));
  }

  sortVocabulariesByName(vocabularies: Vocabulary[]): Vocabulary[] {
    return vocabularies.sort((vocabulary1, vocabulary2) => {
      if (vocabulary1.name > vocabulary2.name) {
        return 1;
      }
      if (vocabulary1.name < vocabulary2.name) {
        return -1;
      }
      return 0;
    });
  }

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

    if (trainingResource.resourceProviders) {
      for (let i = 0; i < trainingResource.resourceProviders.length - 1; i++) {
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

  /** BitSets -->**/
  /** TODO: maybe timeout can be removed with subject **/
  handleBitSets(tabNum: number, bitIndex: number, formControlName: string): void {
    if (bitIndex === 0) {
      this.serviceName = this.serviceForm.get(formControlName).value;
    }
    // this.serviceForm.get(formControlName).updateValueAndValidity();
    if (this.serviceForm.get(formControlName).valid) {
      this.decreaseRemainingFieldsPerTab(tabNum, bitIndex);
      this.loaderBitSet.set(bitIndex, 1);
    } else if (this.serviceForm.get(formControlName).invalid) {
      this.increaseRemainingFieldsPerTab(tabNum, bitIndex);
      this.loaderBitSet.set(bitIndex, 0);
    } else if (this.serviceForm.get(formControlName).pending) {
      this.timeOut(300).then( () => this.handleBitSets(tabNum, bitIndex, formControlName));
      return;
    }
    this.updateLoaderPercentage();
  }

  handleBitSetsOfGroups(tabNum: number, bitIndex: number, formControlName: string, group: string): void {
    if (group === 'scientificDomains') {
      for (const scientificDomain of this.scientificDomainArray.controls) {
        if (scientificDomain.get('scientificSubdomain').value) {
          this.decreaseRemainingFieldsPerTab(tabNum, bitIndex - 1);
          this.loaderBitSet.set(bitIndex - 1, 1);
          this.decreaseRemainingFieldsPerTab(tabNum, bitIndex);
          this.loaderBitSet.set(bitIndex, 1);
        } else {
          this.increaseRemainingFieldsPerTab(tabNum, bitIndex - 1);
          this.loaderBitSet.set(bitIndex - 1, 0);
          this.increaseRemainingFieldsPerTab(tabNum, bitIndex);
          this.loaderBitSet.set(bitIndex, 0);
        }
      }
    } else {
      this.serviceForm.controls[group].get(formControlName).updateValueAndValidity();
      if (this.serviceForm.controls[group].get(formControlName).valid) {
        this.decreaseRemainingFieldsPerTab(tabNum, bitIndex);
        this.loaderBitSet.set(bitIndex, 1);
      } else if (this.serviceForm.controls[group].get(formControlName).invalid) {
        this.increaseRemainingFieldsPerTab(tabNum, bitIndex);
        this.loaderBitSet.set(bitIndex, 0);
      }
    }
    this.updateLoaderPercentage();
  }

  updateLoaderPercentage() {
    // console.log(this.loaderBitSet.toString(2));
    // console.log('cardinality: ', this.loaderBitSet.cardinality());
    this.loaderPercentage = Math.round((this.loaderBitSet.cardinality() / this.allRequiredFields) * 100);
    // console.log(this.loaderPercentage, '%');
  }

  decreaseRemainingFieldsPerTab(tabNum: number, bitIndex: number) {
    if (tabNum === 0) {
      this.BitSetTab0.set(bitIndex, 1);
      this.remainingOnTab0 = this.requiredOnTab0 - this.BitSetTab0.cardinality();
      if (this.remainingOnTab0 === 0 && this.completedTabsBitSet.get(tabNum) !== 1) {
        this.calcCompletedTabs(tabNum, 1);
      }
    } else if (tabNum === 1) {
      this.BitSetTab1.set(bitIndex, 1);
      this.remainingOnTab1 = this.requiredOnTab1 - this.BitSetTab1.cardinality();
      if (this.remainingOnTab1 === 0 && this.completedTabsBitSet.get(tabNum) !== 1) {
        this.calcCompletedTabs(tabNum, 1);
      }
    } else if (tabNum === 2) {  // Learning
      this.BitSetTab2.set(bitIndex, 1);
      this.remainingOnTab2 = this.requiredOnTab2 - this.BitSetTab2.cardinality();
      if (this.remainingOnTab2 === 0 && this.completedTabsBitSet.get(tabNum) !== 1) {
        this.calcCompletedTabs(tabNum, 1);
      }
    } else if (tabNum === 3) {
      this.BitSetTab3.set(bitIndex, 1);
      this.remainingOnTab3 = this.requiredOnTab3 - this.BitSetTab3.cardinality();
      if (this.remainingOnTab3 === 0 && this.completedTabsBitSet.get(tabNum) !== 1) {
        this.calcCompletedTabs(tabNum, 1);
      }
    } else if (tabNum === 4) { // Classification
      this.BitSetTab4.set(bitIndex, 1);
      this.remainingOnTab4 = this.requiredOnTab4 - this.BitSetTab4.get(13);
      if (this.remainingOnTab4 === 0 && this.completedTabsBitSet.get(tabNum) !== 1) {
        this.calcCompletedTabs(tabNum, 1);
      }
    } else if (tabNum === 5) { // Contact
      this.BitSetTab5.set(bitIndex, 1);
      const contactCardinality = this.BitSetTab5.slice(14, 16).cardinality();
      this.remainingOnTab5 = this.requiredOnTab5 - +(contactCardinality === 3);
      if (this.remainingOnTab5 === 0 && this.completedTabsBitSet.get(tabNum) !== 1) {
        this.calcCompletedTabs(tabNum, 1);
      }
    }
  }

  increaseRemainingFieldsPerTab(tabNum: number, bitIndex: number) {
    if (tabNum === 0) {
      this.BitSetTab0.set(bitIndex, 0);
      this.remainingOnTab0 = this.requiredOnTab0 - this.BitSetTab0.cardinality();
      if (this.completedTabsBitSet.get(tabNum) !== 0) {
        this.calcCompletedTabs(tabNum, 0);
      }
    } else if (tabNum === 1) {
      this.BitSetTab1.set(bitIndex, 0);
      this.remainingOnTab1 = this.requiredOnTab1 - this.BitSetTab1.cardinality();
      if (this.completedTabsBitSet.get(tabNum) !== 0) {
        this.calcCompletedTabs(tabNum, 0);
      }
    } else if (tabNum === 2) {  // Learning
      this.BitSetTab2.set(bitIndex, 0);
      this.remainingOnTab2 = this.requiredOnTab2 - this.BitSetTab2.cardinality();
      if (this.completedTabsBitSet.get(tabNum) !== 0) {
        this.calcCompletedTabs(tabNum, 0);
      }
    } else if (tabNum === 3) {
      this.BitSetTab3.set(bitIndex, 0);
      this.remainingOnTab3 = this.requiredOnTab3 - this.BitSetTab3.cardinality();
      if (this.completedTabsBitSet.get(tabNum) !== 0) {
        this.calcCompletedTabs(tabNum, 0);
      }
    } else if (tabNum === 4) { // Classification
      this.BitSetTab4.set(bitIndex, 0);
      this.remainingOnTab4 = this.requiredOnTab4 - this.BitSetTab4.get(13);
      if (this.completedTabsBitSet.get(tabNum) !== 0) {
        this.calcCompletedTabs(tabNum, 0);
      }
    } else if (tabNum === 5) { // Contact
      this.BitSetTab5.set(bitIndex, 0);
      const contactCardinality = this.BitSetTab5.slice(14, 16).cardinality();
      this.remainingOnTab5 = this.requiredOnTab5 - +(contactCardinality === 3);
      if (this.completedTabsBitSet.get(tabNum) !== 0) {
        this.calcCompletedTabs(tabNum, 0);
      }
    }
  }

  calcCompletedTabs(tabNum: number, setValue: number) {
    this.completedTabsBitSet.set(tabNum, setValue);
    this.completedTabs = this.completedTabsBitSet.cardinality();
  }

  /** <--BitSets **/

  /** Modals--> **/
  showCommentModal(formData: any) {
    if (this.editMode && !this.pendingResource) {
      this.formDataToSubmit = formData;
      UIkit.modal('#commentModal').show();
    } else {
      this.submitForm(formData,false,false);
    }
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
          this.vocabularyEntryForm.get('errorMessage').setValue(error.error.message);
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

  cleanArrayProperty(obj: any, property: string): void {
    if (obj && Array.isArray(obj[property])) {
      // Filter out elements that are entirely empty:
      const cleaned = obj[property].filter((element: any) => {
        if (element && typeof element === 'object') {
          // Keep the element if at least one property has a non-empty value.
          return Object.keys(element).some(key => element[key] !== null && element[key] !== '');
        }
        // For non-objects, keep the element if it's not null or ''.
        return element !== null && element !== '';
      });
      // If the cleaned array is empty, set the property to null. Otherwise, update it.
      obj[property] = cleaned.length ? cleaned : null;
    }
  }

  protected readonly environment = environment;
  protected readonly isDevMode = isDevMode;
}
