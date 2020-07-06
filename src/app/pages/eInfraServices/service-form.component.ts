import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Component, Injector, OnInit} from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {NavigationService} from '../../services/navigation.service';
import {ResourceService} from '../../services/resource.service';
import {UserService} from '../../services/user.service';
import * as sd from './services.description';
import {Provider, RichService, Service, Type, Vocabulary} from '../../domain/eic-model';
import {Paging} from '../../domain/paging';
import {URLValidator} from '../../shared/validators/generic.validator';
import {zip} from 'rxjs/internal/observable/zip';
import {PremiumSortPipe} from '../../shared/pipes/premium-sort.pipe';
import {environment} from '../../../environments/environment';
import BitSet from 'bitset/bitset';

@Component({
  selector: 'app-service-form',
  templateUrl: './service-form.component.html',
  styleUrls: ['../serviceProvider/service-provider-form.component.css']
})
export class ServiceFormComponent implements OnInit {
  projectName = environment.projectName;
  serviceName = '';
  firstServiceForm = false;
  showLoader = false;
  pendingService = false;
  providerId: string;
  editMode: boolean;
  hasChanges = false;
  serviceForm: FormGroup;
  service: Service;
  serviceID: string;
  errorMessage = '';
  successMessage: string = null;
  weights: string[] = [];
  tabs: boolean[] = [false, false, false, false, false, false, false, false, false, false, false, false];
  fb: FormBuilder = this.injector.get(FormBuilder);
  disable = false;

  requiredOnTab0 = 3;
  requiredOnTab1 = 3;
  requiredOnTab2 = 3;
  requiredOnTab3 = 2;
  requiredOnTab5 = 3;
  requiredOnTab6 = 1;
  requiredOnTab10 = 1;

  remainingOnTab0 = this.requiredOnTab0;
  remainingOnTab1 = this.requiredOnTab1;
  remainingOnTab2 = this.requiredOnTab2;
  remainingOnTab3 = this.requiredOnTab3;
  remainingOnTab5 = this.requiredOnTab5;
  remainingOnTab6 = this.requiredOnTab6;
  remainingOnTab10 = this.requiredOnTab10;

  BitSetTab0 = new BitSet;
  BitSetTab1 = new BitSet;
  BitSetTab2 = new BitSet;
  BitSetTab3 = new BitSet;
  BitSetTab5 = new BitSet;
  BitSetTab6 = new BitSet;
  BitSetTab10 = new BitSet;

  requiredTabs = 7;
  completedTabs = 0;
  completedTabsBitSet = new BitSet;

  allRequiredFields = 20;
  loaderBitSet = new BitSet;
  loaderPercentage = 0;

  publicContactBitSet = new BitSet;

