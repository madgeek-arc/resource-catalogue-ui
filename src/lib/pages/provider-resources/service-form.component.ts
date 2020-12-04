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
import {ActivatedRoute} from '@angular/router';
import {ServiceProviderService} from '../../services/service-provider.service';

declare var UIkit: any;

@Component({
  selector: 'app-service-form',
  templateUrl: './service-form.component.html',
  styleUrls: ['../provider/service-provider-form.component.css']
})
export class ServiceFormComponent implements OnInit {
  protected _marketplaceBaseURL = environment.marketplaceBaseURL;
  serviceORresource = environment.serviceORresource;
  projectName = environment.projectName;
  projectMail = environment.projectMail;
  serviceName = '';
  firstServiceForm = false;
  showLoader = false;
  pendingService = false;
  providerId: string;
  editMode: boolean;
  hasChanges = false;
  serviceForm: FormGroup;
  provider: Provider;
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
  requiredOnTab5 = 4;
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

  allRequiredFields = 21;
  loaderBitSet = new BitSet;
  loaderPercentage = 0;

  readonly nameDesc: sd.Description = sd.serviceDescMap.get('nameDesc');
  readonly webpageDesc: sd.Description = sd.serviceDescMap.get('webpageDesc');
  readonly descriptionDesc: sd.Description = sd.serviceDescMap.get('descriptionDesc');
  readonly taglineDesc: sd.Description = sd.serviceDescMap.get('taglineDesc');
  readonly logoDesc: sd.Description = sd.serviceDescMap.get('logoDesc');
  readonly multimediaDesc: sd.Description = sd.serviceDescMap.get('multimediaDesc');
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
  readonly useCasesDesc: sd.Description = sd.serviceDescMap.get('useCasesDesc');


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
    // scientificDomain : this.fb.array([]),
    // scientificSubdomains: this.fb.array([]),
    // categories: this.fb.array([]),
    // subcategories: this.fb.array([]),
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

    categories: this.fb.array([], Validators.required),
    scientificDomains: this.fb.array([], Validators.required)
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
              protected authenticationService: AuthenticationService,
              protected serviceProviderService: ServiceProviderService,
              protected route: ActivatedRoute
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

    if (!tempSave) {
      this.getFieldAsFormArray('categories').controls = [];
      this.getFieldAsFormArray('scientificDomains').controls = [];
    }

    // for (const category of this.categoryArray.controls) {
    //   if (category.get('subcategory').value) {
    //     this.getFieldAsFormArray('category').push(this.fb.control(category.get('category').value));
    //     this.getFieldAsFormArray('subcategory').push(this.fb.control(category.get('subcategory').value));
    //   }
    // }

    // for (const scientificDomain of this.scientificDomainArray.controls) {
    //   if (scientificDomain.get('scientificSubdomain').value) {
    //     this.getFieldAsFormArray('scientificDomain').push(this.fb.control(scientificDomain.get('scientificDomain').value));
    //     this.getFieldAsFormArray('scientificSubdomain').push(this.fb.control(scientificDomain.get('scientificSubdomain').value));
    //   }
    // }

