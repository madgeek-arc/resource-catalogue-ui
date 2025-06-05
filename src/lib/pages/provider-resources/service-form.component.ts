import {UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {Component, Injector, isDevMode, OnInit, ViewChild} from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {NavigationService} from '../../services/navigation.service';
import {ResourceService} from '../../services/resource.service';
import * as dm from '../../shared/description.map';
import {Provider, RichService, Service, Type, Vocabulary} from '../../domain/eic-model';
import {Paging} from '../../domain/paging';
import {URLValidator} from '../../shared/validators/generic.validator';
import {Observable, of, zip} from 'rxjs';
import {PremiumSortPipe} from '../../shared/pipes/premium-sort.pipe';
import {environment} from '../../../environments/environment';
import BitSet from 'bitset';
import {ActivatedRoute} from '@angular/router';
import {ServiceProviderService} from '../../services/service-provider.service';
import {RecommendationsService} from "../../services/recommendations.service";
import {CatalogueService} from "../../services/catalogue.service";
import {catchError, map, mergeMap, timestamp} from "rxjs/operators";
import {pidHandler} from "../../shared/pid-handler/pid-handler.service";
import {FormControlService} from "../../../dynamic-catalogue/services/form-control.service";
import {SurveyComponent} from "../../../dynamic-catalogue/pages/dynamic-form/survey.component";
import {Model} from "../../../dynamic-catalogue/domain/dynamic-form-model";

declare var UIkit: any;

@Component({
  selector: 'app-service-form',
  templateUrl: './service-form.component.html',
  styleUrls: ['../provider/service-provider-form.component.css'],
  providers: [FormControlService]
})
export class ServiceFormComponent implements OnInit {
  @ViewChild(SurveyComponent) child: SurveyComponent
  model: Model = null;
  vocabulariesMap: Map<string, object[]> = null;
  subVocabulariesMap: Map<string, object[]> = null
  payloadAnswer: object = null;
  formDataToSubmit: any = null;

  protected _marketplaceServicesURL = environment.marketplaceServicesURL;
  serviceORresource = environment.serviceORresource;
  projectName = environment.projectName;
  projectMail = environment.projectMail;
  serviceName = '';
  firstServiceForm = false;
  showLoader = false;
  pendingService = false;
  catalogueId: string;
  providerId: string;
  displayedProviderName: string;
  displayedCatalogueName: string;
  editMode = false;
  hasChanges = false;
  serviceForm: UntypedFormGroup;
  provider: Provider;
  service: Service;
  serviceId: string = null;
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
  requiredOnTab5 = 4;
  requiredOnTab6 = 1;
  requiredOnTab9 = 2;
  requiredOnTab10 = 1;

  remainingOnTab0 = this.requiredOnTab0;
  remainingOnTab1 = this.requiredOnTab1;
  remainingOnTab2 = this.requiredOnTab2;
  remainingOnTab3 = this.requiredOnTab3;
  remainingOnTab5 = this.requiredOnTab5;
  remainingOnTab6 = this.requiredOnTab6;
  remainingOnTab9 = this.requiredOnTab9;
  remainingOnTab10 = this.requiredOnTab10;

  BitSetTab0 = new BitSet;
  BitSetTab1 = new BitSet;
  BitSetTab2 = new BitSet;
  BitSetTab3 = new BitSet;
  BitSetTab5 = new BitSet;
  BitSetTab6 = new BitSet;
  BitSetTab9 = new BitSet;
  BitSetTab10 = new BitSet;

  requiredTabs = 8;
  completedTabs = 0;
  completedTabsBitSet = new BitSet;

  allRequiredFields = 24;
  loaderBitSet = new BitSet;
  loaderPercentage = 0;

  vocabularyEntryForm: UntypedFormGroup;
  vocSuggestionsForm = {
    fundingBodyVocabularyEntryValueName: '',
    fundingProgramVocabularyEntryValueName: '',
    relatedPlatformsVocabularyEntryValueName: '',
    targetUsersVocabularyEntryValueName: '',
    accessTypesVocabularyEntryValueName: '',
    accessModesVocabularyEntryValueName: '',
    orderTypeVocabularyEntryValueName: '',
    phaseVocabularyEntryValueName: '',
    categoriesVocabularyEntryValueName: '',
    subCategoriesVocabularyEntryValueName: '',
    scientificDomainVocabularyEntryValueName: '',
    scientificSubDomainVocabularyEntryValueName: '',
    placesVocabularyEntryValueName: '',
    serviceCategoryVocabularyEntryValueName: '',
    geographicalVocabularyEntryValueName: '',
    languagesVocabularyEntryValueName: '',
    vocabulary: '',
    errorMessage: '',
    successMessage: ''
  };

  commentControl = new UntypedFormControl();

  noSuggestionsCall: boolean;
  suggestedResponse: any;
  emptySuggestionResponse: boolean;

  suggestedScientificSubDomains: string[] = [];
  suggestedSubCategories: string[] = [];
  suggestedTags: string[] = [];

  selectedSuggestionsForScientificSubDomains: string[] = [];
  selectedSuggestionsForSubCategories: string[] = [];
  selectedSuggestionsForTags: string[] = [];

  public filteredSubCategoriesVocabulary: Vocabulary[] = null;
  public filteredScientificSubDomainVocabulary: Vocabulary[] = null;

  readonly nameDesc: dm.Description = dm.serviceDescMap.get('nameDesc');
  readonly abbreviationDesc: dm.Description = dm.serviceDescMap.get('abbreviationDesc');
  readonly nodeDesc: dm.Description = dm.serviceDescMap.get('nodeDesc');
  readonly webpageDesc: dm.Description = dm.serviceDescMap.get('webpageDesc');
  readonly altIdTypeDesc: dm.Description = dm.serviceDescMap.get('altIdTypeDesc');
  readonly altIdValueDesc: dm.Description = dm.serviceDescMap.get('altIdValueDesc');
  readonly descriptionDesc: dm.Description = dm.serviceDescMap.get('descriptionDesc');
  readonly taglineDesc: dm.Description = dm.serviceDescMap.get('taglineDesc');
  readonly logoDesc: dm.Description = dm.serviceDescMap.get('logoDesc');
  readonly multimediaURLDesc: dm.Description = dm.serviceDescMap.get('multimediaURLDesc');
  readonly multimediaNameDesc: dm.Description = dm.serviceDescMap.get('multimediaNameDesc');
  readonly targetUsersDesc: dm.Description = dm.serviceDescMap.get('targetUsersDesc');
  readonly resourceProvidersDesc: dm.Description = dm.serviceDescMap.get('resourceProvidersDesc');
  readonly resourceOrganisationDesc: dm.Description = dm.serviceDescMap.get('resourceOrganisationDesc');
  readonly resourceGeographicLocationsDesc: dm.Description = dm.serviceDescMap.get('resourceGeographicLocationsDesc');
  readonly scientificDomainDesc: dm.Description = dm.serviceDescMap.get('scientificDomainDesc');
  readonly scientificSubDomainDesc: dm.Description = dm.serviceDescMap.get('scientificSubDomainDesc');
  readonly categoryDesc: dm.Description = dm.serviceDescMap.get('categoryDesc');
  readonly subcategoryDesc: dm.Description = dm.serviceDescMap.get('subcategoryDesc');
  readonly accessTypeDesc: dm.Description = dm.serviceDescMap.get('accessTypeDesc');
  readonly accessModeDesc: dm.Description = dm.serviceDescMap.get('accessModeDesc');
  readonly tagsDesc: dm.Description = dm.serviceDescMap.get('tagsDesc');
  readonly serviceCategoriesDesc: dm.Description = dm.serviceDescMap.get('serviceCategoriesDesc');
  readonly marketplaceLocationsDesc: dm.Description = dm.serviceDescMap.get('marketplaceLocationsDesc');
  readonly horizontalServiceDesc: dm.Description = dm.serviceDescMap.get('horizontalServiceDesc');
  readonly geographicalAvailabilityDesc: dm.Description = dm.serviceDescMap.get('geographicalAvailabilityDesc');
  readonly languageAvailabilitiesDesc: dm.Description = dm.serviceDescMap.get('languageAvailabilitiesDesc');
  readonly mainContactFirstNameDesc: dm.Description = dm.serviceDescMap.get('mainContactFirstNameDesc');
  readonly mainContactLastNameDesc: dm.Description = dm.serviceDescMap.get('mainContactLastNameDesc');
  readonly mainContactEmailDesc: dm.Description = dm.serviceDescMap.get('mainContactEmailDesc');
  readonly mainContactPhoneDesc: dm.Description = dm.serviceDescMap.get('mainContactPhoneDesc');
  readonly mainContactPositionDesc: dm.Description = dm.serviceDescMap.get('mainContactPositionDesc');
  readonly mainContactOrganisationDesc: dm.Description = dm.serviceDescMap.get('mainContactOrganisationDesc');
  readonly publicContactFirstNameDesc: dm.Description = dm.serviceDescMap.get('publicContactFirstNameDesc');
  readonly publicContactLastNameDesc: dm.Description = dm.serviceDescMap.get('publicContactLastNameDesc');
  readonly publicContactEmailDesc: dm.Description = dm.serviceDescMap.get('publicContactEmailDesc');
  readonly publicContactPhoneDesc: dm.Description = dm.serviceDescMap.get('publicContactPhoneDesc');
  readonly publicContactPositionDesc: dm.Description = dm.serviceDescMap.get('publicContactPositionDesc');
  readonly publicContactOrganisationDesc: dm.Description = dm.serviceDescMap.get('publicContactOrganisationDesc');
  readonly helpdeskEmailDesc: dm.Description = dm.serviceDescMap.get('helpdeskEmailDesc');
  readonly securityContactEmailDesc: dm.Description = dm.serviceDescMap.get('securityContactEmailDesc');
  readonly phaseDesc: dm.Description = dm.serviceDescMap.get('phaseDesc');
  readonly technologyReadinessLevelDesc: dm.Description = dm.serviceDescMap.get('technologyReadinessLevelDesc');
  readonly certificationsDesc: dm.Description = dm.serviceDescMap.get('certificationsDesc');
  readonly standardsDesc: dm.Description = dm.serviceDescMap.get('standardsDesc');
  readonly openSourceTechnologiesDesc: dm.Description = dm.serviceDescMap.get('openSourceTechnologiesDesc');
  readonly versionDesc: dm.Description = dm.serviceDescMap.get('versionDesc');
  readonly lastUpdateDesc: dm.Description = dm.serviceDescMap.get('lastUpdateDesc');
  readonly changeLogDesc: dm.Description = dm.serviceDescMap.get('changeLogDesc');
  readonly requiredServicesDesc: dm.Description = dm.serviceDescMap.get('requiredServicesDesc');
  readonly relatedServicesDesc: dm.Description = dm.serviceDescMap.get('relatedServicesDesc');
  readonly relatedPlatformsDesc: dm.Description = dm.serviceDescMap.get('relatedPlatformsDesc');
  readonly resourceCatalogueIdDesc: dm.Description = dm.serviceDescMap.get('resourceCatalogueIdDesc');
  readonly fundingBodyDesc: dm.Description = dm.serviceDescMap.get('fundingBodyDesc');
  readonly fundingProgramDesc: dm.Description = dm.serviceDescMap.get('fundingProgramDesc');
  readonly grantProjectNameDesc: dm.Description = dm.serviceDescMap.get('grantProjectNameDesc');
  readonly helpdeskPageDesc: dm.Description = dm.serviceDescMap.get('helpdeskPageDesc');
  readonly userManualDesc: dm.Description = dm.serviceDescMap.get('userManualDesc');
  readonly termsOfUseDesc: dm.Description = dm.serviceDescMap.get('termsOfUseDesc');
  readonly privacyPolicyDesc: dm.Description = dm.serviceDescMap.get('privacyPolicyDesc');
  readonly serviceLevelDesc: dm.Description = dm.serviceDescMap.get('serviceLevelDesc');
  readonly trainingInformationDesc: dm.Description = dm.serviceDescMap.get('trainingInformationDesc');
  readonly statusMonitoringDesc: dm.Description = dm.serviceDescMap.get('statusMonitoringDesc');
  readonly maintenanceDesc: dm.Description = dm.serviceDescMap.get('maintenanceDesc');
  readonly orderTypeDesc: dm.Description = dm.serviceDescMap.get('orderTypeDesc');
  readonly orderDesc: dm.Description = dm.serviceDescMap.get('orderDesc');
  readonly accessPolicyDesc: dm.Description = dm.serviceDescMap.get('accessPolicyDesc');
  readonly paymentModelDesc: dm.Description = dm.serviceDescMap.get('paymentModelDesc');
  readonly pricingDesc: dm.Description = dm.serviceDescMap.get('pricingDesc');
  readonly useCaseURLDesc: dm.Description = dm.serviceDescMap.get('useCaseURLDesc');
  readonly useCaseNameDesc: dm.Description = dm.serviceDescMap.get('useCaseNameDesc');


  formGroupMeta = {
    id: [''],
    name: ['', Validators.required],
    abbreviation: ['', Validators.required],
    node: [''],
    webpage: ['', Validators.compose([Validators.required, URLValidator])],
    alternativeIdentifiers: this.fb.array([
      this.fb.group({
        type: [''],
        value: ['']
      })
    ]),
    description: ['', Validators.required],
    logo: ['', Validators.compose([Validators.required, URLValidator])],
    tagline: ['', Validators.required],
    multimedia: this.fb.array([
      this.fb.group({
        multimediaURL: ['', Validators.compose([Validators.required, URLValidator])],
        multimediaName: ['']
      })
    ]),
    useCases: this.fb.array([
      this.fb.group({
        useCaseURL: ['', Validators.compose([Validators.required, URLValidator])],
        useCaseName: ['']
      })
    ]),
    requiredResources: this.fb.array([this.fb.control('')]),
    relatedResources: this.fb.array([this.fb.control('')]),
    relatedPlatforms: this.fb.array([this.fb.control('')]),
    catalogueId: [''],
    resourceOrganisation: ['', Validators.required],
    resourceProviders: this.fb.array([this.fb.control('')]),
    resourceGeographicLocations: this.fb.array([this.fb.control('')]),
    targetUsers: this.fb.array([this.fb.control('', Validators.required)], Validators.required),
    languageAvailabilities: this.fb.array([this.fb.control('', Validators.required)], Validators.required),
    geographicalAvailabilities: this.fb.array([this.fb.control('', Validators.required)], Validators.required),
    accessTypes: this.fb.array([this.fb.control('')]),
    accessModes: this.fb.array([this.fb.control('')]),
    fundingBody: this.fb.array([this.fb.control('')]),
    fundingPrograms: this.fb.array([this.fb.control('')]),
    grantProjectNames: this.fb.array([this.fb.control('')]),
    tags: this.fb.array([this.fb.control('')]),
    serviceCategories: this.fb.array([this.fb.control('')]),
    marketplaceLocations: this.fb.array([this.fb.control('')]),
    horizontalService: [''],
    lifeCycleStatus: [''],
    trl: ['', Validators.required],
    version: [''],
    lastUpdate: [''],
    changeLog: this.fb.array([this.fb.control('')]),
    certifications: this.fb.array([this.fb.control('')]),
    standards: this.fb.array([this.fb.control('')]),
    openSourceTechnologies: this.fb.array([this.fb.control('')]),
    orderType: ['', Validators.required],
    order: ['', URLValidator],
    helpdeskEmail: ['', Validators.compose([Validators.required, Validators.email])],
    securityContactEmail: ['', Validators.compose([Validators.required, Validators.email])],
    serviceLevel: ['', URLValidator],
    termsOfUse: ['', Validators.compose([Validators.required, URLValidator])],
    privacyPolicy: ['', Validators.compose([Validators.required, URLValidator])],
    accessPolicy: ['', URLValidator],
    paymentModel: ['', URLValidator],
    pricing: ['', URLValidator],
    userManual: ['', URLValidator],
    trainingInformation: ['', URLValidator],
    helpdeskPage: ['', URLValidator],
    statusMonitoring: ['', URLValidator],
    maintenance: ['', URLValidator],
    mainContact: this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      phone: ['', Validators.pattern('^(((\\+)|(00))\\d{1,3}( )?)?((\\(\\d{3}\\))|\\d{3})[- .]?\\d{3}[- .]?\\d{4}$')],
      position: [''],
      organisation: ['']
    }, Validators.required),
    publicContacts: this.fb.array([
      this.fb.group({
        firstName: [''],
        lastName: [''],
        email: ['', Validators.compose([Validators.required, Validators.email])],
        phone: ['', Validators.pattern('^(((\\+)|(00))\\d{1,3}( )?)?((\\(\\d{3}\\))|\\d{3})[- .]?\\d{3}[- .]?\\d{4}$')],
        position: [''],
        organisation: ['']
      })
    ]),

    categories: this.fb.array([], Validators.required),
    scientificDomains: this.fb.array([], Validators.required)
  };

  providersPage: Paging<Provider>;
  requiredResources: any;
  providersAsVocs: any;
  resourcesAsVocs: any;
  territoriesVoc: any;
  vocabularies: Map<string, Vocabulary[]> = null;
  subVocabularies: Map<string, Vocabulary[]> = null;
  premiumSort = new PremiumSortPipe();
  resourceService: ResourceService = this.injector.get(ResourceService);

  navigator: NavigationService = this.injector.get(NavigationService);

  public fundingBodyVocabulary: Vocabulary[] = null;
  public fundingProgramVocabulary: Vocabulary[] = null;
  public relatedPlatformsVocabulary: Vocabulary[] = null;
  public targetUsersVocabulary: Vocabulary[] = null;
  public accessTypesVocabulary: Vocabulary[] = null;
  public accessModesVocabulary: Vocabulary[] = null;
  public orderTypeVocabulary: Vocabulary[] = null;
  public phaseVocabulary: Vocabulary[] = null;
  public trlVocabulary: Vocabulary[] = null;
  public serviceCategoryVocabulary: Vocabulary[] = null;
  public marketplaceLocationVocabulary: Vocabulary[] = null;
  public superCategoriesVocabulary: Vocabulary[] = null;
  public categoriesVocabulary: Vocabulary[] = null;
  public subCategoriesVocabulary: Vocabulary[] = null;
  public scientificDomainVocabulary: Vocabulary[] = null;
  public scientificSubDomainVocabulary: Vocabulary[] = null;
  public placesVocabulary: Vocabulary[] = [];
  public geographicalVocabulary: Vocabulary[] = null;
  public languagesVocabulary: Vocabulary[] = null;
  public nodeVocabulary: Vocabulary[] = null;

  constructor(protected injector: Injector,
              protected authenticationService: AuthenticationService,
              protected serviceProviderService: ServiceProviderService,
              protected recommendationsService: RecommendationsService,
              protected catalogueService: CatalogueService,
              protected route: ActivatedRoute,
              public pidHandler: pidHandler,
              public dynamicFormService: FormControlService) {
    this.resourceService = this.injector.get(ResourceService);
    this.fb = this.injector.get(UntypedFormBuilder);
    this.navigator = this.injector.get(NavigationService);
    this.serviceForm = this.fb.group(this.formGroupMeta);
    this.weights[0] = this.authenticationService.user.email.split('@')[0];
  }

  submitForm(value: any, tempSave: boolean) {
    let serviceValue = value[0].value.Service;
    window.scrollTo(0, 0);

    if (!this.authenticationService.isLoggedIn()) {
      sessionStorage.setItem('service', JSON.stringify(this.serviceForm.value));
      this.authenticationService.login();
    }

    this.errorMessage = '';
    this.showLoader = true;

    // this.errorMessage = '';
    // // this.trimFormWhiteSpaces();
    // const path = this.route.snapshot.routeConfig.path;
    // let method;
    // if (path === 'add/:catalogueId') {
    //   method = 'updateAndPublishPendingProvider';
    // } else {
    //   method = this.edit ? 'updateCatalogue' : 'createNewCatalogue';
    // }

    this.cleanArrayProperty(serviceValue, 'multimedia');
    this.cleanArrayProperty(serviceValue, 'useCases');
    this.cleanArrayProperty(serviceValue, 'alternativeIdentifiers');
    this.cleanArrayProperty(serviceValue, 'scientificDomains');
    this.cleanArrayProperty(serviceValue, 'categories');

    if (tempSave) {//TODO
      this.resourceService.temporarySaveService(this.serviceForm.value).subscribe(
        _service => {
          // console.log(_service);
          this.showLoader = false;
          console.log(this.providerId)
          // return this.navigator.dashboardDraftResources(this.providerId); // navigate to draft list
          return this.navigator.go('/provider/' + this.pidHandler.customEncodeURIComponent(_service.resourceOrganisation) + '/draft-resource/update/' + this.pidHandler.customEncodeURIComponent(_service.id)); // remain on form
        },
        err => {
          this.showLoader = false;
          window.scrollTo(0, 0);
          this.categoryArray.enable();
          this.scientificDomainArray.enable();
          this.errorMessage = 'Something went bad, server responded: ' + JSON.stringify(err.error);
        }
      );
    } else {
      this.resourceService.submitService(serviceValue, this.editMode, this.commentControl.value).subscribe(
        _service => {
          // console.log(_service);
          this.showLoader = false;
          if (this.pendingService && !this.firstServiceForm) return this.navigator.selectSubprofile(this.providerId, _service.id);  // navigate to select-subprofile
          if (this.editMode || this.firstServiceForm) return this.navigator.resourceDashboard(this.providerId, _service.id);  // navigate to resource-dashboard
          if (!this.editMode) return this.navigator.selectSubprofile(this.providerId, _service.id);  // navigate to select-subprofile
          // return this.router.dashboardResources(this.providerId);                  // navigate to provider dashboard -> resource list
          // return this.router.dashboard(this.providerId);                          // navigate to provider dashboard
          // return this.router.service(_service.id);                               // navigate to old service info page
          // return window.location.href = this._marketplaceServicesURL + _service.id; // navigate to marketplace
        },
        err => {
          this.showLoader = false;
          window.scrollTo(0, 0);
          this.categoryArray.enable();
          this.scientificDomainArray.enable();
          this.errorMessage = 'Something went bad, server responded: ' + err?.error?.message;
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
    for (let i = 0; i < this.alternativeIdentifiersArray.length; i++) { //TODO: review the necessity of this
      if (this.alternativeIdentifiersArray.controls[i].get('value').value === ''
        || this.alternativeIdentifiersArray.controls[i].get('value').value === null) {
        this.removeAlternativeIdentifier(i);
      }
    }
    for (let i = 0; i < this.multimediaArray.length; i++) {
      if (this.multimediaArray.controls[i].get('multimediaURL').value === ''
        || this.multimediaArray.controls[i].get('multimediaURL').value === null) {
        this.removeMultimedia(i);
      }
    }
    for (let i = 0; i < this.useCasesArray.length; i++) {
      if (this.useCasesArray.controls[i].get('useCaseURL').value === ''
        || this.useCasesArray.controls[i].get('useCaseURL').value === null) {
        this.removeUseCase(i);
      }
    }
    // console.log('this.serviceForm.valid ', this.serviceForm.valid);
    // console.log('Submitted service --> ', service);
    // console.log('Submitted service value--> ', this.serviceForm.value);
    if (tempSave) {
      this.resourceService.temporarySaveService(this.serviceForm.value).subscribe(
        _service => {
          // console.log(_service);
          this.showLoader = false;
          console.log(this.providerId)
          // return this.navigator.dashboardDraftResources(this.providerId); // navigate to draft list
          return this.navigator.go('/provider/' + this.pidHandler.customEncodeURIComponent(_service.resourceOrganisation) + '/draft-resource/update/' + this.pidHandler.customEncodeURIComponent(_service.id)); // remain on form
        },
        err => {
          this.showLoader = false;
          window.scrollTo(0, 0);
          this.categoryArray.enable();
          this.scientificDomainArray.enable();
          this.errorMessage = 'Something went bad, server responded: ' + JSON.stringify(err.error);
        }
      );
    } else if (this.serviceForm.valid) {
      window.scrollTo(0, 0);
      this.resourceService[pendingService ? 'submitPendingService' : 'submitService']
      (this.serviceForm.value, this.editMode, this.commentControl.value).subscribe(
        _service => {
          // console.log(_service);
          this.showLoader = false;
          if (this.pendingService && !this.firstServiceForm) return this.navigator.selectSubprofile(this.providerId, _service.id);  // navigate to select-subprofile
          if (this.editMode || this.firstServiceForm) return this.navigator.resourceDashboard(this.providerId, _service.id);  // navigate to resource-dashboard
          if (!this.editMode) return this.navigator.selectSubprofile(this.providerId, _service.id);  // navigate to select-subprofile
          // return this.router.dashboardResources(this.providerId);                  // navigate to provider dashboard -> resource list
          // return this.router.dashboard(this.providerId);                          // navigate to provider dashboard
          // return this.router.service(_service.id);                               // navigate to old service info page
          // return window.location.href = this._marketplaceServicesURL + _service.id; // navigate to marketplace
        },
        err => {
          this.showLoader = false;
          window.scrollTo(0, 0);
          this.categoryArray.enable();
          this.scientificDomainArray.enable();
          this.errorMessage = 'Something went bad, server responded: ' + JSON.stringify(err.error);
        }
      );
    } else {
      window.scrollTo(0, 0);
      this.showLoader = false;

      this.categoryArray.enable();
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
      this.resourceService.getProvidersNames('approved'),
      this.resourceService.getAllVocabulariesByType(),
      this.resourceService.getProvidersAsVocs(this.catalogueId ? this.catalogueId : 'eosc'),
      this.resourceService.getResourcesAsVocs(this.catalogueId ? this.catalogueId : 'eosc'),
      this.resourceService.getTerritories(),
      this.serviceProviderService.getFormModelById('m-b-service')
    ).subscribe(suc => {
        this.providersPage = <Paging<Provider>>suc[0];
        this.vocabularies = <Map<string, Vocabulary[]>>suc[1];
        this.vocabulariesMap = suc[1];
        this.providersAsVocs = suc[2];
        this.resourcesAsVocs = suc[3];
        this.territoriesVoc = suc[4]; //combined COUNTRY and REGION vocs
        this.model = suc[5];
        // this.getLocations();

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

      },
      error => {
        this.errorMessage = 'Something went bad while getting the data for page initialization. ' + JSON.stringify(error.error.message);
      },
      () => {
        this.premiumSort.transform(this.geographicalVocabulary, ['Europe', 'Worldwide']);
        this.premiumSort.transform(this.languagesVocabulary, ['English']);
        this.premiumSort.transform(this.serviceCategoryVocabulary, ['Compute', 'Data Source', 'Storage']);
        this.providersPage.results.sort((a, b) => 0 - (a.name > b.name ? -1 : 1));

        let voc: Vocabulary[] = this.vocabularies[Type.SUBCATEGORY].concat(this.vocabularies[Type.SCIENTIFIC_SUBDOMAIN]);
        this.subVocabularies = this.groupByKey(voc, 'parentId');

        this.providerId = this.route.snapshot.paramMap.get('providerId');
        // if (this.editMode && this.projectName === 'EOSC' && !(this.route.snapshot.paramMap.get('resourceId').startsWith(this.providerId+'.'))) {
        //   return this.router.go('/404');
        // }

        this.showProviderName(decodeURIComponent(this.providerId));
        if(this.catalogueId == 'eosc') this.displayedCatalogueName = `| Catalogue: EOSC`
        else if(this.catalogueId) this.showCatalogueName(this.catalogueId);

        if(!this.editMode){ //prefill field(s)
          this.payloadAnswer = {'answer': { Service:
                { 'resourceOrganisation': decodeURIComponent(this.providerId),
                  'catalogueId': 'eosc'}
          }};
        }

        /*        if (!this.editMode) { // prefill main contact info
                  this.serviceProviderService.getServiceProviderById(this.providerId).subscribe(
                    res => { this.provider = res; },
                    err => { console.log(err); },
                    () => {
                      Object.entries(this.provider.mainContact).forEach(([key, val]) => {
                        if (val !== '' && val != null) {
                          this.serviceForm.controls['mainContact'].get(key).setValue(val);
                        }
                      });
                      // this.handleBitSetsOfGroups(5, 13, 'firstName', 'mainContact');
                      // this.handleBitSetsOfGroups(5, 14, 'lastName', 'mainContact');
                      // this.handleBitSetsOfGroups(5, 15, 'email', 'mainContact');
                    }
                  );
                }*/
        this.showLoader = false;
      }
    );

    this.isPortalAdmin = this.authenticationService.isAdmin();

    this.vocabularyEntryForm = this.fb.group(this.vocSuggestionsForm);

    this.pushCategory();
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
              } else if (i === 'categories') {
                this.categoryArray.push(this.newCategory());
                // } else if (i === 'options') {
                //   this.pushOption();
                //TODO: add multimedia and use cases
              } else if (i === 'providers' || i === 'targetUsers' || i === 'geographicalAvailabilities' || i === 'languageAvailabilities') {
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
    this.tabs[0] = (this.checkFormValidity('name', this.editMode)
      || this.checkFormValidity('abbreviation', this.editMode)
      || this.checkFormValidity('node', this.editMode)
      || this.checkEveryArrayFieldValidity('catalogueId', this.editMode)
      || this.checkFormValidity('resourceOrganisation', this.editMode)
      || this.checkEveryArrayFieldValidity('resourceProviders', this.editMode)
      || this.checkFormValidity('webpage', this.editMode));
    this.tabs[1] = (this.checkFormValidity('description', this.editMode)
      || this.checkFormValidity('tagline', this.editMode)
      || this.checkFormValidity('logo', this.editMode)
      || this.checkEveryArrayFieldValidity('multimedia', this.editMode, 'multimediaURL')
      || this.checkEveryArrayFieldValidity('multimedia', this.editMode, 'multimediaName')
      || this.checkEveryArrayFieldValidity('useCases', this.editMode, 'useCaseURL')
      || this.checkEveryArrayFieldValidity('useCases', this.editMode, 'useCaseName'));
    this.tabs[2] = (this.checkEveryArrayFieldValidity('scientificDomains', this.editMode, 'scientificDomain')
      || this.checkEveryArrayFieldValidity('scientificDomains', this.editMode, 'scientificSubdomain')
      || this.checkEveryArrayFieldValidity('categories', this.editMode, 'category')
      || this.checkEveryArrayFieldValidity('categories', this.editMode, 'subcategory')
      || this.checkEveryArrayFieldValidity('targetUsers', this.editMode)
      || this.checkEveryArrayFieldValidity('accessTypes', this.editMode)
      || this.checkEveryArrayFieldValidity('accessModes', this.editMode)
      || this.checkEveryArrayFieldValidity('tags', this.editMode));
    this.tabs[3] = (this.checkEveryArrayFieldValidity('geographicalAvailabilities', this.editMode)
      || this.checkEveryArrayFieldValidity('languageAvailabilities', this.editMode));
    this.tabs[4] = (this.checkEveryArrayFieldValidity('resourceGeographicLocations', this.editMode));
    this.tabs[5] = (this.checkFormValidity('mainContact.firstName', this.editMode)
      || this.checkFormValidity('mainContact.lastName', this.editMode)
      || this.checkFormValidity('mainContact.email', this.editMode)
      || this.checkFormValidity('mainContact.phone', this.editMode)
      || this.checkFormValidity('mainContact.position', this.editMode)
      || this.checkFormValidity('mainContact.organisation', this.editMode)
      || this.checkEveryArrayFieldValidity('publicContacts', this.editMode, 'firstName')
      || this.checkEveryArrayFieldValidity('publicContacts', this.editMode, 'lastName')
      || this.checkEveryArrayFieldValidity('publicContacts', this.editMode, 'email')
      || this.checkEveryArrayFieldValidity('publicContacts', this.editMode, 'phone')
      || this.checkEveryArrayFieldValidity('publicContacts', this.editMode, 'position')
      || this.checkEveryArrayFieldValidity('publicContacts', this.editMode, 'organisation')
      || this.checkFormValidity('helpdeskEmail', this.editMode)
      || this.checkFormValidity('securityContactEmail', this.editMode));
    this.tabs[6] = (this.checkFormValidity('trl', this.editMode)
      || this.checkFormValidity('lifeCycleStatus', this.editMode)
      || this.checkEveryArrayFieldValidity('certifications', this.editMode)
      || this.checkEveryArrayFieldValidity('standards', this.editMode)
      || this.checkEveryArrayFieldValidity('openSourceTechnologies', this.editMode)
      || this.checkFormValidity('version', this.editMode)
      || this.checkFormValidity('lastUpdate', this.editMode)
      || this.checkEveryArrayFieldValidity('changeLog', this.editMode));
    this.tabs[7] = (this.checkEveryArrayFieldValidity('requiredResources', this.editMode)
      || this.checkEveryArrayFieldValidity('relatedResources', this.editMode)
      || this.checkEveryArrayFieldValidity('relatedPlatforms', this.editMode));
    this.tabs[8] = (this.checkEveryArrayFieldValidity('fundingBody', this.editMode)
      || this.checkEveryArrayFieldValidity('fundingPrograms', this.editMode)
      || this.checkEveryArrayFieldValidity('grantProjectNames', this.editMode));
    this.tabs[9] = (this.checkFormValidity('helpdeskPage', this.editMode)
      || this.checkFormValidity('userManual', this.editMode)
      || this.checkFormValidity('termsOfUse', this.editMode)
      || this.checkFormValidity('privacyPolicy', this.editMode)
      || this.checkFormValidity('accessPolicy', this.editMode)
      || this.checkFormValidity('serviceLevel', this.editMode)
      || this.checkFormValidity('trainingInformation', this.editMode)
      || this.checkFormValidity('statusMonitoring', this.editMode)
      || this.checkFormValidity('maintenance', this.editMode));
    this.tabs[10] = (this.checkFormValidity('orderType', this.editMode)
      || this.checkFormValidity('order', this.editMode));
    this.tabs[11] = (this.checkFormValidity('paymentModel', this.editMode)
      || this.checkFormValidity('pricing', this.editMode));

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

  /** Categorization & Scientific Domain--> **/

  newCategory(): UntypedFormGroup {
    return this.fb.group({
      // supercategory: ['', Validators.required],
      category: ['', Validators.required],
      subcategory: ['', Validators.required]
    });
  }

  get categoryArray() {
    return this.serviceForm.get('categories') as UntypedFormArray;
  }

  pushCategory() {
    this.categoryArray.push(this.newCategory());
    // this.categoryArray.controls[this.categoryArray.length - 1].get('category').disable();
    this.categoryArray.controls[this.categoryArray.length - 1].get('subcategory').disable();
  }

  removeCategory(index: number) {
    this.categoryArray.removeAt(index);
  }

  onCategoryChange(index: number) {
    this.categoryArray.controls[index].get('subcategory').reset();
    this.categoryArray.controls[index].get('subcategory').enable();
  }

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

  /** <-- Categorization & Scientific Domain**/

  /** Multimedia -->**/
  newMultimedia(): UntypedFormGroup {
    return this.fb.group({
      multimediaURL: ['', Validators.compose([Validators.required, URLValidator])],
      multimediaName: ['']
    });
  }

  get multimediaArray() {
    return this.serviceForm.get('multimedia') as UntypedFormArray;
  }

  pushMultimedia() {
    this.multimediaArray.push(this.newMultimedia());
  }

  removeMultimedia(index: number) {
    this.multimediaArray.removeAt(index);
  }
  /** <--Multimedia**/

  /** Use Cases-->**/
  newUseCase(): UntypedFormGroup {
    return this.fb.group({
      useCaseURL: ['', Validators.compose([Validators.required, URLValidator])],
      useCaseName: ['']
    });
  }

  get useCasesArray() {
    return this.serviceForm.get('useCases') as UntypedFormArray;
  }

  pushUseCase() {
    this.useCasesArray.push(this.newUseCase());
  }

  removeUseCase(index: number) {
    this.useCasesArray.removeAt(index);
  }

  /** <--Use Cases**/

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

  /** Service Contact Info -->**/

  newContact(): UntypedFormGroup {
    return this.fb.group({
      firstName: [''],
      lastName: [''],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      phone: ['', Validators.pattern('^(((\\+)|(00))\\d{1,3}( )?)?((\\(\\d{3}\\))|\\d{3})[- .]?\\d{3}[- .]?\\d{4}$')],
      position: [''],
      organisation: ['']
    });
  }

  get publicContactArray() {
    return this.serviceForm.get('publicContacts') as UntypedFormArray;
  }

  pushPublicContact() {
    this.publicContactArray.push(this.newContact());
  }

  removePublicContact(index: number) {
    this.publicContactArray.removeAt(index);
  }

  /** <--Service Contact Info **/

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

  formPrepare(service: Service) {

    this.removeCategory(0);
    if (service.categories) {
      for (let i = 0; i < service.categories.length; i++) {
        this.categoryArray.push(this.newCategory());
        this.categoryArray.controls[this.categoryArray.length - 1].get('category').setValue(service.categories[i].category);
        this.categoryArray.controls[this.categoryArray.length - 1].get('subcategory').setValue(service.categories[i].subcategory);
      }
    } else {
      this.categoryArray.push(this.newCategory());
    }

    this.removeScientificDomain(0);
    if (service.scientificDomains) {
      for (let i = 0; i < service.scientificDomains.length; i++) {
        this.scientificDomainArray.push(this.newScientificDomain());
        this.scientificDomainArray.controls[this.scientificDomainArray.length - 1]
          .get('scientificDomain').setValue(service.scientificDomains[i].scientificDomain);
        this.scientificDomainArray.controls[this.scientificDomainArray.length - 1]
          .get('scientificSubdomain').setValue(service.scientificDomains[i].scientificSubdomain);
      }
    } else {
      this.scientificDomainArray.push(this.newScientificDomain());
    }

    if (service.resourceProviders) {
      for (let i = 0; i < service.resourceProviders.length - 1; i++) {
        this.push('resourceProviders', true);
      }
    }
    /*if (service.multimedia) {
      for (let i = 0; i < service.multimedia.length - 1; i++) {
        this.pushMultimedia();
      }
    }
    if (service.useCases) {
      for (let i = 0; i < service.useCases.length - 1; i++) {
        this.pushUseCase();
      }
    }
    if (service.alternativeIdentifiers) {
      for (let i = 0; i < service.alternativeIdentifiers.length - 1; i++) {
        this.pushAlternativeIdentifier();
      }
    }
    if (service.targetUsers) {
      for (let i = 0; i < service.targetUsers.length - 1; i++) {
        this.push('targetUsers', true);
      }
    }
    if (service.accessTypes) {
      for (let i = 0; i < service.accessTypes.length - 1; i++) {
        this.push('accessTypes', false);
      }
    }
    if (service.accessModes) {
      for (let i = 0; i < service.accessModes.length - 1; i++) {
        this.push('accessModes', false);
      }
    }
    if (service.tags) {
      for (let i = 0; i < service.tags.length - 1; i++) {
        this.push('tags', false);
      }
    }
    if (service.serviceCategories) {
      for (let i = 0; i < service.serviceCategories.length - 1; i++) {
        this.push('serviceCategories', true);
      }
    }
    if (service.marketplaceLocations) {
      for (let i = 0; i < service.marketplaceLocations.length - 1; i++) {
        this.push('marketplaceLocations', true);
      }
    }
    if (service.geographicalAvailabilities) {
      for (let i = 0; i < service.geographicalAvailabilities.length - 1; i++) {
        this.push('geographicalAvailabilities', true);
      }
    }
    if (service.languageAvailabilities) {
      for (let i = 0; i < service.languageAvailabilities.length - 1; i++) {
        this.push('languageAvailabilities', true);
      }
    }
    if (service.resourceGeographicLocations) {
      for (let i = 0; i < service.resourceGeographicLocations.length - 1; i++) {
        this.push('resourceGeographicLocations', true);
      }
    }
    if (service.publicContacts) {
      for (let i = 0; i < service.publicContacts.length - 1; i++) {
        this.pushPublicContact();
      }
    }
    if (service.certifications) {
      for (let i = 0; i < service.certifications.length - 1; i++) {
        this.push('certifications', false);
      }
    }
    if (service.standards) {
      for (let i = 0; i < service.standards.length - 1; i++) {
        this.push('standards', false);
      }
    }
    if (service.openSourceTechnologies) {
      for (let i = 0; i < service.openSourceTechnologies.length - 1; i++) {
        this.push('openSourceTechnologies', false);
      }
    }
    if (service.changeLog) {
      for (let i = 0; i < service.changeLog.length - 1; i++) {
        this.push('changeLog', false);
      }
    }
    if (service.requiredResources) {
      for (let i = 0; i < service.requiredResources.length - 1; i++) {
        this.push('requiredResources', false);
      }
    }
    if (service.relatedResources) {
      for (let i = 0; i < service.relatedResources.length - 1; i++) {
        this.push('relatedResources', false);
      }
    }
    if (service.relatedPlatforms) {
      for (let i = 0; i < service.relatedPlatforms.length - 1; i++) {
        this.push('relatedPlatforms', false);
      }
    }
    if (service.fundingBody) {
      for (let i = 0; i < service.fundingBody.length - 1; i++) {
        this.push('fundingBody', false);
      }
    }
    if (service.fundingPrograms) {
      for (let i = 0; i < service.fundingPrograms.length - 1; i++) {
        this.push('fundingPrograms', false);
      }
    }
    if (service.grantProjectNames) {
      for (let i = 0; i < service.grantProjectNames.length - 1; i++) {
        this.push('grantProjectNames', false);
      }
    }*/
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
    } else if (group === 'categories') {
      for (let i = 0; i < this.categoryArray.controls.length; i++) {
        for (let j = 0; j <  this.categoryArray.controls.length; j++) {
          if (i !== j && this.categoryArray.controls[i].get('category').value === this.categoryArray.controls[j].get('category').value ) {
            if (this.categoryArray.controls[i].get('subcategory').value === this.categoryArray.controls[j].get('subcategory').value) {
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
  /** maybe timeout can be removed with subject **/
  /*handleBitSets(tabNum: number, bitIndex: number, formControlName: string): void {
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
    } else if (group === 'categories') {
      for (const category in this.categoryArray.controls) {
        if (this.categoryArray.controls[category].get('subcategory').value) {
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

  handleBitSetsOfPublicContact(tabNum: number, bitIndex: number, formControlName: string, group?: string): void {
    if (this.publicContactArray.value[0][formControlName] !== '' && this.serviceForm.controls[group].valid) {
      this.decreaseRemainingFieldsPerTab(tabNum, bitIndex);
      this.loaderBitSet.set(bitIndex, 1);
    } else {
      this.increaseRemainingFieldsPerTab(tabNum, bitIndex);
      this.loaderBitSet.set(bitIndex, 0);
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
    } else if (tabNum === 2) {  // Classification
      this.BitSetTab2.set(bitIndex, 1);
      this.remainingOnTab2 = this.requiredOnTab2 - this.BitSetTab2.get(7) - this.BitSetTab2.get(9) - this.BitSetTab2.get(10) - this.BitSetTab2.get(24) - this.BitSetTab2.get(25);
      if (this.remainingOnTab2 === 0 && this.completedTabsBitSet.get(tabNum) !== 1) {
        this.calcCompletedTabs(tabNum, 1);
      }
    } else if (tabNum === 3) {
      this.BitSetTab3.set(bitIndex, 1);
      this.remainingOnTab3 = this.requiredOnTab3 - this.BitSetTab3.cardinality();
      if (this.remainingOnTab3 === 0 && this.completedTabsBitSet.get(tabNum) !== 1) {
        this.calcCompletedTabs(tabNum, 1);
      }
    } else if (tabNum === 5) { // Contact
      this.BitSetTab5.set(bitIndex, 1);
      const mainContactCardinality = this.BitSetTab5.slice(13, 15).cardinality();
      this.remainingOnTab5 = this.requiredOnTab5 - +(mainContactCardinality === 3) - this.BitSetTab5.get(16) - this.BitSetTab5.get(17) - this.BitSetTab5.get(20);
      if (this.remainingOnTab5 === 0 && this.completedTabsBitSet.get(tabNum) !== 1) {
        this.calcCompletedTabs(tabNum, 1);
      }
    } else if (tabNum === 6) {
      this.BitSetTab6.set(bitIndex, 1);
      this.remainingOnTab6 = this.requiredOnTab6 - this.BitSetTab6.cardinality();
      if (this.remainingOnTab6 === 0 && this.completedTabsBitSet.get(tabNum) !== 1) {
        this.calcCompletedTabs(tabNum, 1);
      }
    } else if (tabNum === 9) {
      this.BitSetTab9.set(bitIndex, 1);
      this.remainingOnTab9 = this.requiredOnTab9 - this.BitSetTab9.cardinality();
      if (this.remainingOnTab9 === 0 && this.completedTabsBitSet.get(tabNum) !== 1) {
        this.calcCompletedTabs(tabNum, 1);
      }
    } else if (tabNum === 10) {
      this.BitSetTab10.set(bitIndex, 1);
      this.remainingOnTab10 = this.requiredOnTab10 - this.BitSetTab10.cardinality();
      if (this.remainingOnTab10 === 0 && this.completedTabsBitSet.get(tabNum) !== 1) {
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
    } else if (tabNum === 2) {  // Classification
      this.BitSetTab2.set(bitIndex, 0);
      this.remainingOnTab2 = this.requiredOnTab2 - this.BitSetTab2.get(7) - this.BitSetTab2.get(9) - this.BitSetTab2.get(10) - this.BitSetTab2.get(24) - this.BitSetTab2.get(25);
      if (this.completedTabsBitSet.get(tabNum) !== 0) {
        this.calcCompletedTabs(tabNum, 0);
      }
    } else if (tabNum === 3) {
      this.BitSetTab3.set(bitIndex, 0);
      this.remainingOnTab3 = this.requiredOnTab3 - this.BitSetTab3.cardinality();
      if (this.completedTabsBitSet.get(tabNum) !== 0) {
        this.calcCompletedTabs(tabNum, 0);
      }
    } else if (tabNum === 5) { // Contact
      this.BitSetTab5.set(bitIndex, 0);
      const mainContactCardinality = this.BitSetTab5.slice(13, 15).cardinality();
      this.remainingOnTab5 = this.requiredOnTab5 - +(mainContactCardinality === 3) - this.BitSetTab5.get(16) - this.BitSetTab5.get(17) - this.BitSetTab5.get(20);
      if (this.completedTabsBitSet.get(tabNum) !== 0) {
        this.calcCompletedTabs(tabNum, 0);
      }
    } else if (tabNum === 6) {
      this.BitSetTab6.set(bitIndex, 0);
      this.remainingOnTab6 = this.requiredOnTab6 - this.BitSetTab6.cardinality();
      if (this.completedTabsBitSet.get(tabNum) !== 0) {
        this.calcCompletedTabs(tabNum, 0);
      }
    } else if (tabNum === 9) {
      this.BitSetTab9.set(bitIndex, 0);
      this.remainingOnTab9 = this.requiredOnTab9 - this.BitSetTab9.cardinality();
      if (this.completedTabsBitSet.get(tabNum) !== 0) {
        this.calcCompletedTabs(tabNum, 0);
      }
    } else if (tabNum === 10) {
      this.BitSetTab10.set(bitIndex, 0);
      this.remainingOnTab10 = this.requiredOnTab10 - this.BitSetTab10.cardinality();
      if (this.completedTabsBitSet.get(tabNum) !== 0) {
        this.calcCompletedTabs(tabNum, 0);
      }
    }
  }

  calcCompletedTabs(tabNum: number, setValue: number) {
    this.completedTabsBitSet.set(tabNum, setValue);
    this.completedTabs = this.completedTabsBitSet.cardinality();
  }
  */
  /** <--BitSets **/

  /** Modals--> **/
  showCommentModal(formData: any) {
    if (this.editMode && !this.pendingService) {
      this.formDataToSubmit = formData;
      UIkit.modal('#commentModal').show();
    } else {
      this.onSubmit(formData, false);
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

  showSuggestionsModal() {
    this.emptySuggestionResponse = false;
    UIkit.modal('#suggestionsModal').show();
    this.getSuggestions();
  }
  /** <--Modals **/

  submitVocSuggestion(entryValueName, vocabulary, parent) {
    if (entryValueName.trim() !== '') {
      this.serviceProviderService.submitVocabularyEntry(entryValueName, vocabulary, parent, 'service', this.providerId, this.serviceId).subscribe(
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

  /** Suggestions(Recommendations) Autocomplete--> **/
  getSuggestions(){
    if (!this.serviceForm.get('name').value && !this.serviceForm.get('description').value && !this.serviceForm.get('tagline').value) {
      this.noSuggestionsCall = true;
    } else {
      this.noSuggestionsCall = false;
      this.showLoader = true;
      this.recommendationsService.getAutocompletionSuggestions(this.serviceForm.get('description').value, this.serviceForm.get('tagline').value).subscribe(
        res => {
          this.suggestedResponse = res;
          this.suggestedScientificSubDomains = this.suggestedResponse.find(item => item.field_name === "scientific_domains").suggestions;
          this.suggestedSubCategories = this.suggestedResponse.find(item => item.field_name === "categories").suggestions;
          this.suggestedTags = this.suggestedResponse.find(item => item.field_name === "tags").suggestions;
          if((this.suggestedScientificSubDomains.length === 0) && (this.suggestedSubCategories.length === 0) && (this.suggestedTags.length === 0)) {this.emptySuggestionResponse = true}
          this.filteredScientificSubDomainVocabulary = this.scientificSubDomainVocabulary.filter((item) => this.suggestedScientificSubDomains.includes(item.id));
          this.filteredSubCategoriesVocabulary = this.subCategoriesVocabulary.filter((item) => this.suggestedSubCategories.includes(item.id));
        },
        error => {
          this.showLoader = false;
        },
        () => {
          this.clearSelectedSuggestions();
          this.showLoader = false;
        }
      );
    }
  }

  clearSelectedSuggestions(){
    this.selectedSuggestionsForScientificSubDomains = [];
    this.selectedSuggestionsForSubCategories= [];
    this.selectedSuggestionsForTags= [];
  }

  onCheckboxChange(event: any, field: string) {
    const id = event.target.value;

    if (event.target.checked) {
      if (field === 'ScientificSubDomains') {
        this.selectedSuggestionsForScientificSubDomains.push(id);
      } else if (field === 'SubCategories') {
        this.selectedSuggestionsForSubCategories.push(id);
      } else if (field === 'Tags') {
        this.selectedSuggestionsForTags.push(id);
      }
    } else {
      let index;

      if (field === 'ScientificSubDomains') {
        index = this.selectedSuggestionsForScientificSubDomains.indexOf(id);
        if (index !== -1) {
          this.selectedSuggestionsForScientificSubDomains.splice(index, 1);
        }
      } else if (field === 'SubCategories') {
        index = this.selectedSuggestionsForSubCategories.indexOf(id);
        if (index !== -1) {
          this.selectedSuggestionsForSubCategories.splice(index, 1);
        }
      } else if (field === 'Tags') {
        index = this.selectedSuggestionsForTags.indexOf(id);
        if (index !== -1) {
          this.selectedSuggestionsForTags.splice(index, 1);
        }
      }
    }
  }

  autocomplete() {
    let pushedNewValues = false;
    if (this.selectedSuggestionsForScientificSubDomains.length > 0) {
      if (!this.scientificDomainArray.controls[0].get('scientificDomain').value) {
        this.removeScientificDomain(0);
      }
      for (const scientificSubdomain of this.selectedSuggestionsForScientificSubDomains) {
        const scientificDomain = this.scientificSubDomainVocabulary.find((cat) => cat.id === scientificSubdomain)?.parentId;
        if (scientificDomain) {
          const scientificDomainFormGroup = this.newScientificDomain();
          scientificDomainFormGroup.get('scientificDomain').setValue(scientificDomain);
          scientificDomainFormGroup.get('scientificSubdomain').setValue(scientificSubdomain);
          this.scientificDomainArray.push(scientificDomainFormGroup);
          pushedNewValues = true;
        }
      }
    }
    if (this.selectedSuggestionsForSubCategories.length > 0) {
      if (!this.categoryArray.controls[0].get('category').value) {
        this.removeCategory(0);
      }
      for (const subcategory of this.selectedSuggestionsForSubCategories) {
        const category = this.subCategoriesVocabulary.find((cat) => cat.id === subcategory)?.parentId;
        if (category) {
          const categoryFormGroup = this.newCategory();
          categoryFormGroup.get('category').setValue(category);
          categoryFormGroup.get('subcategory').setValue(subcategory);
          this.categoryArray.push(categoryFormGroup);
          pushedNewValues = true;
        }
      }
    }
    if (this.selectedSuggestionsForTags.length > 0) {
      const tagsFormArray = this.serviceForm.get('tags') as UntypedFormArray;
      if (tagsFormArray.at(0).value === '' && tagsFormArray.length === 1) tagsFormArray.clear();
      for (const tag of this.selectedSuggestionsForTags) {
        tagsFormArray.push(this.fb.control(tag)); // this.push('tags', false);
        this.serviceForm.get('tags').setValue(tagsFormArray.value);
      }
    }
    if (pushedNewValues) {
      UIkit.notification({
        message: 'New values added successfully!',
        status: 'success',
        pos: 'top-center',
        timeout: 7000
      });
    }
    this.checkForDuplicatesAfterAutocomplete();
  }

  checkForDuplicatesAfterAutocomplete(){
    this.checkForDuplicates('scientificSubdomain','scientificDomains');
    this.checkForDuplicates('subcategory','categories');
  }
  /** <--Suggestions(Recommendations) Autocomplete **/

  /**Display Provider and Catalogue Names--> **/
  showProviderName(providerId: string) {
    const provider = this.providersPage.results.find(provider => provider.id === providerId);
    this.displayedProviderName = (provider.name ? `| Provider: ${provider.name} ` : '');
  }

  showCatalogueName(catalogueId: string) {
    if (catalogueId!='undefined' && catalogueId!=undefined){
    this.catalogueService.getCatalogueById(catalogueId).subscribe(
      catalogue => this.displayedCatalogueName = `| Catalogue: ${catalogue.name}`,
      error => console.log(error)
    );}
  }
  /** <--Display Provider and Catalogue Names **/

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