  readonly nameDesc: sd.Description = sd.nameDesc;
  readonly webpageDesc: sd.Description = sd.webpageDesc;
  readonly descriptionDesc: sd.Description = sd.descriptionDesc;
  readonly taglineDesc: sd.Description = sd.taglineDesc;
  readonly logoDesc: sd.Description = sd.logoDesc;
  readonly multimediaDesc: sd.Description = sd.multimediaDesc;
  readonly targetUsersDesc: sd.Description = sd.targetUsersDesc;
  readonly resourceProvidersDesc: sd.Description = sd.resourceProvidersDesc;
  readonly resourceOrganisationDesc: sd.Description = sd.resourceOrganisationDesc;
  readonly resourceGeographicLocationsDesc: sd.Description = sd.resourceGeographicLocationsDesc;
  readonly scientificDomainDesc: sd.Description = sd.scientificDomainDesc;
  readonly scientificSubDomainDesc: sd.Description = sd.scientificSubDomainDesc;
  readonly categoryDesc: sd.Description = sd.categoryDesc;
  readonly subcategoryDesc: sd.Description = sd.subcategoryDesc;
  readonly tagsDesc: sd.Description = sd.tagsDesc;
  readonly geographicalAvailabilityDesc: sd.Description = sd.geographicalAvailabilityDesc;
  readonly languageAvailabilitiesDesc: sd.Description = sd.languageAvailabilitiesDesc;
  readonly mainContactFirstNameDesc: sd.Description = sd.mainContactFirstNameDesc;
  readonly mainContactLastNameDesc: sd.Description = sd.mainContactLastNameDesc;
  readonly mainContactEmailDesc: sd.Description = sd.mainContactEmailDesc;
  readonly mainContactPhoneDesc: sd.Description = sd.mainContactPhoneDesc;
  readonly mainContactPositionDesc: sd.Description = sd.mainContactPositionDesc;
  readonly mainContactOrganisationDesc: sd.Description = sd.mainContactOrganisationDesc;
  readonly publicContactFirstNameDesc: sd.Description = sd.publicContactFirstNameDesc;
  readonly publicContactLastNameDesc: sd.Description = sd.publicContactLastNameDesc;
  readonly publicContactEmailDesc: sd.Description = sd.publicContactEmailDesc;
  readonly publicContactPhoneDesc: sd.Description = sd.publicContactPhoneDesc;
  readonly publicContactPositionDesc: sd.Description = sd.publicContactPositionDesc;
  readonly publicContactOrganisationDesc: sd.Description = sd.publicContactOrganisationDesc;
  readonly helpdeskEmailDesc: sd.Description = sd.helpdeskEmailDesc;
  readonly securityContactEmailDesc: sd.Description = sd.securityContactEmailDesc;
  readonly phaseDesc: sd.Description = sd.phaseDesc;
  readonly technologyReadinessLevelDesc: sd.Description = sd.technologyReadinessLevelDesc;
  readonly certificationsDesc: sd.Description = sd.certificationsDesc;
  readonly standardsDesc: sd.Description = sd.standardsDesc;
  readonly openSourceTechnologiesDesc: sd.Description = sd.openSourceTechnologiesDesc;
  readonly versionDesc: sd.Description = sd.versionDesc;
  readonly lastUpdateDesc: sd.Description = sd.lastUpdateDesc;
  readonly changeLogDesc: sd.Description = sd.changeLogDesc;
  readonly requiredServicesDesc: sd.Description = sd.requiredServicesDesc;
  readonly relatedServicesDesc: sd.Description = sd.relatedServicesDesc;
  readonly relatedPlatformsDesc: sd.Description = sd.relatedPlatformsDesc;
  readonly fundingBodyDesc: sd.Description = sd.fundingBodyDesc;
  readonly fundingProgramDesc: sd.Description = sd.fundingProgramDesc;
  readonly grantProjectNameDesc: sd.Description = sd.grantProjectNameDesc;
  readonly helpdeskPageDesc: sd.Description = sd.helpdeskPageDesc;
  readonly userManualDesc: sd.Description = sd.userManualDesc;
  readonly termsOfUseDesc: sd.Description = sd.termsOfUseDesc;
  readonly privacyPolicyDesc: sd.Description = sd.privacyPolicyDesc;
  readonly serviceLevelDesc: sd.Description = sd.serviceLevelDesc;
  readonly trainingInformationDesc: sd.Description = sd.trainingInformationDesc;
  readonly statusMonitoringDesc: sd.Description = sd.statusMonitoringDesc;
  readonly maintenanceDesc: sd.Description = sd.maintenanceDesc;
  readonly orderTypeDesc: sd.Description = sd.orderTypeDesc;
  readonly orderDesc: sd.Description = sd.orderDesc;
  readonly accessTypesDesc: sd.Description = sd.accessTypeDesc;
  readonly accessModesDesc: sd.Description = sd.accessModeDesc;
  readonly accessPolicyDesc: sd.Description = sd.accessPolicyDesc;
  readonly paymentModelDesc: sd.Description = sd.paymentModelDesc;
  readonly pricingDesc: sd.Description = sd.pricingDesc;
  readonly useCasesDesc: sd.Description = sd.useCasesDesc;