    // this.scientificDomainArray.disable();
    this.showLoader = true;
    // console.log('this.serviceForm.valid ', this.serviceForm.valid);
    // console.log('Submitted service --> ', service);
    // console.log('Submitted service value--> ', this.serviceForm.value);
    if (tempSave) {
      // todo add fix hear
      this.resourceService[(pendingService || !this.editMode) ? 'uploadTempPendingService' : 'uploadTempService']
      (this.serviceForm.value).subscribe(
        _service => {
          // console.log(_service);
          this.showLoader = false;
          // return this.router.dashboardDraftResources(this.providerId); // redirect to draft list
          return this.router.go('/provider/' + _service.resourceOrganisation + '/draft-resource/update/' + _service.id);
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
          if (this.projectName === 'OpenAIRE Catalogue') {
            return this.router.service(_service.id);  // redirect to service-landing-page
          } else {
            return this.router.resourceDashboard(this.providerId, _service.id);  // redirect to resource-dashboard
            // return this.router.dashboardResources(this.providerId);                  // redirect to provider dashboard -> resource list
            // return this.router.dashboard(this.providerId);                          // redirect to provider dashboard
            // return this.router.service(_service.id);                               // redirect to old service info page
            // return window.location.href = this._marketplaceBaseURL + _service.id; // redirect to marketplace
          }
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
        this.premiumSort.transform(this.geographicalVocabulary, ['Europe', 'Worldwide']);
        this.premiumSort.transform(this.languagesVocabulary, ['English']);
        this.providersPage.results.sort((a, b) => 0 - (a.name > b.name ? -1 : 1));

        // fixme: should simplify if-else statement but route.snapshot.paramMap is empty for aire
        if (this.projectName === 'OpenAIRE Catalogue') {
          this.providerId = 'openaire';
        } else {
          this.providerId = this.route.snapshot.paramMap.get('providerId');
        }

        this.serviceForm.get('resourceOrganisation').setValue(this.providerId);
        this.handleBitSets(0, 1, 'resourceOrganisation');

        if (!this.editMode) { // prefill main contact info
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
    const arr = [];
    for (const i in input) {
      arr.push({
        'name' : input[i][0].resourceOrganisation + ' - ' + input[i][0].name,
        'id' : input[i][0].id
      });
    }
    return arr;

    // return Object.keys(input).reduce((accumulator, value) => {
    //   accumulator[value] = input[value][0].resourceOrganisation + ' - ' + input[value][0].name;
    //   return accumulator;
    // }, {});
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
    this.tabs[2] = (this.checkEveryArrayFieldValidity('scientificDomains', 'scientificDomain')
      || this.checkEveryArrayFieldValidity('scientificDomains', 'scientificSubdomain')
      || this.checkEveryArrayFieldValidity('categories', 'category')
      || this.checkEveryArrayFieldValidity('categories', 'subcategory')
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
    if (richService.service.categories) {
      for (let i = 0; i < richService.service.categories.length; i++) {
        this.categoryArray.push(this.newCategory());
        this.categoryArray.controls[this.categoryArray.length - 1].get('category').setValue(richService.service.categories[i].category);
        this.categoryArray.controls[this.categoryArray.length - 1].get('subcategory').setValue(richService.service.categories[i].subcategory);
      }
    } else {
      this.categoryArray.push(this.newCategory());
    }

    this.removeScientificDomain(0);
    if (richService.service.scientificDomains) {
      for (let i = 0; i < richService.service.scientificDomains.length; i++) {
        this.scientificDomainArray.push(this.newScientificDomain());
        this.scientificDomainArray.controls[this.scientificDomainArray.length - 1]
          .get('scientificDomain').setValue(richService.service.scientificDomains[i].scientificDomain);
        this.scientificDomainArray.controls[this.scientificDomainArray.length - 1]
          .get('scientificSubdomain').setValue(richService.service.scientificDomains[i].scientificSubdomain);
      }
    } else {
      this.scientificDomainArray.push(this.newScientificDomain());
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

  unsavedChangesPrompt() {
    this.hasChanges = true;
  }

  /** BitSets -->**/
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

  /** <--BitSets **/

  /** URL Validation--> **/
  checkUrlValidity(formControlName: string) {
    let urlValidity;
    if (this.serviceForm.get(formControlName).valid && this.serviceForm.get(formControlName).value !== '') {
      // if (this.newProviderForm.get(formControlName).value !== '') {
      const url = this.serviceForm.get(formControlName).value;
      console.log(url);
      this.serviceProviderService.validateUrl(url).subscribe(
        boolean => { urlValidity = boolean; },
        error => { console.log(error); },
        () => {
          if (!urlValidity) {
            console.log('invalid');
            window.scrollTo(0, 0);
            this.errorMessage = url + ' is not a valid URL. Please enter a valid URL.';
          }
        }
      );
    }
  }

  checkUrlValidityForArrays(formArrayName: string, position: number) {
    let urlValidity;
    // console.log(this.serviceForm.get(formArrayName).value[position]);
    if (this.serviceForm.get(formArrayName).value[position] !== '') {
      const url = this.serviceForm.get(formArrayName).value[position];
      console.log(url);
      this.serviceProviderService.validateUrl(url).subscribe(
        boolean => { urlValidity = boolean; },
        error => { console.log(error); },
        () => {
          if (!urlValidity) {
            console.log('invalid');
            window.scrollTo(0, 0);
            this.errorMessage = url + ' is not a valid ' + formArrayName + ' URL. Please enter a valid URL.';
          }
        }
      );
    }
  }

  /** <--URL Validation **/

  openPreviewModal() {
    // console.log('Resource ==>', this.serviceForm.value);
    UIkit.modal('#modal-preview').show();
  }
}
