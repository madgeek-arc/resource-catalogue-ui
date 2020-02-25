import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Component, Injector, OnInit} from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {NavigationService} from '../../services/navigation.service';
import {ResourceService} from '../../services/resource.service';
import {UserService} from '../../services/user.service';
import * as sd from './services.description';
import {Vocabulary, Service, VocabularyType} from '../../domain/eic-model';
import {IndicatorsPage} from '../../domain/indicators';
import {FundersPage, ProvidersPage} from '../../domain/funders-page';
import {URLValidator} from '../../shared/validators/generic.validator';
import {zip} from 'rxjs/internal/observable/zip';
import {PremiumSortPipe} from '../../shared/pipes/premium-sort.pipe';
import {FunderService} from '../../services/funder.service';

@Component({
  selector: 'app-service-form',
  templateUrl: './service-form.component.html',
  styleUrls: ['../serviceprovider/service-provider-form.component.css']
})
export class ServiceFormComponent implements OnInit {
  serviceName = 'eInfraCentral';
  firstServiceForm = false;
  showLoader = false;
  providerId: string;
  editMode: boolean;
  serviceForm: FormGroup;
  service: Service;
  serviceID: string;
  errorMessage = '';
  successMessage: string = null;
  weights: string[] = [];
  tabs: boolean[] = [false, false, false, false, false, false, false, false, false];
  fb: FormBuilder = this.injector.get(FormBuilder);

  measurementForm: FormGroup;
  places: Vocabulary[] = null;
  public indicators: IndicatorsPage;
  public indicatorDesc = '';

  readonly nameDesc: sd.Description = sd.nameDesc;
  readonly leadProviderNameDesc: sd.Description = sd.leadProviderNameDesc;
  readonly contributingProvidersDesc: sd.Description = sd.contributingProvidersDesc;
  readonly webpageDesc: sd.Description = sd.webpageDesc;
  readonly descriptionDesc: sd.Description = sd.descriptionDesc;
  readonly taglineDesc: sd.Description = sd.taglineDesc;
  readonly logoDesc: sd.Description = sd.logoDesc;
  readonly multimediaDesc: sd.Description = sd.multimediaDesc;
  readonly targetUsersDesc: sd.Description = sd.targetUsersDesc;
  readonly targetCustomerTagsDesc: sd.Description = sd.targetCustomerTagsDesc;
  readonly useCasesCaseStudiesDesc: sd.Description = sd.useCasesCaseStudiesDesc;
  readonly optionsDesc: sd.Description = sd.optionsDesc;
  readonly providersDesc: sd.Description = sd.providersDesc;
  readonly scientificDomainDesc: sd.Description = sd.scientificDomainDesc;
  readonly scientificSubDomainDesc: sd.Description = sd.scientificSubDomainDesc;
  readonly categoryDesc: sd.Description = sd.categoryDesc;
  readonly subcategoryDesc: sd.Description = sd.subcategoryDesc;
  readonly tagsDesc: sd.Description = sd.tagsDesc;
  readonly geographicalAvailabilityDesc: sd.Description = sd.geographicalAvailabilityDesc;
  readonly languageDesc: sd.Description = sd.languageDesc;
  readonly mainContactFirstNameDesc: sd.Description = sd.mainContactFirstNameDesc;
  readonly mainContactLastNameDesc: sd.Description = sd.mainContactLastNameDesc;
  readonly mainContactEmailDesc: sd.Description = sd.mainContactEmailDesc;
  readonly mainContactPhoneDesc: sd.Description = sd.mainContactPhoneDesc;
  readonly mainContactPositionDesc: sd.Description = sd.mainContactPositionDesc;
  readonly publicContactFirstNameDesc: sd.Description = sd.publicContactFirstNameDesc;
  readonly publicContactLastNameDesc: sd.Description = sd.publicContactLastNameDesc;
  readonly publicContactEmailDesc: sd.Description = sd.publicContactEmailDesc;
  readonly publicContactPhoneDesc: sd.Description = sd.publicContactPhoneDesc;
  readonly publicContactPositionDesc: sd.Description = sd.publicContactPositionDesc;
  readonly heldeskEmailDesc: sd.Description = sd.heldeskEmailDesc;
  readonly quotationEmailDesc: sd.Description = sd.quotationEmailDesc;
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
  readonly helpdeskDesc: sd.Description = sd.helpdeskDesc;
  readonly userManualDesc: sd.Description = sd.userManualDesc;
  readonly adminManualDesc: sd.Description = sd.adminManualDesc;
  readonly termsOfUseDesc: sd.Description = sd.termsOfUseDesc;
  readonly privacyPolicyDesc: sd.Description = sd.privacyPolicyDesc;
  readonly serviceLevelAgreementDesc: sd.Description = sd.serviceLevelAgreementDesc;
  readonly trainingInformationDesc: sd.Description = sd.trainingInformationDesc;
  readonly statusMonitoringDesc: sd.Description = sd.statusMonitoringDesc;
  readonly maintenanceDesc: sd.Description = sd.maintenanceDesc;
  readonly orderTypeDesc: sd.Description = sd.orderTypeDesc;
  readonly orderDesc: sd.Description = sd.orderDesc;
  readonly endpointDesc: sd.Description = sd.endpointDesc;
  readonly accessTypesDesc: sd.Description = sd.accessTypeDesc;
  readonly accessModesDesc: sd.Description = sd.accessModeDesc;
  readonly accessPolicyDesc: sd.Description = sd.accessPolicyDesc;
  readonly paymentModelDesc: sd.Description = sd.paymentModelDesc;
  readonly pricingDesc: sd.Description = sd.pricingDesc;
  readonly userValueDesc: sd.Description = sd.userValueDesc;
  readonly userBaseDesc: sd.Description = sd.userBaseDesc;
  readonly useCasesDesc: sd.Description = sd.useCasesDesc;
  readonly fundersDesc: sd.Description = sd.fundersDesc;
  readonly aggregatedServicesDesc: sd.Description = sd.aggregatedServicesDesc;
  readonly datasetsDesc: sd.Description = sd.datasetsDesc;
  readonly applicationsDesc: sd.Description = sd.applicationsDesc;
  readonly softwareDesc: sd.Description = sd.softwareDesc;
  readonly publicationsDesc: sd.Description = sd.publicationsDesc;
  readonly otherProductsDesc: sd.Description = sd.otherProductsDesc;

