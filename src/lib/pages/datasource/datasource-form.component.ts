import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Component, Injector, OnInit} from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {NavigationService} from '../../services/navigation.service';
import {ResourceService} from '../../services/resource.service';
import {DatasourceService} from "../../services/datasource.service";
import * as sd from '../provider-resources/services.description';
import {Provider, RichService, Service, Datasource, Type, Vocabulary} from '../../domain/eic-model';
import {Paging} from '../../domain/paging';
import {URLValidator} from '../../shared/validators/generic.validator';
import {zip} from 'rxjs';
import {PremiumSortPipe} from '../../shared/pipes/premium-sort.pipe';
import {environment} from '../../../environments/environment';
import BitSet from 'bitset';
import {ActivatedRoute} from '@angular/router';
import {ServiceProviderService} from '../../services/service-provider.service';

declare var UIkit: any;

@Component({
  selector: 'app-datasource-form',
  templateUrl: './datasource-form.component.html',
  // styleUrls: ['../provider/service-provider-form.component.css']
})
export class DatasourceFormComponent implements OnInit {
  protected _marketplaceDatasourcesURL = environment.marketplaceDatasourcesURL;
  serviceORresource = environment.serviceORresource;
  projectName = environment.projectName;
  projectMail = environment.projectMail;
  serviceName = '';
  firstServiceForm = false;
  showLoader = false;
  pendingService = false;
  addOpenAIRE = false; //on addOpenAIRE path
  draftFromOpenAIRE = false; //collected from addOpenAIRE and saved as draft
  catalogueId: string;
  providerId: string;
  editMode = false;
  hasChanges = false;
  serviceForm: FormGroup;
  provider: Provider;
  service: Service;
  serviceID: string = null;
  errorMessage = '';
  successMessage: string = null;
  weights: string[] = [];
  tabs: boolean[] = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false];
  fb: FormBuilder = this.injector.get(FormBuilder);
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
  requiredOnTab13 = 4;

  remainingOnTab0 = this.requiredOnTab0;
  remainingOnTab1 = this.requiredOnTab1;
  remainingOnTab2 = this.requiredOnTab2;
  remainingOnTab3 = this.requiredOnTab3;
  remainingOnTab5 = this.requiredOnTab5;
  remainingOnTab6 = this.requiredOnTab6;
  remainingOnTab9 = this.requiredOnTab9;
  remainingOnTab10 = this.requiredOnTab10;
  remainingOnTab13 = this.requiredOnTab13;

  BitSetTab0 = new BitSet;
  BitSetTab1 = new BitSet;
  BitSetTab2 = new BitSet;
  BitSetTab3 = new BitSet;
  BitSetTab5 = new BitSet;
  BitSetTab6 = new BitSet;
  BitSetTab9 = new BitSet;
  BitSetTab10 = new BitSet;
  BitSetTab13 = new BitSet;

  requiredTabs = 9;
  completedTabs = 0;
  completedTabsBitSet = new BitSet;

  allRequiredFields = 28;
  loaderBitSet = new BitSet;
  loaderPercentage = 0;

  vocabularyEntryForm: FormGroup;
  suggestionsForm = {
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
    geographicalVocabularyEntryValueName: '',
    languagesVocabularyEntryValueName: '',
    vocabulary: '',
    errorMessage: '',
    successMessage: ''
  };

  commentControl = new FormControl();

  readonly nameDesc: sd.Description = sd.serviceDescMap.get('nameDesc');
  readonly abbreviationDesc: sd.Description = sd.serviceDescMap.get('abbreviationDesc');
  readonly webpageDesc: sd.Description = sd.serviceDescMap.get('webpageDesc');
  readonly descriptionDesc: sd.Description = sd.serviceDescMap.get('descriptionDesc');
  readonly taglineDesc: sd.Description = sd.serviceDescMap.get('taglineDesc');
  readonly logoDesc: sd.Description = sd.serviceDescMap.get('logoDesc');
  readonly multimediaURLDesc: sd.Description = sd.serviceDescMap.get('multimediaURLDesc');
  readonly multimediaNameDesc: sd.Description = sd.serviceDescMap.get('multimediaNameDesc');
  readonly targetUsersDesc: sd.Description = sd.serviceDescMap.get('targetUsersDesc');
  readonly resourceProvidersDesc: sd.Description = sd.serviceDescMap.get('resourceProvidersDesc');
  readonly resourceOrganisationDesc: sd.Description = sd.serviceDescMap.get('resourceOrganisationDesc');
  readonly resourceGeographicLocationsDesc: sd.Description = sd.serviceDescMap.get('resourceGeographicLocationsDesc');
  readonly scientificDomainDesc: sd.Description = sd.serviceDescMap.get('scientificDomainDesc');
  readonly scientificSubDomainDesc: sd.Description = sd.serviceDescMap.get('scientificSubDomainDesc');
  readonly categoryDesc: sd.Description = sd.serviceDescMap.get('categoryDesc');
  readonly subcategoryDesc: sd.Description = sd.serviceDescMap.get('subcategoryDesc');
  readonly accessTypeDesc: sd.Description = sd.serviceDescMap.get('accessTypeDesc');
  readonly accessModeDesc: sd.Description = sd.serviceDescMap.get('accessModeDesc');
  readonly tagsDesc: sd.Description = sd.serviceDescMap.get('tagsDesc');
  readonly geographicalAvailabilityDesc: sd.Description = sd.serviceDescMap.get('geographicalAvailabilityDesc');
  readonly languageAvailabilitiesDesc: sd.Description = sd.serviceDescMap.get('languageAvailabilitiesDesc');
  readonly mainContactFirstNameDesc: sd.Description = sd.serviceDescMap.get('mainContactFirstNameDesc');
  readonly mainContactLastNameDesc: sd.Description = sd.serviceDescMap.get('mainContactLastNameDesc');
  readonly mainContactEmailDesc: sd.Description = sd.serviceDescMap.get('mainContactEmailDesc');
  readonly mainContactPhoneDesc: sd.Description = sd.serviceDescMap.get('mainContactPhoneDesc');
  readonly mainContactPositionDesc: sd.Description = sd.serviceDescMap.get('mainContactPositionDesc');
  readonly mainContactOrganisationDesc: sd.Description = sd.serviceDescMap.get('mainContactOrganisationDesc');
  readonly publicContactFirstNameDesc: sd.Description = sd.serviceDescMap.get('publicContactFirstNameDesc');
  readonly publicContactLastNameDesc: sd.Description = sd.serviceDescMap.get('publicContactLastNameDesc');
  readonly publicContactEmailDesc: sd.Description = sd.serviceDescMap.get('publicContactEmailDesc');
  readonly publicContactPhoneDesc: sd.Description = sd.serviceDescMap.get('publicContactPhoneDesc');
  readonly publicContactPositionDesc: sd.Description = sd.serviceDescMap.get('publicContactPositionDesc');
  readonly publicContactOrganisationDesc: sd.Description = sd.serviceDescMap.get('publicContactOrganisationDesc');
  readonly helpdeskEmailDesc: sd.Description = sd.serviceDescMap.get('helpdeskEmailDesc');
  readonly securityContactEmailDesc: sd.Description = sd.serviceDescMap.get('securityContactEmailDesc');
  readonly phaseDesc: sd.Description = sd.serviceDescMap.get('phaseDesc');
  readonly technologyReadinessLevelDesc: sd.Description = sd.serviceDescMap.get('technologyReadinessLevelDesc');
  readonly certificationsDesc: sd.Description = sd.serviceDescMap.get('certificationsDesc');
  readonly standardsDesc: sd.Description = sd.serviceDescMap.get('standardsDesc');
  readonly openSourceTechnologiesDesc: sd.Description = sd.serviceDescMap.get('openSourceTechnologiesDesc');
  readonly versionDesc: sd.Description = sd.serviceDescMap.get('versionDesc');
  readonly lastUpdateDesc: sd.Description = sd.serviceDescMap.get('lastUpdateDesc');
  readonly changeLogDesc: sd.Description = sd.serviceDescMap.get('changeLogDesc');
  readonly requiredServicesDesc: sd.Description = sd.serviceDescMap.get('requiredServicesDesc');
  readonly relatedServicesDesc: sd.Description = sd.serviceDescMap.get('relatedServicesDesc');
  readonly relatedPlatformsDesc: sd.Description = sd.serviceDescMap.get('relatedPlatformsDesc');
  readonly resourceCatalogueIdDesc: sd.Description = sd.serviceDescMap.get('resourceCatalogueIdDesc');
  readonly fundingBodyDesc: sd.Description = sd.serviceDescMap.get('fundingBodyDesc');
  readonly fundingProgramDesc: sd.Description = sd.serviceDescMap.get('fundingProgramDesc');
  readonly grantProjectNameDesc: sd.Description = sd.serviceDescMap.get('grantProjectNameDesc');
  readonly helpdeskPageDesc: sd.Description = sd.serviceDescMap.get('helpdeskPageDesc');
  readonly userManualDesc: sd.Description = sd.serviceDescMap.get('userManualDesc');
  readonly termsOfUseDesc: sd.Description = sd.serviceDescMap.get('termsOfUseDesc');
  readonly privacyPolicyDesc: sd.Description = sd.serviceDescMap.get('privacyPolicyDesc');
  readonly serviceLevelDesc: sd.Description = sd.serviceDescMap.get('serviceLevelDesc');
  readonly trainingInformationDesc: sd.Description = sd.serviceDescMap.get('trainingInformationDesc');
  readonly statusMonitoringDesc: sd.Description = sd.serviceDescMap.get('statusMonitoringDesc');
  readonly maintenanceDesc: sd.Description = sd.serviceDescMap.get('maintenanceDesc');
  readonly orderTypeDesc: sd.Description = sd.serviceDescMap.get('orderTypeDesc');
  readonly orderDesc: sd.Description = sd.serviceDescMap.get('orderDesc');
  readonly accessPolicyDesc: sd.Description = sd.serviceDescMap.get('accessPolicyDesc');
  readonly paymentModelDesc: sd.Description = sd.serviceDescMap.get('paymentModelDesc');
  readonly pricingDesc: sd.Description = sd.serviceDescMap.get('pricingDesc');
  readonly useCaseURLDesc: sd.Description = sd.serviceDescMap.get('useCaseURLDesc');
  readonly useCaseNameDesc: sd.Description = sd.serviceDescMap.get('useCaseNameDesc');

  readonly submissionPolicyURLDesc: sd.Description = sd.datasourceDescMap.get('submissionPolicyURLDesc');
  readonly preservationPolicyURLDesc: sd.Description = sd.datasourceDescMap.get('preservationPolicyURLDesc');
  readonly versionControlDesc: sd.Description = sd.datasourceDescMap.get('versionControlDesc');
  readonly persistentIdentityEntityTypeDesc: sd.Description = sd.datasourceDescMap.get('persistentIdentityEntityTypeDesc');
  readonly persistentIdentityEntityTypeSchemeDesc: sd.Description = sd.datasourceDescMap.get('persistentIdentityEntityTypeSchemeDesc');

  readonly jurisdictionDesc: sd.Description = sd.datasourceDescMap.get('jurisdictionDesc');
  readonly datasourceClassificationDesc: sd.Description = sd.datasourceDescMap.get('datasourceClassificationDesc');
  readonly researchEntityTypesDesc: sd.Description = sd.datasourceDescMap.get('researchEntityTypesDesc');
  readonly thematicDesc: sd.Description = sd.datasourceDescMap.get('thematicDesc');

  readonly researchProductLicenseNameDesc: sd.Description = sd.datasourceDescMap.get('researchProductLicenseNameDesc');
  readonly researchProductLicenseURLDesc: sd.Description = sd.datasourceDescMap.get('researchProductLicenseURLDesc');
  readonly researchProductAccessPoliciesDesc: sd.Description = sd.datasourceDescMap.get('researchProductAccessPoliciesDesc');

  readonly researchProductMetadataLicenseNameDesc: sd.Description = sd.datasourceDescMap.get('researchProductMetadataLicenseNameDesc');
  readonly researchProductMetadataLicenseURLDesc: sd.Description = sd.datasourceDescMap.get('researchProductMetadataLicenseURLDesc');
  readonly researchProductMetadataAccessPoliciesDesc: sd.Description = sd.datasourceDescMap.get('researchProductMetadataAccessPoliciesDesc');

  formGroupMeta = {
    id: [''],
    name: ['', Validators.required],
    abbreviation: ['', Validators.required],
    webpage: ['', Validators.compose([Validators.required, URLValidator])],
    description: ['', Validators.required],
    logo: ['', Validators.compose([Validators.required, URLValidator])],
    tagline: ['', Validators.required],
    // multimedia: this.fb.array([this.fb.control('', URLValidator, urlAsyncValidator(this.serviceProviderService))]),
    // multimediaNames: this.fb.array([this.fb.control('')]),
    multimedia: this.fb.array([
      this.fb.group({
        multimediaURL: ['', Validators.compose([Validators.required, URLValidator])],
        multimediaName: ['']
      })
    ]),
    // useCases: this.fb.array([this.fb.control('', URLValidator, urlAsyncValidator(this.serviceProviderService))]),
    // useCasesNames: this.fb.array([this.fb.control('')]),
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
    scientificDomains: this.fb.array([], Validators.required),

    submissionPolicyURL: this.fb.control('', URLValidator),
    preservationPolicyURL: this.fb.control('', URLValidator),
    versionControl: [''],
    persistentIdentitySystems: this.fb.array([
      this.fb.group({
        persistentIdentityEntityType: [''],
        persistentIdentityEntityTypeSchemes: this.fb.array([this.fb.control('')])
        // persistentIdentityEntityTypeSchemes: this.fb.array([this.initPersistentIdentityEntityTypeScheme()])
      })
    ]),

    jurisdiction: ['', Validators.required],
    datasourceClassification: ['', Validators.required],
    researchEntityTypes: this.fb.array([this.fb.control('', Validators.required)], Validators.required),
    thematic: ['', Validators.required],

    researchProductLicensings: this.fb.array([
      this.fb.group({
        researchProductLicenseName: [''],
        researchProductLicenseURL: ['', Validators.compose([Validators.required, URLValidator])]
      })
    ]),
    researchProductAccessPolicies: this.fb.array([this.fb.control('')]),

    researchProductMetadataLicensing: this.fb.group({
      researchProductMetadataLicenseName: [''],
      researchProductMetadataLicenseURL: ['', Validators.compose([Validators.required, URLValidator])]
    }),
    researchProductMetadataAccessPolicies: this.fb.array([this.fb.control('')]),
  };

  providersPage: Paging<Provider>;
  requiredResources: any;
  relatedResources: any;
  vocabularies: Map<string, Vocabulary[]> = null;
  subVocabularies: Map<string, Vocabulary[]> = null;
  premiumSort = new PremiumSortPipe();
  resourceService: ResourceService = this.injector.get(ResourceService);
  datasourceService: DatasourceService = this.injector.get(DatasourceService);

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
  public jurisdictionVocabulary: Vocabulary[] = null;
  public classificationVocabulary: Vocabulary[] = null;
  public researchEntityTypeVocabulary: Vocabulary[] = null;
  public persistentIdentitySchemeVocabulary: Vocabulary[] = null;
  public accessRightsVocabulary: Vocabulary[] = null;

  constructor(protected injector: Injector,
              protected authenticationService: AuthenticationService,
              protected serviceProviderService: ServiceProviderService,
              protected route: ActivatedRoute
  ) {
    this.resourceService = this.injector.get(ResourceService);
    this.datasourceService = this.injector.get(DatasourceService);
    this.fb = this.injector.get(FormBuilder);
    this.router = this.injector.get(NavigationService);
    this.serviceForm = this.fb.group(this.formGroupMeta);
    this.weights[0] = this.authenticationService.user.email.split('@')[0];
  }

  onSubmit(service: Service, tempSave: boolean, pendingService?: boolean) {
    // console.log('Submit');
    // console.log(this.commentControl.value);
    // console.log(this.serviceForm.status);
    // console.log(this.serviceForm.value);
    // this.findInvalidControls();
    if (!this.authenticationService.isLoggedIn()) {
      sessionStorage.setItem('service', JSON.stringify(this.serviceForm.value));
      this.authenticationService.login();
    }

    this.errorMessage = '';
    this.showLoader = true;
    // this.scientificDomainArray.disable();
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
    for (let i = 0; i < this.licensingArray.length; i++) {
      if ((this.licensingArray.controls[i].get('researchProductLicenseName').value === '' || this.licensingArray.controls[i].get('researchProductLicenseName').value === null)
        && (this.licensingArray.controls[i].get('researchProductLicenseURL').value === '' || this.licensingArray.controls[i].get('researchProductLicenseURL').value === null)) {
        this.removeLicensing(i);
      }
    }
    if ((this.metadataLicensingArray?.get('researchProductMetadataLicenseURL')?.value === '')
      && (this.metadataLicensingArray?.get('researchProductMetadataLicenseName')?.value === '')) {
      this.serviceForm.setControl('researchProductMetadataLicensing', this.fb.control(null));
    }
    for (let i = 0; i < this.persistentIdentitySystemArray.length; i++) {
      // console.log(this.persistentIdentitySystemArray.controls[i].get('persistentIdentityEntityTypeSchemes'));
      // console.log(this.persistentIdentitySystemArray.controls[i].get('persistentIdentityEntityTypeSchemes').value[0]);
      //TODO: fix persistentIdentityEntityTypeSchemes ....value[0]
      if ((this.persistentIdentitySystemArray.controls[i].get('persistentIdentityEntityType').value === '' || this.persistentIdentitySystemArray.controls[i].get('persistentIdentityEntityType').value === null)
        && (this.persistentIdentitySystemArray.controls[i].get('persistentIdentityEntityTypeSchemes').value[0] === '' || this.persistentIdentitySystemArray.controls[i].get('persistentIdentityEntityTypeSchemes').value[0] === null)) {
        this.removePersistentIdentitySystem(i);
      }
    }

    // this.findInvalidControls();
    // console.log('this.serviceForm.status ', this.serviceForm.status);
    // console.log('Submitted service --> ', service);
    // console.log('Submitted service value--> ', this.serviceForm.value);

    if (tempSave) {
      this.datasourceService.saveDatasourceAsDraft(this.serviceForm.value).subscribe(
        _service => {
          // console.log(_service);
          this.showLoader = false;
          return this.router.go('/provider/' + _service.resourceOrganisation + '/draft-datasource/update/' + _service.id);
        },
        err => {
          this.showLoader = false;
          window.scrollTo(0, 0);
          this.categoryArray.enable();
          this.scientificDomainArray.enable();
          this.errorMessage = 'Something went bad, server responded: ' + JSON.stringify(err.error.error);
        }
      );
    } else if (this.serviceForm.valid) {
      window.scrollTo(0, 0);
      const shouldPut = (this.editMode && !this.addOpenAIRE);
      this.datasourceService[pendingService ? 'submitPendingDatasource' : 'submitDatasource']
      (this.serviceForm.value, shouldPut, this.commentControl.value).subscribe(
        _ds => {
          this.showLoader = false;
          if (this.addOpenAIRE || this.draftFromOpenAIRE)
            return this.router.datasourceSubmitted(_ds.id); // redirect to datasource submitted successfully page after POST
          return this.router.dashboardResources(this.providerId, _ds.catalogueId); // redirect to services of provider (merged)
        },
        err => {
          this.showLoader = false;
          window.scrollTo(0, 0);
          this.categoryArray.enable();
          this.scientificDomainArray.enable();
          this.errorMessage = 'Something went bad, server responded: ' + JSON.stringify(err.error.error);
        }
      );
    } else if(this.serviceForm.status === 'PENDING') {
      this.timeOut(300).then( () => this.onSubmit(service, tempSave, pendingService));
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
    this.addOpenAIRE = window.location.pathname.includes('addOpenAIRE');
    zip(
      this.resourceService.getProvidersNames('approved'),
      this.resourceService.getAllVocabulariesByType(),
      this.resourceService.getAllRelatedResources()
    ).subscribe(suc => {
        this.providersPage = <Paging<Provider>>suc[0];
        this.vocabularies = <Map<string, Vocabulary[]>>suc[1];
        this.requiredResources = this.transformInputForDropdownUse(suc[2]);
        this.relatedResources = this.requiredResources;
        // this.getLocations();
        this.targetUsersVocabulary = this.vocabularies[Type.TARGET_USER];
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
        this.geographicalVocabulary = this.vocabularies[Type.REGION];
        this.geographicalVocabulary.push(...this.vocabularies[Type.COUNTRY]);
        this.languagesVocabulary = this.vocabularies[Type.LANGUAGE];
        this.jurisdictionVocabulary = this.vocabularies[Type.DS_JURISDICTION];
        this.classificationVocabulary = this.vocabularies[Type.DS_CLASSIFICATION];
        this.researchEntityTypeVocabulary = this.vocabularies[Type.DS_RESEARCH_ENTITY_TYPE];
        this.persistentIdentitySchemeVocabulary = this.vocabularies[Type.DS_PERSISTENT_IDENTITY_SCHEME];
        this.accessRightsVocabulary = this.vocabularies[Type.DS_COAR_ACCESS_RIGHTS_1_0];
      },
      error => {
        this.errorMessage = 'Something went bad while getting the data for page initialization. ' + JSON.stringify(error.error.error);
      },
      () => {
        this.premiumSort.transform(this.geographicalVocabulary, ['Europe', 'Worldwide']);
        this.premiumSort.transform(this.languagesVocabulary, ['English']);
        this.providersPage.results.sort((a, b) => 0 - (a.name > b.name ? -1 : 1)); //fixme: error?

        let voc: Vocabulary[] = this.vocabularies[Type.SUBCATEGORY].concat(this.vocabularies[Type.SCIENTIFIC_SUBDOMAIN]);
        this.subVocabularies = this.groupByKey(voc, 'parentId');

        // fixme: should simplify if-else statement but route.snapshot.paramMap is empty for aire
        if (this.projectName === 'OpenAIRE Catalogue') {
          this.providerId = 'openaire';
        } else {
          this.providerId = this.route.snapshot.paramMap.get('providerId');
        }

        this.serviceForm.get('resourceOrganisation').setValue(this.providerId);
        this.handleBitSets(0, 1, 'resourceOrganisation');

        if (!this.editMode || this.addOpenAIRE) { // prefill main contact info with provider's data
          this.serviceProviderService.getServiceProviderById(this.providerId).subscribe(
            res => { this.provider = res; },
            err => { console.log(err); },
            () => {
              Object.entries(this.provider.mainContact).forEach(([key, val]) => {
                if (val !== '' && val != null) {
                  this.serviceForm.controls['mainContact'].get(key).setValue(val);
                }
              });
              this.handleBitSetsOfGroups(5, 13, 'firstName', 'mainContact');
              this.handleBitSetsOfGroups(5, 14, 'lastName', 'mainContact');
              this.handleBitSetsOfGroups(5, 15, 'email', 'mainContact');
            }
          );
        }

      }
    );

    this.isPortalAdmin = this.authenticationService.isAdmin();

    this.vocabularyEntryForm = this.fb.group(this.suggestionsForm);

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

  private setAsTouched_(form: FormGroup, ret: any) {
    Object.keys(form.controls).forEach(control => {
      const control_ = form.controls[control];
      // console.log(control, control_);
      if (!control_.valid) {
        ret[control] = {};
        if (control_.hasOwnProperty('controls')) {
          this.setAsTouched_(control_ as FormGroup, ret[control]);
        } else {
          if (control_.enabled && !control_.valid) {
            // console.log(control);
            ret[control] = control_.valid;
            (control_ as FormGroup).markAsDirty();
            (control_ as FormGroup).markAsTouched();
            // console.log(control, form.controls[control].valid);
          }
        }
      }
    });
  }

  transformInputForDropdownUse(input) {
    const arr = [];
    for (const i in input) {
      if (input[i]?.title) { // for training resources
        arr.push({
          'name' : input[i].resourceOrganisation + ' - ' + input[i].title,
          'id' : input[i].id
        });
      } else { // for services and datasources
        arr.push({
          'name' : input[i].resourceOrganisation + ' - ' + input[i].name,
          'id' : input[i].id
        });
      }
    }
    return arr;

    // return Object.keys(input).reduce((accumulator, value) => {
    //   accumulator[value] = input[value][0].resourceOrganisation + ' - ' + input[value][0].name;
    //   return accumulator;
    // }, {});
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
      || this.checkEveryArrayFieldValidity('relatedPlatforms', this.editMode)
      || this.checkEveryArrayFieldValidity('catalogueId', this.editMode));
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
    this.tabs[12] = (this.checkFormValidity('paymentModel', this.editMode)
      || this.checkFormValidity('pricing', this.editMode));
    this.tabs[13] = (this.checkFormValidity('paymentModel', this.editMode)
      || this.checkFormValidity('pricing', this.editMode));
    this.tabs[14] = (this.checkFormValidity('paymentModel', this.editMode)
      || this.checkFormValidity('pricing', this.editMode));
    this.tabs[15] = (this.checkFormValidity('paymentModel', this.editMode)
      || this.checkFormValidity('pricing', this.editMode));
    //TODO: review new tabs on submit
    this.tabs[16] = (this.checkFormValidity('submissionPolicyURL', this.editMode)
      || this.checkFormValidity('preservationPolicyURL', this.editMode)
      || this.checkFormValidity('versionControl', this.editMode)
      || this.checkEveryArrayFieldValidity('persistentIdentitySystems', this.editMode, 'persistentIdentityEntityType')
      || this.checkEveryArrayFieldValidity('persistentIdentitySystems', this.editMode, 'persistentIdentityEntityTypeSchemes'));
    this.tabs[17] = (this.checkFormValidity('jurisdiction', this.editMode)
      || this.checkFormValidity('datasourceClassification', this.editMode)
      || this.checkEveryArrayFieldValidity('researchEntityTypes', this.editMode)
      || this.checkFormValidity('thematic', this.editMode));
    this.tabs[18] = (this.checkEveryArrayFieldValidity('researchProductLicensings', this.editMode, 'researchProductLicenseName')
      || this.checkEveryArrayFieldValidity('researchProductLicensings', this.editMode, 'researchProductLicenseURL')
      || this.checkEveryArrayFieldValidity('researchProductAccessPolicies', this.editMode));
    this.tabs[19] = (this.checkEveryArrayFieldValidity('researchProductMetadataLicensing', this.editMode, 'researchProductMetadataLicenseName')
      || this.checkEveryArrayFieldValidity('researchProductMetadataLicensing', this.editMode, 'researchProductMetadataLicenseURL')
      || this.checkEveryArrayFieldValidity('researchProductMetadataAccessPolicies', this.editMode));
    // console.log(this.tabs);
  }

  /** <--check form fields and tabs validity **/

  /** manage form arrays--> **/
  getFieldAsFormArray(field: string) {
    return this.serviceForm.get(field) as FormArray;
  }

  push(field: string, required: boolean, url?: boolean) {
    if (required) {
      if (url) {
        this.getFieldAsFormArray(field).push(this.fb.control('', Validators.compose([Validators.required, URLValidator])));
      } else {
        this.getFieldAsFormArray(field).push(this.fb.control('', Validators.required));
      }
    } else if (url) {
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

  newCategory(): FormGroup {
    return this.fb.group({
      // supercategory: ['', Validators.required],
      category: ['', Validators.required],
      subcategory: ['', Validators.required]
    });
  }

  get categoryArray() {
    return this.serviceForm.get('categories') as FormArray;
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

  newScientificDomain(): FormGroup {
    return this.fb.group({
      scientificDomain: ['', Validators.required],
      scientificSubdomain: ['', Validators.required]
    });
  }

  get scientificDomainArray() {
    return this.serviceForm.get('scientificDomains') as FormArray;
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
  newMultimedia(): FormGroup {
    return this.fb.group({
      multimediaURL: ['', Validators.compose([Validators.required, URLValidator])],
      multimediaName: ['']
    });
  }

  get multimediaArray() {
    return this.serviceForm.get('multimedia') as FormArray;
  }

  pushMultimedia() {
    this.multimediaArray.push(this.newMultimedia());
  }

  removeMultimedia(index: number) {
    this.multimediaArray.removeAt(index);
  }
  /** <--Multimedia**/

  /** Use Cases-->**/
  newUseCase(): FormGroup {
    return this.fb.group({
      useCaseURL: ['', Validators.compose([Validators.required, URLValidator])],
      useCaseName: ['']
    });
  }

  get useCasesArray() {
    return this.serviceForm.get('useCases') as FormArray;
  }

  pushUseCase() {
    this.useCasesArray.push(this.newUseCase());
  }

  removeUseCase(index: number) {
    this.useCasesArray.removeAt(index);
  }

  /** <--Use Cases**/

  /** Licensing -->**/
  newLicensing(): FormGroup {
    return this.fb.group({
      researchProductLicenseName: [''],
      researchProductLicenseURL: ['', Validators.compose([Validators.required, URLValidator])]
    });
  }

  get licensingArray() {
    return this.serviceForm.get('researchProductLicensings') as FormArray;
  }

  pushLicensing() {
    this.licensingArray.push(this.newLicensing());
  }

  removeLicensing(index: number) {
    this.licensingArray.removeAt(index);
  }
  /** <--Licensing**/

  /** MetadataLicensing -->**/
  get metadataLicensingArray() {
    return this.serviceForm.get('researchProductMetadataLicensing') as FormArray;
  }
  /** <--MetadataLicensing**/

  /** Persistent Identity Systems--> **/
  newPersistentIdentitySystem(): FormGroup {
    return this.fb.group({
      persistentIdentityEntityType: [''],
      persistentIdentityEntityTypeSchemes: this.fb.array([''])
    });
  }

  get persistentIdentitySystemArray() {
    return this.serviceForm.get('persistentIdentitySystems') as FormArray;
  }

  pushPersistentIdentitySystem() {
    this.persistentIdentitySystemArray.push(this.newPersistentIdentitySystem());
  }

  removePersistentIdentitySystem(index: number) {
    this.persistentIdentitySystemArray.removeAt(index);
  }

  pushPersistentIdentityEntityTypeScheme(i) {
    // const control = (<FormArray>this.serviceForm.controls['persistentIdentitySystems']).at(i).get('persistentIdentityEntityTypeSchemes') as FormArray;
    // control.push(this.fb.control(''));
    (this.persistentIdentitySystemArray.controls[i].get('persistentIdentityEntityTypeSchemes') as FormArray).push(this.fb.control(''));
  }

  removePersistentIdentityEntityTypeScheme(i:number, index: number) {
    (this.persistentIdentitySystemArray.controls[i].get('persistentIdentityEntityTypeSchemes') as FormArray).removeAt(index);
  }
  /** <--Persistent Identity Systems**/

  /** Service Contact Info -->**/

  newContact(): FormGroup {
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
    return this.serviceForm.get('publicContacts') as FormArray;
  }

  pushPublicContact() {
    this.publicContactArray.push(this.newContact()); // FIXME
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

  formPrepare(datasource: Datasource) {

    this.removeCategory(0);
    if (datasource.categories) {
      for (let i = 0; i < datasource.categories.length; i++) {
        this.categoryArray.push(this.newCategory());
        this.categoryArray.controls[this.categoryArray.length - 1].get('category').setValue(datasource.categories[i].category);
        this.categoryArray.controls[this.categoryArray.length - 1].get('subcategory').setValue(datasource.categories[i].subcategory);
      }
    } else {
      this.categoryArray.push(this.newCategory());
    }

    this.removeScientificDomain(0);
    if (datasource.scientificDomains) {
      for (let i = 0; i < datasource.scientificDomains.length; i++) {
        this.scientificDomainArray.push(this.newScientificDomain());
        this.scientificDomainArray.controls[this.scientificDomainArray.length - 1]
          .get('scientificDomain').setValue(datasource.scientificDomains[i].scientificDomain);
        this.scientificDomainArray.controls[this.scientificDomainArray.length - 1]
          .get('scientificSubdomain').setValue(datasource.scientificDomains[i].scientificSubdomain);
      }
    } else {
      this.scientificDomainArray.push(this.newScientificDomain());
    }

    if (datasource.resourceProviders) {
      for (let i = 0; i < datasource.resourceProviders.length - 1; i++) {
        this.push('resourceProviders', true);
      }
    }
    if (datasource.multimedia) {
      for (let i = 0; i < datasource.multimedia.length - 1; i++) {
        this.pushMultimedia();
      }
    }
    if (datasource.useCases) {
      for (let i = 0; i < datasource.useCases.length - 1; i++) {
        this.pushUseCase();
      }
    }
    if (datasource.targetUsers) {
      for (let i = 0; i < datasource.targetUsers.length - 1; i++) {
        this.push('targetUsers', true);
      }
    }
    if (datasource.accessTypes) {
      for (let i = 0; i < datasource.accessTypes.length - 1; i++) {
        this.push('accessTypes', false);
      }
    }
    if (datasource.accessModes) {
      for (let i = 0; i < datasource.accessModes.length - 1; i++) {
        this.push('accessModes', false);
      }
    }
    if (datasource.tags) {
      for (let i = 0; i < datasource.tags.length - 1; i++) {
        this.push('tags', false);
      }
    }
    if (datasource.geographicalAvailabilities) {
      for (let i = 0; i < datasource.geographicalAvailabilities.length - 1; i++) {
        this.push('geographicalAvailabilities', true);
      }
    }
    if (datasource.languageAvailabilities) {
      for (let i = 0; i < datasource.languageAvailabilities.length - 1; i++) {
        this.push('languageAvailabilities', true);
      }
    }
    if (datasource.resourceGeographicLocations) {
      for (let i = 0; i < datasource.resourceGeographicLocations.length - 1; i++) {
        this.push('resourceGeographicLocations', true);
      }
    }
    if (datasource.publicContacts) {
      for (let i = 0; i < datasource.publicContacts.length - 1; i++) {
        this.pushPublicContact();
      }
    }
    if (datasource.certifications) {
      for (let i = 0; i < datasource.certifications.length - 1; i++) {
        this.push('certifications', false);
      }
    }
    if (datasource.standards) {
      for (let i = 0; i < datasource.standards.length - 1; i++) {
        this.push('standards', false);
      }
    }
    if (datasource.openSourceTechnologies) {
      for (let i = 0; i < datasource.openSourceTechnologies.length - 1; i++) {
        this.push('openSourceTechnologies', false);
      }
    }
    if (datasource.changeLog) {
      for (let i = 0; i < datasource.changeLog.length - 1; i++) {
        this.push('changeLog', false);
      }
    }
    if (datasource.requiredResources) {
      for (let i = 0; i < datasource.requiredResources.length - 1; i++) {
        this.push('requiredResources', false);
      }
    }
    if (datasource.relatedResources) {
      for (let i = 0; i < datasource.relatedResources.length - 1; i++) {
        this.push('relatedResources', false);
      }
    }
    if (datasource.relatedPlatforms) {
      for (let i = 0; i < datasource.relatedPlatforms.length - 1; i++) {
        this.push('relatedPlatforms', false);
      }
    }
    if (datasource.fundingBody) {
      for (let i = 0; i < datasource.fundingBody.length - 1; i++) {
        this.push('fundingBody', false);
      }
    }
    if (datasource.fundingPrograms) {
      for (let i = 0; i < datasource.fundingPrograms.length - 1; i++) {
        this.push('fundingPrograms', false);
      }
    }
    if (datasource.grantProjectNames) {
      for (let i = 0; i < datasource.grantProjectNames.length - 1; i++) {
        this.push('grantProjectNames', false);
      }
    }
    if (datasource.persistentIdentitySystems) {
      for (let i = 0; i < datasource.persistentIdentitySystems.length - 1; i++) {
        this.pushPersistentIdentitySystem();
      }
    }
    if (datasource.researchEntityTypes) {
      for (let i = 0; i < datasource.researchEntityTypes.length - 1; i++) {
        this.push('researchEntityTypes', true);
      }
    }
    if (datasource.researchProductLicensings) {
      for (let i = 0; i < datasource.researchProductLicensings.length - 1; i++) {
        this.pushLicensing();
      }
    }
    if (datasource.researchProductAccessPolicies) {
      for (let i = 0; i < datasource.researchProductAccessPolicies.length - 1; i++) {
        this.push('researchProductAccessPolicies', false);
      }
    }
    if (datasource.researchProductMetadataAccessPolicies) {
      for (let i = 0; i < datasource.researchProductMetadataAccessPolicies.length - 1; i++) {
        this.push('researchProductMetadataAccessPolicies', false);
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
      this.remainingOnTab2 = this.requiredOnTab2 - this.BitSetTab2.get(7) - this.BitSetTab2.get(9) - this.BitSetTab2.get(10);
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
    } else if (tabNum === 13) {
      this.BitSetTab13.set(bitIndex, 1);
      this.remainingOnTab13 = this.requiredOnTab13 - this.BitSetTab13.cardinality();
      if (this.remainingOnTab13 === 0 && this.completedTabsBitSet.get(tabNum) !== 1) {
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
      this.remainingOnTab2 = this.requiredOnTab2 - this.BitSetTab2.get(7) - this.BitSetTab2.get(9) - this.BitSetTab2.get(10);
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
    } else if (tabNum === 13) {
      this.BitSetTab13.set(bitIndex, 0);
      this.remainingOnTab13 = this.requiredOnTab13 - this.BitSetTab13.cardinality();
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
  showCommentModal() {
    if (this.editMode && !this.pendingService && !this.addOpenAIRE) {
      UIkit.modal('#commentModal').show();
    } else {
      this.onSubmit(this.serviceForm.value, false);
    }
  }

  // openPreviewModal() {
  //   // console.log('Resource ==>', this.serviceForm.value);
  //   UIkit.modal('#modal-preview').show();
  // }

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
      this.serviceProviderService.submitVocabularyEntry(entryValueName, vocabulary, parent, 'service', this.providerId, this.serviceID).subscribe(
        res => {
        },
        error => {
          console.log(error);
          this.vocabularyEntryForm.get('errorMessage').setValue(error.error.error);
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

  public findInvalidControls() {
    const invalid = [];
    const controls = this.serviceForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    // return invalid;
    console.log('findInvalidControls ', invalid);
  }

}