  formGroupMeta = {
    id: [''],
    name: ['', Validators.required],
    webpage: ['', Validators.compose([Validators.required, URLValidator])],
    description: ['', Validators.required],
    logo: ['', Validators.compose([Validators.required, URLValidator])],
    tagline: ['', Validators.required],
    // userValue: [''],
    // userBaseList : this.fb.array([ this.fb.control('') ]),
    useCases: this.fb.array([this.fb.control('', URLValidator)]),
    multimedia: this.fb.array([this.fb.control('', URLValidator)]),
    // options : this.fb.array([this.newOption()]),
    // endpoint: ['', URLValidator],
    requiredResources: this.fb.array([this.fb.control('')]),
    relatedResources: this.fb.array([this.fb.control('')]),
    relatedPlatforms: this.fb.array([this.fb.control('')]),
    resourceOrganisation: ['', Validators.required],
    resourceProviders: this.fb.array([this.fb.control('')]),
    resourceGeographicLocations: this.fb.array([this.fb.control('')]),
    // 'scientificDomains : this.fb.array([ this.fb.control('', Validators.required)], Validators.required),
    scientificSubdomains: this.fb.array([]),
    // 'category: [''],
    subcategories: this.fb.array([]),
    // 'supercategory: [''],
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
    termsOfUse: ['', URLValidator],
    privacyPolicy: ['', URLValidator],
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
      phone: ['', Validators.pattern('[+]?\\d+$')],
      position: [''],
      organisation: ['']
    }, Validators.required),
    publicContacts: this.fb.array([
      this.fb.group({
        firstName: [''],
        lastName: [''],
        email: ['', Validators.compose([Validators.required, Validators.email])],
        phone: ['', Validators.pattern('[+]?\\d+$')],
        position: [''],
        organisation: ['']
      })
    ]),

    // aggregatedServices: [''],
    // datasets: [''],
    // applications: [''],
    // software: [''],
    // publications: [''],
    // otherProducts: [''],

    categorize: this.fb.array([], Validators.required),
    scientificCategorization: this.fb.array([], Validators.required)
  };

  providersPage: Paging<Provider>;
  requiredResources: any;
  relatedResources: any;
  vocabularies: Map<string, Vocabulary[]> = null;
  premiumSort = new PremiumSortPipe();
  resourceService: ResourceService = this.injector.get(ResourceService);

  router: NavigationService = this.injector.get(NavigationService);
  userService: UserService = this.injector.get(UserService);

  public fundingBodyVocabulary: Vocabulary[] = null;
  public fundingProgramVocabulary: Vocabulary[] = null;
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
  public placesVocIdArray: string[] = [];
  public geographicalVocabulary: Vocabulary[] = null;
  public languagesVocabulary: Vocabulary[] = null;
  public languagesVocIdArray: string[] = [];

  constructor(protected injector: Injector,
              protected authenticationService: AuthenticationService
  ) {
    this.resourceService = this.injector.get(ResourceService);
    this.fb = this.injector.get(FormBuilder);
    this.router = this.injector.get(NavigationService);
    this.userService = this.injector.get(UserService);
    this.serviceForm = this.fb.group(this.formGroupMeta);
    this.weights[0] = this.authenticationService.user.email.split('@')[0];
  }

  onSubmit(service: Service, tempSave: boolean, pendingService?: boolean) {
    if (!this.authenticationService.isLoggedIn()) {
      console.log('Submit');
      sessionStorage.setItem('service', JSON.stringify(this.serviceForm.value));
      this.authenticationService.login();
    }

    this.errorMessage = '';

    /** Fill subcategory string array**/
    this.getFieldAsFormArray('subcategories').controls = [];
    for (const category in this.categoryArray.controls) {
      if (this.categoryArray.controls[category].get('subcategory').value) {
        this.getFieldAsFormArray('subcategories').push(this.fb.control(this.categoryArray.controls[category].get('subcategory').value));
      }
    }
    this.categoryArray.disable();
    /** Fill scientific subdomain string array**/
    this.getFieldAsFormArray('scientificSubdomains').controls = [];
    for (const scientificDomain of this.scientificDomainArray.controls) {
      if (scientificDomain.get('scientificSubDomain').value) {
        this.getFieldAsFormArray('scientificSubdomains').push(this.fb.control(scientificDomain.get('scientificSubDomain').value));
      }
    }
    this.scientificDomainArray.disable();
    this.showLoader = true;
    console.log('this.serviceForm.valid ', this.serviceForm.valid);
    console.log('Submitted service --> ', service);
    if (tempSave) {
      // todo add fix hear
      this.resourceService[(pendingService || !this.editMode) ? 'uploadTempPendingService' : 'uploadTempService']
      (this.serviceForm.value).subscribe(
        _service => {
          // console.log(_service);
          this.showLoader = false;
          return this.router.go('/editPendingService/' + _service.id);
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
      this.resourceService[pendingService ? 'uploadPendingService' : 'uploadService']
      (this.serviceForm.value, this.editMode).subscribe(
        _service => {
          // console.log(_service);
          this.showLoader = false;
          return this.router.service(_service.id);
        },
        err => {
          this.showLoader = false;
          window.scrollTo(0, 0);
          this.categoryArray.enable();
          this.scientificDomainArray.enable();
          this.errorMessage = 'Something went bad, server responded: ' + JSON.stringify(err.error.error);
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
    zip(
      this.resourceService.getProvidersNames(),
      this.resourceService.getAllVocabulariesByType(),
      this.resourceService.getServices()
    ).subscribe(suc => {
        this.providersPage = <Paging<Provider>>suc[0];
        this.vocabularies = <Map<string, Vocabulary[]>>suc[1];
        this.requiredResources = this.transformInput(suc[2]);
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
        // this.placesVocabulary = this.vocabularies[Type.COUNTRY];
        this.geographicalVocabulary = this.vocabularies[Type.COUNTRY];
        this.languagesVocabulary = this.vocabularies[Type.LANGUAGE];
        // this.placesVocIdArray = this.placesVocabulary.map(entry => entry.id);
        // this.languagesVocIdArray = this.languagesVocabulary.map(entry => entry.id);
      },
      error => {
        this.errorMessage = 'Something went bad while getting the data for page initialization. ' + JSON.stringify(error.error.error);
      },
      () => {
        this.premiumSort.transform(this.geographicalVocabulary, ['Europe', 'World']);
        this.premiumSort.transform(this.languagesVocabulary, ['English']);
        this.providersPage.results.sort((a, b) => 0 - (a.name > b.name ? -1 : 1));
        this.handleBitSets(0, 1, 'resourceOrganisation');
        if (this.publicContactBitSet.cardinality() === 0) {
          this.removePublicContact(0);
        }
      }
    );

    this.pushCategory();
    this.pushScientificDomain();

    if (sessionStorage.getItem('service')) {
      const data = JSON.parse(sessionStorage.getItem('service'));
      for (const i in data) {
        if (data.hasOwnProperty(i)) {
          if (Array.isArray(data[i])) {
            // console.log(i);
            for (let j = 0; j < data[i].length - 1; j++) {
              if (i === 'scientificCategorization') {
                this.scientificDomainArray.push(this.newScientificDomain());
              } else if (i === 'categorize') {
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
    // console.log(this.serviceForm);
    this.setAsTouched_(this.serviceForm, ret);
    // console.log(ret);
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

  transformInput(input) {
    return Object.keys(input).reduce((accumulator, value) => {
      accumulator[value] = input[value][0].resourceOrganisation + ' - ' + input[value][0].name;
      return accumulator;
    }, {});
  }

  /** check form fields and tabs validity--> **/
  checkFormValidity(name: string): boolean {
    return (!this.serviceForm.get(name).valid && this.serviceForm.get(name).dirty);
  }

  checkFormArrayValidity(name: string, position: number, groupName?: string, position2?: number, contactField?: string): boolean {
    if (contactField) {
      return this.getFieldAsFormArray(name).controls[position].get(groupName).get([position2]).get(contactField).valid
        && this.getFieldAsFormArray(name).controls[position].get(groupName).get([position2]).get(contactField).dirty;
    }
    if (groupName) {
      return !this.getFieldAsFormArray(name).get([position]).get(groupName).valid
        && this.getFieldAsFormArray(name).get([position]).get(groupName).dirty;
    }
    return !this.getFieldAsFormArray(name).get([position]).valid && this.getFieldAsFormArray(name).get([position]).dirty;
  }

  checkEveryArrayFieldValidity(name: string, groupName?: string, contactField?: string): boolean {
    for (let i = 0; i < this.getFieldAsFormArray(name).length; i++) {
      if (groupName && contactField) {
        for (let j = 0; j < this.getFieldAsFormArray(name).controls[i].get(groupName)[length]; j++) {
          console.log(j);
          if (this.getFieldAsFormArray(name).controls[i].get(groupName).get([j]).get(contactField).valid
            && this.getFieldAsFormArray(name).controls[i].get(groupName).get([j]).get(contactField).dirty) {
            return true;
          }
        }
      }
      if (groupName) {
        if (!this.getFieldAsFormArray(name).get([i]).get(groupName).valid && this.getFieldAsFormArray(name).get([i]).get(groupName).dirty) {
          return true;
        }
      } else if (!this.getFieldAsFormArray(name).get([i]).valid && this.getFieldAsFormArray(name).get([i]).dirty) {
        return true;
      }
    }
    return false;
  }

  markTabs() {
    this.tabs[0] = (this.checkFormValidity('name')
      || this.checkFormValidity('resourceOrganisation')
      || this.checkEveryArrayFieldValidity('resourceProviders')
      || this.checkFormValidity('webpage'));
    this.tabs[1] = (this.checkFormValidity('description')
      || this.checkFormValidity('tagline')
      || this.checkFormValidity('logo')
      || this.checkEveryArrayFieldValidity('multimedia')
      || this.checkEveryArrayFieldValidity('useCases'));
    this.tabs[2] = (this.checkEveryArrayFieldValidity('scientificCategorization', 'scientificDomain')
      || this.checkEveryArrayFieldValidity('scientificCategorization', 'scientificSubDomain')
      || this.checkEveryArrayFieldValidity('categorize', 'category')
      || this.checkEveryArrayFieldValidity('categorize', 'subcategory')
      || this.checkEveryArrayFieldValidity('targetUsers')
      || this.checkEveryArrayFieldValidity('accessTypes')
      || this.checkEveryArrayFieldValidity('accessModes')
      || this.checkEveryArrayFieldValidity('tags'));
    this.tabs[3] = (this.checkEveryArrayFieldValidity('geographicalAvailabilities')
      || this.checkEveryArrayFieldValidity('languageAvailabilities'));
    this.tabs[4] = (this.checkEveryArrayFieldValidity('resourceGeographicLocations'));
    this.tabs[5] = (this.checkFormValidity('mainContact.firstName')
      || this.checkFormValidity('mainContact.lastName')
      || this.checkFormValidity('mainContact.email')
      || this.checkFormValidity('mainContact.phone')
      || this.checkFormValidity('mainContact.position')
      || this.checkFormValidity('mainContact.organisation')
      || this.checkEveryArrayFieldValidity('publicContacts', 'firstName')
      || this.checkEveryArrayFieldValidity('publicContacts', 'lastName')
      || this.checkEveryArrayFieldValidity('publicContacts', 'email')
      || this.checkEveryArrayFieldValidity('publicContacts', 'phone')
      || this.checkEveryArrayFieldValidity('publicContacts', 'position')
      || this.checkEveryArrayFieldValidity('publicContacts', 'organisation')
      || this.checkFormValidity('helpdeskEmail')
      || this.checkFormValidity('securityContactEmail'));
    this.tabs[6] = (this.checkFormValidity('trl')
      || this.checkFormValidity('lifeCycleStatus')
      || this.checkEveryArrayFieldValidity('certifications')
      || this.checkEveryArrayFieldValidity('standards')
      || this.checkEveryArrayFieldValidity('openSourceTechnologies')
      || this.checkFormValidity('version')
      || this.checkFormValidity('lastUpdate')
      || this.checkEveryArrayFieldValidity('changeLog'));
    this.tabs[7] = (this.checkEveryArrayFieldValidity('requiredResources')
      || this.checkEveryArrayFieldValidity('relatedResources')
      || this.checkEveryArrayFieldValidity('relatedPlatforms'));
    this.tabs[8] = (this.checkEveryArrayFieldValidity('fundingBody')
      || this.checkEveryArrayFieldValidity('fundingPrograms')
      || this.checkEveryArrayFieldValidity('grantProjectNames'));
    this.tabs[9] = (this.checkFormValidity('helpdeskPage')
      || this.checkFormValidity('userManual')
      || this.checkFormValidity('termsOfUse')
      || this.checkFormValidity('privacyPolicy')
      || this.checkFormValidity('accessPolicy')
      || this.checkFormValidity('serviceLevel')
      || this.checkFormValidity('trainingInformation')
      || this.checkFormValidity('statusMonitoring')
      || this.checkFormValidity('maintenance'));
    this.tabs[10] = (this.checkFormValidity('orderType')
      || this.checkFormValidity('order'));
    this.tabs[11] = (this.checkFormValidity('paymentModel')
      || this.checkFormValidity('pricing'));

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
    return this.serviceForm.get('categorize') as FormArray;
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
      scientificSubDomain: ['', Validators.required]
    });
  }

  get scientificDomainArray() {
    return this.serviceForm.get('scientificCategorization') as FormArray;
  }

  pushScientificDomain() {
    this.scientificDomainArray.push(this.newScientificDomain());
    this.scientificDomainArray.controls[this.scientificDomainArray.length - 1].get('scientificSubDomain').disable();
  }

  removeScientificDomain(index: number) {
    this.scientificDomainArray.removeAt(index);
  }

  onScientificDomainChange(index: number) {
    this.scientificDomainArray.controls[index].get('scientificSubDomain').enable();
    this.scientificDomainArray.controls[index].get('scientificSubDomain').reset();
  }

  /** <-- Categorization & Scientific Domain**/

  /** Service Contact Info -->**/

  newContact(): FormGroup {
    return this.fb.group({
      firstName: [''],
      lastName: [''],
      email: [''],
      phone: [''],
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

  /*
  newContact(): FormGroup {
    return this.fb.group({
      firstName: [''],
      lastName: [''],
      email: [''],
      tel: [''],
      position: [''],
    });
  }

  getContactArray(index: number) {
    return this.getFieldAsFormArray('options').controls[index].get('contacts') as FormArray;
  }

  getAttributesArray(index: number) {
    return this.getFieldAsFormArray('options').controls[index].get('attributes') as FormArray;
  }

  pushContact(index: number) {
    this.getContactArray(index).push(this.newContact());
  }

  removeContact(index: number, i: number) {
    this.getContactArray(index).removeAt(i);
  }
*/

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

  formPrepare(richService: RichService) {

    this.removeCategory(0);
    if (richService.service.subcategories) {
      for (let i = 0; i < richService.service.subcategories.length; i++) {
        this.categoryArray.push(this.newCategory());
        this.categoryArray.controls[this.categoryArray.length - 1].get('category').setValue(richService.categories[i].category.id);
        this.categoryArray.controls[this.categoryArray.length - 1].get('subcategory').setValue(richService.categories[i].subCategory.id);
      }
    }
    this.removeScientificDomain(0);
    if (richService.service.scientificSubdomains) {
      for (let i = 0; i < richService.service.scientificSubdomains.length; i++) {
        this.scientificDomainArray.push(this.newScientificDomain());
        this.scientificDomainArray.controls[this.scientificDomainArray.length - 1]
          .get('scientificDomain').setValue(richService.domains[i].domain.id);
        this.scientificDomainArray.controls[this.scientificDomainArray.length - 1]
          .get('scientificSubDomain').setValue(richService.domains[i].subdomain.id);
      }
    }

    if (richService.service.resourceProviders) {
      for (let i = 0; i < richService.service.resourceProviders.length - 1; i++) {
        this.push('resourceProviders', true);
      }
    }
    if (richService.service.multimedia) {
      for (let i = 0; i < richService.service.multimedia.length - 1; i++) {
        this.push('multimedia', false);
      }
    }
    if (richService.service.useCases) {
      for (let i = 0; i < richService.service.useCases.length - 1; i++) {
        this.push('useCases', false);
      }
    }
    if (richService.service.targetUsers) {
      for (let i = 0; i < richService.service.targetUsers.length - 1; i++) {
        this.push('targetUsers', true);
      }
    }
    if (richService.service.accessTypes) {
      for (let i = 0; i < richService.service.accessTypes.length - 1; i++) {
        this.push('accessTypes', false);
      }
    }
    if (richService.service.accessModes) {
      for (let i = 0; i < richService.service.accessModes.length - 1; i++) {
        this.push('accessModes', false);
      }
    }
    if (richService.service.tags) {
      for (let i = 0; i < richService.service.tags.length - 1; i++) {
        this.push('tags', false);
      }
    }
    if (richService.service.geographicalAvailabilities) {
      for (let i = 0; i < richService.service.geographicalAvailabilities.length - 1; i++) {
        this.push('geographicalAvailabilities', true);
      }
    }
    if (richService.service.languageAvailabilities) {
      for (let i = 0; i < richService.service.languageAvailabilities.length - 1; i++) {
        this.push('languageAvailabilities', true);
      }
    }
    if (richService.service.resourceGeographicLocations) {
      for (let i = 0; i < richService.service.resourceGeographicLocations.length - 1; i++) {
        this.push('resourceGeographicLocations', true);
      }
    }
    if (richService.service.publicContacts) {
      for (let i = 0; i < richService.service.publicContacts.length - 1; i++) {
        this.push('publicContacts', false);
      }
    }
    if (richService.service.certifications) {
      for (let i = 0; i < richService.service.certifications.length - 1; i++) {
        this.push('certifications', false);
      }
    }
    if (richService.service.standards) {
      for (let i = 0; i < richService.service.standards.length - 1; i++) {
        this.push('standards', false);
      }
    }
    if (richService.service.openSourceTechnologies) {
      for (let i = 0; i < richService.service.openSourceTechnologies.length - 1; i++) {
        this.push('openSourceTechnologies', false);
      }
    }
    if (richService.service.changeLog) {
      for (let i = 0; i < richService.service.changeLog.length - 1; i++) {
        this.push('changeLog', false);
      }
    }
    if (richService.service.requiredResources) {
      for (let i = 0; i < richService.service.requiredResources.length - 1; i++) {
        this.push('requiredResources', false);
      }
    }
    if (richService.service.relatedResources) {
      for (let i = 0; i < richService.service.relatedResources.length - 1; i++) {
        this.push('relatedResources', false);
      }
    }
    if (richService.service.relatedPlatforms) {
      for (let i = 0; i < richService.service.relatedPlatforms.length - 1; i++) {
        this.push('relatedPlatforms', false);
      }
    }
    if (richService.service.fundingBody) {
      for (let i = 0; i < richService.service.fundingBody.length - 1; i++) {
        this.push('fundingBody', false);
      }
    }
    if (richService.service.fundingPrograms) {
      for (let i = 0; i < richService.service.fundingPrograms.length - 1; i++) {
        this.push('fundingPrograms', false);
      }
    }
    if (richService.service.grantProjectNames) {
      for (let i = 0; i < richService.service.grantProjectNames.length - 1; i++) {
        this.push('grantProjectNames', false);
      }
    }
  }

  downloadServiceFormPDF() {
    window.open('../../../assets/files/serviceForm.pdf', '_blank');
  }

  unsavedChangesPrompt() {
    this.hasChanges = true;
  }

  handleBitSets(tabNum: number, bitIndex: number, formControlName: string): void {
    if (bitIndex === 0) {
      this.serviceName = this.serviceForm.get(formControlName).value;
    }
      if (this.serviceForm.get(formControlName).valid) {
        this.decreaseRemainingFieldsPerTab(tabNum, bitIndex);
        this.loaderBitSet.set(bitIndex, 1);
      } else if (this.serviceForm.get(formControlName).invalid) {
        this.increaseRemainingFieldsPerTab(tabNum, bitIndex);
        this.loaderBitSet.set(bitIndex, 0);
      }
    this.loaderPercentage = Math.round((this.loaderBitSet.cardinality() / this.allRequiredFields) * 100);
  }

  handleBitSetsOfGroups(tabNum: number, bitIndex: number, formControlName: string, group: string): void {
    if (group === 'scientificCategorization') {
      for (const scientificDomain of this.scientificDomainArray.controls) {
        if (scientificDomain.get('scientificSubDomain').value) {
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
    } else if (group === 'categorize') {
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
      if (this.serviceForm.controls[group].get(formControlName).valid) {
        this.decreaseRemainingFieldsPerTab(tabNum, bitIndex);
        this.loaderBitSet.set(bitIndex, 1);
      } else if (this.serviceForm.controls[group].get(formControlName).invalid) {
        this.increaseRemainingFieldsPerTab(tabNum, bitIndex);
        this.loaderBitSet.set(bitIndex, 0);
      }
    }
    this.loaderPercentage = Math.round((this.loaderBitSet.cardinality() / this.allRequiredFields) * 100);
  }

  handlePublicContactBitSet (bitIndex: number, formControlName: string) {
    if (this.publicContactArray.value[0][formControlName] !== '') {
      this.publicContactBitSet.set(bitIndex, 1);
    } else if (this.publicContactArray.value[0][formControlName] === '') {
      this.publicContactBitSet.set(bitIndex, 0);
    }
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
      this.remainingOnTab5 = this.requiredOnTab5 - +(mainContactCardinality === 3) - this.BitSetTab5.get(16) - this.BitSetTab5.get(17);
      if (this.remainingOnTab5 === 0 && this.completedTabsBitSet.get(tabNum) !== 1) {
        this.calcCompletedTabs(tabNum, 1);
      }
    } else if (tabNum === 6) {
      this.BitSetTab6.set(bitIndex, 1);
      this.remainingOnTab6 = this.requiredOnTab6 - this.BitSetTab6.cardinality();
      if (this.remainingOnTab6 === 0 && this.completedTabsBitSet.get(tabNum) !== 1) {
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
      this.remainingOnTab5 = this.requiredOnTab5 - +(mainContactCardinality === 3) - this.BitSetTab5.get(16) - this.BitSetTab5.get(17);
      if (this.completedTabsBitSet.get(tabNum) !== 0) {
        this.calcCompletedTabs(tabNum, 0);
      }
    } else if (tabNum === 6) {
      this.BitSetTab6.set(bitIndex, 0);
      this.remainingOnTab6 = this.requiredOnTab6 - this.BitSetTab6.cardinality();
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

}