  readonly optionsNameDesc: sd.Description = sd.optionsNameDesc;
  readonly optionsWebpageDesc: sd.Description = sd.optionsWebpageDesc;
  readonly optionsDescriptionDesc: sd.Description = sd.optionsDescriptionDesc;
  readonly optionsLogoDesc: sd.Description = sd.optionsLogoDesc;

  readonly firstContactFirstNameDesc: sd.Description = sd.firstContactFirstNameDesc;
  readonly firstContactLastNameDesc: sd.Description = sd.firstContactLastNameDesc;
  readonly firstContactEmailDesc: sd.Description = sd.firstContactEmailDesc;
  readonly firstContactTelephoneDesc: sd.Description = sd.firstContactTelephoneDesc;
  readonly firstContactPositionDesc: sd.Description = sd.firstContactPositionDesc;
  readonly secondContactFirstNameDesc: sd.Description = sd.secondContactFirstNameDesc;
  readonly secondContactLastNameDesc: sd.Description = sd.secondContactLastNameDesc;
  readonly secondContactEmailDesc: sd.Description = sd.secondContactEmailDesc;
  readonly secondContactTelephoneDesc: sd.Description = sd.secondContactTelephoneDesc;
  readonly secondContactPositionDesc: sd.Description = sd.secondContactPositionDesc;
  readonly Attribute1Desc: sd.Description = sd.Attribute1Desc;
  readonly Attribute2Desc: sd.Description = sd.Attribute2Desc;
  readonly Attribute3Desc: sd.Description = sd.Attribute3Desc;


  formGroupMeta = {
    id: [''],
    name: ['', Validators.required],
    url: ['', Validators.compose([Validators.required, URLValidator])],
    description: ['', Validators.required],
    logo: ['', Validators.compose([Validators.required, URLValidator])],
    tagline: [''],
    userValue: [''],
    userBaseList : this.fb.array([ this.fb.control('') ]),
    useCases : this.fb.array([ this.fb.control('') ]),
    multimediaUrls : this.fb.array([ this.fb.control('', URLValidator) ]),
    options : this.fb.array([this.newOption()]),
    endpoint: ['', URLValidator],
    requiredServices : this.fb.array([ this.fb.control('') ]),
    relatedServices : this.fb.array([ this.fb.control('') ]),
    relatedPlatforms : this.fb.array([ this.fb.control('') ]),
    providers : this.fb.array([ this.fb.control('', Validators.required)], Validators.required),
    // 'scientificDomains : this.fb.array([ this.fb.control('', Validators.required)], Validators.required),
    scientificSubdomains : this.fb.array([]),
    // 'category: [''],
    subcategories : this.fb.array([]),
    // 'supercategory: [''],
    targetUsers : this.fb.array([ this.fb.control('', Validators.required) ], Validators.required),
    languages : this.fb.array([ this.fb.control('', Validators.required) ], Validators.required),
    places : this.fb.array([ this.fb.control('', Validators.required) ], Validators.required),
    accessTypes :  this.fb.array([ this.fb.control('') ]),
    accessModes :  this.fb.array([ this.fb.control('') ]),
    funders : this.fb.array([ this.fb.control('') ]),
    tags : this.fb.array([ this.fb.control('') ]),
    phase: [''],
    trl: [''],
    version: [''],
    lastUpdate: [''],
    changeLog: [''],
    certifications :  this.fb.array([ this.fb.control('') ]),
    standards :  this.fb.array([ this.fb.control('') ]),
    orderType: ['', Validators.required],
    order: ['', URLValidator],
    sla: ['', URLValidator],
    termsOfUse: ['', URLValidator],
    privacyPolicy: ['', URLValidator],
    accessPolicy: ['', URLValidator],
    paymentModel: ['', URLValidator],
    pricing: ['', URLValidator],
    userManual: ['', URLValidator],
    adminManual: ['', URLValidator],
    training: ['', URLValidator],
    helpdesk: ['', URLValidator],
    monitoring: ['', URLValidator],
    maintenance: ['', URLValidator],
    contacts: this.fb.array([
      this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', Validators.required],
        tel: ['', Validators.required],
        position: [''],
      }, Validators.required)
    ]),
    // ownerName: [''],
    // ownerContact: ['', Validators.email],
    // supportName: [''],
    // supportContact: ['', Validators.email],
    // securityName: [''],
    // securityContact: ['', Validators.email],
    aggregatedServices: [''],
    datasets: [''],
    applications: [''],
    software: [''],
    publications: [''],
    otherProducts: [''],

    categorize : this.fb.array([ ], Validators.required),
    scientificCategorization : this.fb.array([ ], Validators.required)
  };

  multiMeasurementForm = {
    measurements: this.fb.array(
      [
        // this.createMeasurementField()
      ]
    )
  };

  providersPage: ProvidersPage;
  requiredServices: any;
  relatedServices: any;
  vocabularies: Map<string, Vocabulary[]> = null;
  premiumSort = new PremiumSortPipe();
  resourceService: ResourceService = this.injector.get(ResourceService);

  router: NavigationService = this.injector.get(NavigationService);
  userService: UserService = this.injector.get(UserService);

  public fundersVocabulary: FundersPage = null;
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
  public languagesVocabulary: Vocabulary[] = null;
  public languagesVocIdArray: string[] = [];

  constructor(protected injector: Injector,
              protected authenticationService: AuthenticationService,
              protected funderService: FunderService
  ) {
    this.resourceService = this.injector.get(ResourceService);
    this.fb = this.injector.get(FormBuilder);
    this.router = this.injector.get(NavigationService);
    this.userService = this.injector.get(UserService);
    this.serviceForm = this.fb.group(this.formGroupMeta);
    this.measurementForm = this.fb.group(this.multiMeasurementForm);
    this.weights[0] = this.authenticationService.user.email.split('@')[0];
  }

  onSubmit(service: Service, isValid: boolean, pendingService?: boolean) {
    if (!this.authenticationService.isLoggedIn()) {
      console.log('Submit');
      sessionStorage.setItem('service', JSON.stringify(this.serviceForm.value));
      this.authenticationService.login();
    }

    this.errorMessage = '';
    for (let i = 0; i < this.measurements.length; i++) {
      // console.log(i + ' = ' + this.measurements.controls[i].untouched);
      if (this.measurements.controls[i].untouched && this.measurements.controls[i].get('indicatorId').value === '') {
        this.removeFroMeasurements(i);
        continue;
      }
      this.measurements.controls[i].get('serviceId').setValue(service.id);
    }
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
    /** remove empty options in order to avoid validation conflict **/
    if (this.getFieldAsFormArray('options').length === 1) {
      if (this.getFieldAsFormArray('options').controls[0].get('name').value === ''
          && this.getFieldAsFormArray('options').controls[0].get('url').value === ''
          && this.getFieldAsFormArray('options').controls[0].get('description').value === '') {
        this.remove('options', 0);
      }
    }
    this.scientificDomainArray.disable();
    if (this.serviceForm.valid && this.measurementForm.valid) {
      this.showLoader = true;
      window.scrollTo(0, 0);
      this.resourceService[pendingService ? 'uploadPendingService' : 'uploadServiceWithMeasurements'](this.serviceForm.value, this.measurements.value).subscribe(
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
          this.errorMessage = 'Something went bad, server responded: ' + err.error;
        }
      );
    } else {
      window.scrollTo(0, 0);

      this.categoryArray.enable();
      this.scientificDomainArray.enable();
      this.setAsTouched();
      this.markTabs();
      this.serviceForm.markAsDirty();
      this.serviceForm.updateValueAndValidity();
      this.tabs[8] = this.validateMeasurements();
      if (!this.serviceForm.valid) {
        this.errorMessage = 'Please fill in all required fields (marked with an asterisk), and fix the data format in fields underlined with a red colour.';
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
      this.resourceService.getServices(),
      this.funderService.getAllFunders('10000')
    ).subscribe(suc => {
        this.providersPage = <ProvidersPage>suc[0];
        this.vocabularies = <Map<string, Vocabulary[]>>suc[1];
        this.requiredServices = this.transformInput(suc[2]);
        this.relatedServices = this.requiredServices;
        this.fundersVocabulary = <FundersPage>suc[3];
        this.getIndicatorIds();
        // this.getLocations();
        this.targetUsersVocabulary = this.vocabularies[VocabularyType.TARGET_USERS];
        this.accessTypesVocabulary = this.vocabularies[VocabularyType.ACCESS_TYPE];
        this.accessModesVocabulary = this.vocabularies[VocabularyType.ACCESS_MODE];
        this.orderTypeVocabulary = this.vocabularies[VocabularyType.ORDER_TYPE];
        this.phaseVocabulary = this.vocabularies[VocabularyType.PHASE];
        this.trlVocabulary = this.vocabularies[VocabularyType.TRL];
        this.superCategoriesVocabulary = this.vocabularies[VocabularyType.SUPERCATEGORY];
        this.categoriesVocabulary = this.vocabularies[VocabularyType.CATEGORY];
        this.subCategoriesVocabulary = this.vocabularies[VocabularyType.SUBCATEGORY];
        this.scientificDomainVocabulary = this.vocabularies[VocabularyType.SCIENTIFIC_DOMAIN];
        this.scientificSubDomainVocabulary = this.vocabularies[VocabularyType.SCIENTIFIC_SUBDOMAIN];
        this.placesVocabulary = this.vocabularies[VocabularyType.PLACE];
        this.languagesVocabulary = this.vocabularies[VocabularyType.LANGUAGE];
        // this.placesVocIdArray = this.placesVocabulary.map(entry => entry.id);
        // this.languagesVocIdArray = this.languagesVocabulary.map(entry => entry.id);
      },
      error => {
        this.errorMessage = 'Something went bad while getting the data for page initialization. ' + error.error;
      },
      () => {
        this.premiumSort.transform(this.placesVocabulary, ['Europe', 'World']);
        this.premiumSort.transform(this.languagesVocabulary, ['English']);
        this.fundersVocabulary.results.sort((a, b) => 0 - (a.fundingOrganisation > b.fundingOrganisation ? -1 : 1));
        this.providersPage.results.sort((a, b) => 0 - (a.name > b.name ? -1 : 1));
      }
    );

    this.pushCategory();
    this.pushScientificDomain();
    this.pushToMeasurements();

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
              } else if (i === 'options') {
                this.pushOption();
              } else if ( i === 'providers' || i === 'targetUsers' || i === 'places' || i === 'languages') {
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
      accumulator[value] = input[value][0].providers[0] + ' - ' + input[value][0].name;
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
      return !this.getFieldAsFormArray(name).get([position]).get(groupName).valid && this.getFieldAsFormArray(name).get([position]).get(groupName).dirty;
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
    this.tabs[0] = (this.checkFormValidity('name') || this.checkFormValidity('url') || this.checkFormValidity('url')
      || this.checkFormValidity('logo') || this.checkEveryArrayFieldValidity('multimediaUrls') || this.checkFormValidity('tagline')
      || this.checkFormValidity('userValue') || this.checkEveryArrayFieldValidity('userBaseList')
      || this.checkEveryArrayFieldValidity('useCases') || this.checkFormValidity('endpoint')
      || this.checkEveryArrayFieldValidity('options', 'name') || this.checkEveryArrayFieldValidity('options', 'url')
      || this.checkEveryArrayFieldValidity('options', 'description') || this.checkEveryArrayFieldValidity('options', 'logo')
      || this.checkEveryArrayFieldValidity('options', 'contacts', 'firstName')
      || this.checkEveryArrayFieldValidity('options', 'contacts', 'lastName')
      || this.checkEveryArrayFieldValidity('options', 'contacts', 'email')
      || this.checkEveryArrayFieldValidity('options', 'contacts', 'tel')
      || this.checkEveryArrayFieldValidity('options', 'contacts', 'position'));
    this.tabs[1] = (this.checkEveryArrayFieldValidity('providers') || this.checkEveryArrayFieldValidity('scientificCategorization', 'scientificDomain')
      || this.checkEveryArrayFieldValidity('scientificCategorization', 'scientificSubDomain')
      || this.checkEveryArrayFieldValidity('categorize', 'category') || this.checkEveryArrayFieldValidity('categorize', 'subcategory')
      || this.checkEveryArrayFieldValidity('targetUsers') || this.checkEveryArrayFieldValidity('languages')
      || this.checkEveryArrayFieldValidity('places') || this.checkEveryArrayFieldValidity('accessTypes')
      || this.checkEveryArrayFieldValidity('accessModes') || this.checkEveryArrayFieldValidity('funders')
      || this.checkEveryArrayFieldValidity('tags'));
    this.tabs[2] = (this.checkFormValidity('phase') || this.checkFormValidity('trl') || this.checkFormValidity('version')
      || this.checkFormValidity('lastUpdate') || this.checkFormValidity('changeLog')
      || this.checkEveryArrayFieldValidity('certifications') || this.checkEveryArrayFieldValidity('certifications'));
    this.tabs[3] = (this.checkFormValidity('orderType') || this.checkFormValidity('order') || this.checkFormValidity('sla')
      || this.checkFormValidity('certifications') || this.checkFormValidity('privacyPolicy') || this.checkFormValidity('accessPolicy')
      || this.checkFormValidity('paymentModel') || this.checkFormValidity('pricing'));
    this.tabs[4] = (this.checkFormValidity('userManual') || this.checkFormValidity('adminManual') || this.checkFormValidity('training')
      || this.checkFormValidity('helpdesk') || this.checkFormValidity('monitoring') || this.checkFormValidity('maintenance'));
    this.tabs[5] = (this.checkEveryArrayFieldValidity('contacts', 'firstName')
      || this.checkEveryArrayFieldValidity('contacts', 'lastName') || this.checkEveryArrayFieldValidity('contacts', 'email')
      || this.checkEveryArrayFieldValidity('contacts', 'tel') || this.checkEveryArrayFieldValidity('contacts', 'position'));
    this.tabs[6] = (this.checkEveryArrayFieldValidity('requiredServices')
      || this.checkEveryArrayFieldValidity('relatedServices') || this.checkEveryArrayFieldValidity('relatedPlatforms'));
    this.tabs[7] = (this.checkFormValidity('aggregatedServices') || this.checkFormValidity('datasets')
      || this.checkFormValidity('applications') || this.checkFormValidity('software')
      || this.checkFormValidity('publications') || this.checkFormValidity('otherProducts'));

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

  // onSuperCategoryChange(index: number) {
  //   this.categoryArray.controls[index].get('category').reset();
  //   this.categoryArray.controls[index].get('category').enable();
  //   this.categoryArray.controls[index].get('subcategory').reset();
  //   this.categoryArray.controls[index].get('subcategory').disable();
  // }

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

  get contactArray() {
    return this.serviceForm.get('contacts') as FormArray;
  }

  pushContactServiceForm() {
    this.contactArray.push(this.newContact());
  }

  removeContactServiceForm(index: number) {
    this.contactArray.removeAt(index);
  }
  /** <--Service Contact Info **/

  /** Options-->**/
  newOption(): FormGroup {
    return this.fb.group({
      // id: [''],
      name: ['', Validators.required],
      url: ['', Validators.compose([Validators.required, URLValidator])],
      description: ['', Validators.required],
      logo: ['', URLValidator],
      contacts: this.fb.array([
        this.fb.group({
          firstName: ['', Validators.required],
          lastName: ['', Validators.required],
          email: ['', Validators.required],
          tel: ['', Validators.required],
          position: [''],
        }, Validators.required)
      ]),
      attributes: this.fb.array([
        this.fb.control(''),
        this.fb.control(''),
        this.fb.control(''),
      ])
    });
  }

  pushOption() {
    this.getFieldAsFormArray('options').push(this.newOption());
  }

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

  /** <--Options**/

  /** INDICATORS --> **/
  createMeasurementField(): FormGroup {
    return this.fb.group({
      id: '',
      indicatorId: ['', Validators.required],
      serviceId: ['', Validators.required],
      time: ['', Validators.required],
      locations: this.fb.array([
        this.fb.control('', Validators.required)
      ], Validators.required),
      valueIsRange: ['false', Validators.required],
      value: ['', Validators.required],
      rangeValue: this.fb.group({
        fromValue: ['', Validators.required],
        toValue: ['', Validators.required]
      })
    });
  }

  get measurements() {
    return this.measurementForm.get('measurements') as FormArray;
  }

  pushToMeasurements() {
    this.measurements.push(this.createMeasurementField());
    this.measurements.controls[this.measurements.length - 1].get('time').disable();
    this.measurements.controls[this.measurements.length - 1].get('locations').disable();
    // this.measurements.controls[this.measurements.length - 1].get('value').disable();
    this.measurements.controls[this.measurements.length - 1].get('rangeValue').disable();
  }

  removeFroMeasurements(index: number) {
    this.measurements.removeAt(index);
  }

  locations(i: number) {
    return this.measurements.controls[i].get('locations') as FormArray;
  }

  pushToLocations(i: number) {
    this.locations(i).push(this.fb.control('', Validators.required));
  }

  removeFromLocations(i: number, locIndex: number) {
    this.locations(i).removeAt(locIndex);
  }

  onIndicatorSelect(event, index: number) {
    this.measurements.controls[index].get('locations').disable();
    this.measurements.controls[index].get('time').disable();
    // console.log(this.measurements.controls[index].get('indicatorId').value);
    if (event.target.value != null) {
      for (let i = 0; i < this.indicators.results.length; i++) {
        if (this.indicators.results[i].id === event.target.value) {
          // console.log(this.indicators.results[i].dimensions);
          this.indicatorDesc = this.indicators.results[i].description;
          for (let j = 0; j < this.indicators.results[i].dimensions.length; j++) {
            // console.log(this.indicators.results[i].dimensions[j]);
            this.measurements.controls[index].get(this.indicators.results[i].dimensions[j]).enable();
          }
          return;
        }
      }
      this.indicatorDesc = '';
    }
  }

  getIndicatorIds() {
    this.resourceService.getAllIndicators('indicator').subscribe(
      indicatorPage => this.indicators = indicatorPage,
      error => this.errorMessage = 'Could not get indicators. ' + error.error,
      () => {
        this.indicators.results.sort((a, b) => 0 - (a.id > b.id ? -1 : 1));
      }
    );
  }

  getLocations() {
    this.resourceService.getNewVocabulariesByType(VocabularyType.PLACE).subscribe(
      suc => {
        this.places = suc;
        this.placesVocabulary = this.places;
        this.placesVocIdArray = this.placesVocabulary.map(entry => entry.id);
      },
      error => this.errorMessage = 'Could not get places vocabulary. ' + error.error,
    );
  }

  handleChange(event, index: number) {
    if (event.target.value === 'false') {
      this.measurements.controls[index].get('rangeValue').disable();
      this.measurements.controls[index].get('rangeValue.fromValue').reset();
      this.measurements.controls[index].get('rangeValue.fromValue').disable();
      this.measurements.controls[index].get('rangeValue.toValue').reset();
      this.measurements.controls[index].get('rangeValue.toValue').disable();
      this.measurements.controls[index].get('value').enable();
      // this.measurements.controls[index].get('valueIsRange').setValue('false');
    } else {
      this.measurements.controls[index].get('rangeValue').enable();
      this.measurements.controls[index].get('value').disable();
      this.measurements.controls[index].get('value').reset();
      // this.measurements.controls[index].get('valueIsRange').setValue('true');
    }
  }

  validateMeasurements(): boolean {
    // console.log(this.measurements.controls.length);
    let error = false;
    for (let i = 0; i < this.measurements.controls.length; i++) {
      // console.log(this.measurements.controls[i]);
      for (const j in this.measurements.controls[i].value) {
        if (this.measurements.controls[i].value.hasOwnProperty(j)) {
          // console.log(this.measurements.controls[i].get(j).value);
          if (this.measurements.controls[i].get(j).value.constructor !== Array) {
            this.measurements.controls[i].get(j).markAsDirty();
            this.measurements.controls[i].get(j).updateValueAndValidity();
            error = error || (this.measurements.controls[i].get(j).valid && this.measurements.controls[i].get(j).dirty);
          }
        }
      }
      for (const j in this.locations(i).controls) {
        this.locations(i).controls[j].markAsDirty();
        this.locations(i).controls[j].updateValueAndValidity();
        error = error || (this.locations(i).controls[j].valid && this.locations(i).controls[j].dirty);
      }
      if (this.measurements.controls[i].get('valueIsRange').value) {
        this.measurements.controls[i].get('rangeValue.fromValue').markAsDirty();
        this.measurements.controls[i].get('rangeValue.fromValue').updateValueAndValidity();
        error = error || (this.measurements.controls[i].get('rangeValue.fromValue').valid
                          && this.measurements.controls[i].get('rangeValue.fromValue').dirty);
        this.measurements.controls[i].get('rangeValue.toValue').markAsDirty();
        this.measurements.controls[i].get('rangeValue.toValue').updateValueAndValidity();
        error = error || (this.measurements.controls[i].get('rangeValue.toValue').valid
          && this.measurements.controls[i].get('rangeValue.toValue').dirty);
      }
    }
    return error;
  }
  /** <-- INDICATORS **/

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

  downloadServiceFormPDF() {
    window.open('../../../assets/files/serviceForm.pdf', '_blank');
  }

}
