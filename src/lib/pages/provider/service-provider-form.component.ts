import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import * as dm from '../../shared/description.map';
import {AuthenticationService} from '../../services/authentication.service';
import {ServiceProviderService} from '../../services/service-provider.service';
import {ActivatedRoute, Router} from '@angular/router';
import {URLValidator} from '../../shared/validators/generic.validator';
import {Vocabulary, Type, Provider} from '../../domain/eic-model';
import {ResourceService} from '../../services/resource.service';
import BitSet from 'bitset';
import {environment} from '../../../environments/environment';
import {CatalogueService} from "../../services/catalogue.service";
import {pidHandler} from "../../shared/pid-handler/pid-handler.service";
import {NavigationService} from "../../services/navigation.service";

declare var UIkit: any;

@Component({
  selector: 'app-new-service-provider',
  templateUrl: './service-provider-form.component.html',
  styleUrls: ['./service-provider-form.component.css']
})
export class ServiceProviderFormComponent implements OnInit {

  _hasUserConsent = environment.hasUserConsent;
  serviceORresource = environment.serviceORresource;
  projectName = environment.projectName;
  projectMail = environment.projectMail;
  privacyPolicyURL = environment.privacyPolicyURL;
  catalogueId: string = 'eosc';
  providerId: string = null;
  displayedCatalogueName: string;
  providerName = '';
  errorMessage = '';
  userInfo = {sub:'', family_name: '', given_name: '', email: ''};
  providerForm: FormGroup;
  logoUrl = '';
  vocabularies: Map<string, Vocabulary[]> = null;
  subVocabularies: Map<string, Vocabulary[]> = null;
  edit = false;
  hasChanges = false;
  pendingProvider = false;
  disable = false;
  showLoader = false;
  tabs: boolean[] = [false, false, false, false, false, false, false, false];
  isPortalAdmin = false;

  requiredOnTab0 = 4;
  requiredOnTab1 = 2;
  requiredOnTab3 = 4;
  requiredOnTab4 = 2;
  requiredOnTab8 = 1;

  remainingOnTab0 = this.requiredOnTab0;
  remainingOnTab1 = this.requiredOnTab1;
  remainingOnTab3 = this.requiredOnTab3;
  remainingOnTab4 = this.requiredOnTab4;
  remainingOnTab8 = this.requiredOnTab8;

  BitSetTab0 = new BitSet;
  BitSetTab1 = new BitSet;
  BitSetTab3 = new BitSet;
  BitSetTab4 = new BitSet;
  BitSetTab7 = new BitSet;

  requiredTabs = 5;
  completedTabs = 0;
  completedTabsBitSet = new BitSet;

  allRequiredFields = 17;
  loaderBitSet = new BitSet;
  loaderPercentage = 0;

  codeOfConduct = false;
  privacyPolicy = false;
  authorizedRepresentative = false;
  agreedToTerms: boolean;

  vocabularyEntryForm: FormGroup;
  suggestionsForm = {
    domainsVocabularyEntryValueName: '',
    categoriesVocabularyEntryValueName: '',
    placesVocabularyEntryValueName: '',
    providerLCSVocabularyEntryValueName: '',
    networksVocabularyEntryValueName: '',
    providerTypeVocabularyEntryValueName: '',
    esfriDomainVocabularyEntryValueName: '',
    esfriVocabularyEntryValueName: '',
    merilDomainsVocabularyEntryValueName: '',
    merilCategoriesVocabularyEntryValueName: '',
    areasOfActivityVocabularyEntryValueName: '',
    societalGrandChallengesVocabularyEntryValueName: '',
    vocabulary: '',
    errorMessage: '',
    successMessage: ''
  };

  commentControl = new FormControl();

  readonly fullNameDesc: dm.Description = dm.providerDescMap.get('fullNameDesc');
  readonly abbreviationDesc: dm.Description = dm.providerDescMap.get('abbreviationDesc');
  readonly websiteDesc: dm.Description = dm.providerDescMap.get('websiteDesc');
  readonly descriptionDesc: dm.Description = dm.providerDescMap.get('descriptionDesc');
  readonly logoDesc: dm.Description = dm.providerDescMap.get('logoDesc');
  readonly multimediaURLDesc: dm.Description = dm.providerDescMap.get('multimediaURLDesc');
  readonly multimediaNameDesc: dm.Description = dm.providerDescMap.get('multimediaNameDesc');
  readonly scientificDomainDesc: dm.Description = dm.providerDescMap.get('scientificDomainDesc');
  readonly scientificSubdomainsDesc: dm.Description = dm.providerDescMap.get('scientificSubdomainsDesc');
  readonly structureTypesDesc: dm.Description = dm.providerDescMap.get('structureTypesDesc');
  readonly participatingCountriesDesc: dm.Description = dm.providerDescMap.get('participatingCountriesDesc');
  readonly affiliationDesc: dm.Description = dm.providerDescMap.get('affiliationDesc');
  readonly tagsDesc: dm.Description = dm.providerDescMap.get('tagsDesc');
  readonly streetNameAndNumberDesc: dm.Description = dm.providerDescMap.get('streetNameAndNumberDesc');
  readonly postalCodeDesc: dm.Description = dm.providerDescMap.get('postalCodeDesc');
  readonly cityDesc: dm.Description = dm.providerDescMap.get('cityDesc');
  readonly regionDesc: dm.Description = dm.providerDescMap.get('regionDesc');
  readonly countryDesc: dm.Description = dm.providerDescMap.get('countryDesc');
  readonly mainContactFirstNameDesc: dm.Description = dm.providerDescMap.get('mainContactFirstNameDesc');
  readonly mainContactLastNameDesc: dm.Description = dm.providerDescMap.get('mainContactLastNameDesc');
  readonly mainContactEmailDesc: dm.Description = dm.providerDescMap.get('mainContactEmailDesc');
  readonly mainContactPhoneDesc: dm.Description = dm.providerDescMap.get('mainContactPhoneDesc');
  readonly mainContactPositionDesc: dm.Description = dm.providerDescMap.get('mainContactPositionDesc');
  readonly publicContactFirstNameDesc: dm.Description = dm.providerDescMap.get('publicContactFirstNameDesc');
  readonly publicContactLastNameDesc: dm.Description = dm.providerDescMap.get('publicContactLastNameDesc');
  readonly publicContactEmailDesc: dm.Description = dm.providerDescMap.get('publicContactEmailDesc');
  readonly publicContactPhoneDesc: dm.Description = dm.providerDescMap.get('publicContactPhoneDesc');
  readonly publicContactPositionDesc: dm.Description = dm.providerDescMap.get('publicContactPositionDesc');
  readonly certificationsDesc: dm.Description = dm.providerDescMap.get('certificationsDesc');
  readonly lifeCycleStatusDesc: dm.Description = dm.providerDescMap.get('lifeCycleStatusDesc');
  readonly ESFRIDomainDesc: dm.Description = dm.providerDescMap.get('ESFRIDomainDesc');
  readonly hostingLegalEntityDesc: dm.Description = dm.providerDescMap.get('hostingLegalEntityDesc');
  readonly ESFRITypeDesc: dm.Description = dm.providerDescMap.get('ESFRITypeDesc');
  readonly merilScientificDomainsDesc: dm.Description = dm.providerDescMap.get('merilScientificDomainsDesc');
  readonly merilScientificSubdomainsDesc: dm.Description = dm.providerDescMap.get('merilScientificSubdomainsDesc');
  readonly areasOfActivityDesc: dm.Description = dm.providerDescMap.get('areasOfActivityDesc');
  readonly societalGrandChallengesDesc: dm.Description = dm.providerDescMap.get('societalGrandChallengesDesc');
  readonly nationalRoadmapsDesc: dm.Description = dm.providerDescMap.get('nationalRoadmapsDesc');
  readonly legalEntityDesc: dm.Description = dm.providerDescMap.get('legalEntityDesc');
  readonly legalStatusDesc: dm.Description = dm.providerDescMap.get('legalStatusDesc');
  readonly networksDesc: dm.Description = dm.providerDescMap.get('networksDesc');
  readonly catalogueIdDesc: dm.Description = dm.providerDescMap.get('catalogueIdDesc');
  readonly altIdTypeDesc: dm.Description = dm.serviceDescMap.get('altIdTypeDesc');
  readonly altIdValueDesc: dm.Description = dm.serviceDescMap.get('altIdValueDesc');

  placesVocabulary: Vocabulary[] = null;
  providerTypeVocabulary: Vocabulary[] = null;
  providerLCSVocabulary: Vocabulary[] = null;
  domainsVocabulary: Vocabulary[] = null;
  categoriesVocabulary: Vocabulary[] = null;
  merilDomainsVocabulary: Vocabulary[] = null;
  merilCategoriesVocabulary: Vocabulary[] = null;
  esfriDomainVocabulary: Vocabulary[] = null;
  legalStatusVocabulary: Vocabulary[] = null;
  esfriVocabulary: Vocabulary[] = null;
  areasOfActivityVocabulary: Vocabulary[] = null;
  networksVocabulary: Vocabulary[] = null;
  societalGrandChallengesVocabulary: Vocabulary[] = null;
  hostingLegalEntityVocabulary: Vocabulary[] = null;

  readonly formDefinition = {
    id: [''],
    name: ['', Validators.required],
    abbreviation: ['', Validators.required],
    website: ['', Validators.compose([Validators.required, URLValidator])],
    legalEntity: [''],
    legalStatus: [''],
    hostingLegalEntity: [''],
    alternativeIdentifiers: this.fb.array([
      this.fb.group({
        type: [''],
        value: ['']
      })
    ]),
    description: ['', Validators.required],
    logo: ['', Validators.compose([Validators.required, URLValidator])],
    // multimedia: this.fb.array([this.fb.control('', URLValidator, urlAsyncValidator(this.serviceProviderService))]),
    // multimediaNames: this.fb.array([this.fb.control('')]),
    multimedia: this.fb.array([
      this.fb.group({
        multimediaURL: ['', Validators.compose([Validators.required, URLValidator])],
        multimediaName: ['']
      })
    ]),
    scientificDomains: this.fb.array([]),
    // scientificDomain: this.fb.array([]),
    // scientificSubdomains: this.fb.array([]),
    tags: this.fb.array([this.fb.control('')]),
    location: this.fb.group({
      streetNameAndNumber: ['', Validators.required],
      postalCode: ['', Validators.required],
      city: ['', Validators.required],
      region: [''],
      country: ['', Validators.required]
    }, Validators.required),
    mainContact: this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      phone: ['', Validators.pattern('^(((\\+)|(00))\\d{1,3}( )?)?((\\(\\d{3}\\))|\\d{3})[- .]?\\d{3}[- .]?\\d{4}$')],
      position: [''],
    }, Validators.required),
    publicContacts: this.fb.array([
      this.fb.group({
        firstName: [''],
        lastName: [''],
        email: ['', Validators.compose([Validators.required, Validators.email])],
        phone: ['', Validators.pattern('^(((\\+)|(00))\\d{1,3}( )?)?((\\(\\d{3}\\))|\\d{3})[- .]?\\d{3}[- .]?\\d{4}$')],
        position: [''],
      })
    ]),
    lifeCycleStatus: [''],
    certifications: this.fb.array([this.fb.control('')]),
    participatingCountries: this.fb.array([this.fb.control('')]),
    affiliations: this.fb.array([this.fb.control('')]),
    networks: this.fb.array([this.fb.control('')]),
    catalogueId: [''],
    structureTypes: this.fb.array([this.fb.control('')]),
    esfriDomains: this.fb.array([this.fb.control('')]),
    esfriType: [''],
    merilScientificDomains: this.fb.array([]),
    // merilScientificDomain: this.fb.array([]),
    // merilScientificSubdomains: this.fb.array([]),
    areasOfActivity: this.fb.array([this.fb.control('')]),
    societalGrandChallenges: this.fb.array([this.fb.control('')]),
    nationalRoadmaps: this.fb.array([this.fb.control('')]),
    users: this.fb.array([this.user()])
  };

  constructor(public fb: FormBuilder,
              public authService: AuthenticationService,
              public serviceProviderService: ServiceProviderService,
              public resourceService: ResourceService,
              public catalogueService: CatalogueService,
              public router: Router,
              public route: ActivatedRoute,
              public navigator: NavigationService,
              public pidHandler: pidHandler) {
  }

  ngOnInit() {

    const path = this.route.snapshot.routeConfig.path;
    if (path.includes('add/:providerId')) {
      this.pendingProvider = true;
    }
    // if (path.includes('view/:providerId')) {
    //   this.pendingProvider = true;
    // }
    this.setVocabularies();
    this.providerForm = this.fb.group(this.formDefinition);
    if (this.edit === false) {
      this.pushDomain();
      this.pushMerilDomain();
      this.addDefaultUser();  // Admin + mainContact
      // this.providerForm.get('legalEntity').setValue(false);
    }

    if (sessionStorage.getItem('provider')) {
      const data = JSON.parse(sessionStorage.getItem('provider'));
      for (const i in data) {
        if (data.hasOwnProperty(i)) {
          if (Array.isArray(data[i])) {
            // console.log(i);
            for (let j = 0; j < data[i].length - 1; j++) {
              if (i === 'scientificDomains') {
                this.domainArray.push(this.newScientificDomain());
              } else if (i === 'merilScientificDomains') {
                this.merilDomainArray.push(this.newMerilScientificDomain());
              } else if (i === 'publicContacts') {
                this.pushPublicContact();
              } else if (i === 'users') {
                this.addUser();
              } else if (i === 'structureTypes') {
                this.push(i, true);
              } else if (i === 'multimedia') {
                this.pushMultimedia();
              } else {
                this.push(i, false);
              }
            }
          }
        }
      }
      this.providerForm.patchValue(data);
      if (!this.edit) {
        sessionStorage.removeItem('provider');
      }
    }

    if (this._hasUserConsent && path !== 'view/:catalogueId/:providerId') {
      if (this.edit) {
        this.serviceProviderService.hasAdminAcceptedTerms(this.providerId, this.pendingProvider).subscribe(
          boolean => { this.agreedToTerms = boolean; },
          error => console.log(error),
          () => {
            if (!this.agreedToTerms) {
              UIkit.modal('#modal-consent').show();
            }
          }
        );
      } else {
        if (!this.agreedToTerms) {
          UIkit.modal('#modal-consent').show();
        }
      }
    }

    this.isPortalAdmin = this.authService.isAdmin();

    this.initUserBitSets(); // Admin + mainContact

    if(this.catalogueId == 'eosc') this.displayedCatalogueName = `| Catalogue: EOSC`
    else if(this.catalogueId) this.showCatalogueName(this.catalogueId)

    this.vocabularyEntryForm = this.fb.group(this.suggestionsForm);
  }

  registerProvider(tempSave: boolean) {
    // console.log('Submit');
    // console.log(this.commentControl.value);
    if (!this.authService.isLoggedIn()) {
      sessionStorage.setItem('provider', JSON.stringify(this.providerForm.value));
      this.authService.login();
    }

    this.errorMessage = '';
    // this.trimFormWhiteSpaces();
    const path = this.route.snapshot.routeConfig.path;
    let method;
    if (path === 'add/:providerId') {
      method = 'updateAndPublishPendingProvider';
    } else {
      method = this.edit ? 'updateServiceProvider' : 'createNewServiceProvider';
    }

    for (let i = 0; i < this.alternativeIdentifiersArray.length; i++) {
      if (this.alternativeIdentifiersArray.controls[i].get('value').value === ''
        || this.alternativeIdentifiersArray.controls[i].get('value').value === null) {
        this.removeAlternativeIdentifier(i);
      }
    }

    for (let i = 0; i < this.domainArray.length; i++) {
      if (this.domainArray.controls[i].get('scientificDomain').value === ''
        || this.domainArray.controls[i].get('scientificDomain').value === null) {
        this.removeDomain(i);
      }
    }

    for (let i = 0; i < this.merilDomainArray.length; i++) {
      if (this.merilDomainArray.controls[i].get('merilScientificDomain').value === ''
        || this.merilDomainArray.controls[i].get('merilScientificDomain').value === null) {
        // console.log(this.merilDomainArray.controls[i]);
        this.removeMerilDomain(i);
      }
    }

    for (let i = 0; i < this.multimediaArray.length; i++) {
      if (this.multimediaArray.controls[i].get('multimediaURL').value === ''
        || this.multimediaArray.controls[i].get('multimediaURL').value === null) {
        this.removeMultimedia(i);
      }
    }

    if (tempSave) {
      this.showLoader = true;
      window.scrollTo(0, 0);
      this.serviceProviderService.temporarySaveProvider(this.providerForm.value, (path !== 'add/:providerId' && this.edit))
        .subscribe(
          res => {
            this.showLoader = false;
            this.router.navigate([`/provider/add/${this.pidHandler.customEncodeURIComponent(res.id)}`]);
          },
          err => {
            this.showLoader = false;
            window.scrollTo(0, 0);
            this.errorMessage = 'Something went wrong. ' + JSON.stringify(err.error.message);
          },
          () => {
            this.showLoader = false;
          }
        );
    } else if (this.providerForm.valid) {
      this.showLoader = true;
      window.scrollTo(0, 0);

      this.serviceProviderService[method](this.providerForm.value, this.commentControl.value).subscribe(
        res => {
        },
        err => {
          this.showLoader = false;
          window.scrollTo(0, 0);
          this.errorMessage = 'Something went wrong. ' + JSON.stringify(err.error.message);
        },
        () => {
          this.showLoader = false;
          this.router.navigate(['/provider/my']);
        }
      );
    } else {
      // console.log(this.providerForm);
      this.markFormAsDirty();
      window.scrollTo(0, 0);
      this.markTabs();
      this.errorMessage = 'Please fill in all required fields (marked with an asterisk), ' +
        'and fix the data format in fields underlined with a red colour.';
    }
  }

  // empty fields can be removed from here when complete
  toServer(service: Provider): Provider {
    const ret = {};
    Object.entries(service).forEach(([name, values]) => {
      let newValues = values;
      // console.log(name);
      if (Array.isArray(values)) {
        newValues = [];
        values.forEach(e => {
          // console.log('is array');
          if (typeof e === 'string' || e instanceof String) {
            if (e !== '') {
              newValues.push(e.trim().replace(/\s\s+/g, ' '));
            }
          } else {
            // console.log('array with objects');
          }
        });
      } else if (typeof newValues === 'string' || newValues instanceof String) {
        newValues = newValues.trim().replace(/\s\s+/g, ' ');
      } else {
        // console.log('single object');
      }
      ret[name] = newValues;
    });
    // if ( (this.firstServiceForm === true) && this.providerId) {
    //   ret['providers'] = [];
    //   ret['providers'].push(this.providerId);
    // }
    return <Provider>ret;
  }

  /** check form fields and tabs validity--> **/
  checkFormValidity(name: string, edit: boolean): boolean {
    return (this.providerForm.get(name).invalid && (edit || this.providerForm.get(name).dirty));
  }

  checkFormArrayValidity(name: string, position: number, edit: boolean, groupName?: string): boolean {
    if (groupName) {
      return (this.getFieldAsFormArray(name).get([position]).get(groupName).invalid
        && (edit || this.getFieldAsFormArray(name).get([position]).get(groupName).dirty));
    }
    return (this.getFieldAsFormArray(name).get([position]).invalid
      && (edit || this.getFieldAsFormArray(name).get([position]).dirty));
  }

  checkEveryArrayFieldValidity(name: string, edit: boolean, groupName?: string): boolean {
    for (let i = 0; i < this.getFieldAsFormArray(name).length; i++) {
      if (groupName) {
        if (this.getFieldAsFormArray(name).get([i]).get(groupName).invalid
          && (edit || this.getFieldAsFormArray(name).get([i]).get(groupName).dirty)) {
          return true;
        }
      } else if (this.getFieldAsFormArray(name).get([i]).invalid
        && (edit || this.getFieldAsFormArray(name).get([i]).dirty)) {
        return true;
      }
    }
    return false;
  }

  markTabs() {
    this.tabs[0] = (this.checkFormValidity('name', this.edit)
      || this.checkFormValidity('abbreviation', this.edit)
      || this.checkFormValidity('website', this.edit)
      || this.checkEveryArrayFieldValidity('legalEntity', this.edit)
      || this.checkFormValidity('legalStatus', this.edit)
      || this.checkFormValidity('hostingLegalEntity', this.edit));
    this.tabs[1] = (this.checkFormValidity('description', this.edit)
      || this.checkFormValidity('logo', this.edit)
      || this.checkEveryArrayFieldValidity('multimedia', this.edit, 'multimediaURL')
      || this.checkEveryArrayFieldValidity('multimedia', this.edit, 'multimediaName'));
    this.tabs[2] = (this.checkEveryArrayFieldValidity('tags', this.edit)
      || this.checkEveryArrayFieldValidity('scientificDomains', this.edit, 'scientificDomain')
      || this.checkEveryArrayFieldValidity('scientificDomains', this.edit, 'scientificSubdomain')
      || this.checkEveryArrayFieldValidity('structureTypes', this.edit));
    this.tabs[3] = (this.checkFormValidity('location.streetNameAndNumber', this.edit)
      || this.checkFormValidity('location.postalCode', this.edit)
      || this.checkFormValidity('location.city', this.edit)
      || this.checkFormValidity('location.region', this.edit)
      || this.checkFormValidity('location.country', this.edit));
    this.tabs[4] = (this.checkFormValidity('mainContact.firstName', this.edit)
      || this.checkFormValidity('mainContact.lastName', this.edit)
      || this.checkFormValidity('mainContact.email', this.edit)
      || this.checkFormValidity('mainContact.phone', this.edit)
      || this.checkFormValidity('mainContact.position', this.edit)
      || this.checkEveryArrayFieldValidity('publicContacts', this.edit, 'firstName')
      || this.checkEveryArrayFieldValidity('publicContacts', this.edit, 'lastName')
      || this.checkEveryArrayFieldValidity('publicContacts', this.edit, 'email')
      || this.checkEveryArrayFieldValidity('publicContacts', this.edit, 'phone')
      || this.checkEveryArrayFieldValidity('publicContacts', this.edit, 'position'));
    this.tabs[5] = (this.checkFormValidity('lifeCycleStatus', this.edit)
      || this.checkEveryArrayFieldValidity('certifications', this.edit));
    this.tabs[6] = (this.checkEveryArrayFieldValidity('participatingCountries', this.edit)
      || this.checkEveryArrayFieldValidity('affiliations', this.edit)
      || this.checkEveryArrayFieldValidity('networks', this.edit)
      || this.checkEveryArrayFieldValidity('catalogueId', this.edit));
    this.tabs[7] = (this.checkEveryArrayFieldValidity('esfriDomains', this.edit)
      || this.checkFormValidity('esfriType', this.edit)
      || this.checkEveryArrayFieldValidity('merilScientificDomains', this.edit, 'merilScientificDomain')
      || this.checkEveryArrayFieldValidity('merilScientificDomains', this.edit, 'merilScientificSubdomain')
      || this.checkEveryArrayFieldValidity('areasOfActivity', this.edit)
      || this.checkEveryArrayFieldValidity('societalGrandChallenges', this.edit)
      || this.checkEveryArrayFieldValidity('nationalRoadmaps', this.edit));
    this.tabs[8] = (this.checkEveryArrayFieldValidity('users', this.edit, 'name')
      || this.checkEveryArrayFieldValidity('users', this.edit, 'surname')
      || this.checkEveryArrayFieldValidity('users', this.edit, 'email'));
  }

  /** check form fields and tabs validity--> **/

  /** get and set vocabularies **/
  setVocabularies() {
    this.resourceService.getAllVocabulariesByType().subscribe(
      res => {
        this.vocabularies = res;
        this.placesVocabulary = this.vocabularies[Type.COUNTRY];
        this.providerTypeVocabulary = this.vocabularies[Type.PROVIDER_STRUCTURE_TYPE];
        this.providerLCSVocabulary = this.vocabularies[Type.PROVIDER_LIFE_CYCLE_STATUS];
        this.domainsVocabulary = this.vocabularies[Type.SCIENTIFIC_DOMAIN];
        this.categoriesVocabulary = this.vocabularies[Type.SCIENTIFIC_SUBDOMAIN];
        this.merilDomainsVocabulary = this.vocabularies[Type.PROVIDER_MERIL_SCIENTIFIC_DOMAIN];
        this.merilCategoriesVocabulary = this.vocabularies[Type.PROVIDER_MERIL_SCIENTIFIC_SUBDOMAIN];
        this.esfriDomainVocabulary = this.vocabularies[Type.PROVIDER_ESFRI_DOMAIN];
        this.legalStatusVocabulary = this.vocabularies[Type.PROVIDER_LEGAL_STATUS];
        this.esfriVocabulary = this.vocabularies[Type.PROVIDER_ESFRI_TYPE];
        this.areasOfActivityVocabulary = this.vocabularies[Type.PROVIDER_AREA_OF_ACTIVITY];
        this.networksVocabulary = this.vocabularies[Type.PROVIDER_NETWORK];
        this.societalGrandChallengesVocabulary = this.vocabularies[Type.PROVIDER_SOCIETAL_GRAND_CHALLENGE];
        this.hostingLegalEntityVocabulary = this.vocabularies[Type.PROVIDER_HOSTING_LEGAL_ENTITY];
        return this.vocabularies;
      },
      error => console.log(JSON.stringify(error.error)),
      () => {
        let voc: Vocabulary[] = this.vocabularies[Type.SCIENTIFIC_SUBDOMAIN].concat(this.vocabularies[Type.PROVIDER_MERIL_SCIENTIFIC_SUBDOMAIN]);
        this.subVocabularies = this.groupByKey(voc, 'parentId');

        return this.vocabularies;
      }
    );
  }

  /** Categorization --> **/
  newScientificDomain(): FormGroup {
    return this.fb.group({
      scientificDomain: [''],
      scientificSubdomain: ['']
    });
  }

  get domainArray() {
    return this.providerForm.get('scientificDomains') as FormArray;
  }

  pushDomain() {
    this.domainArray.push(this.newScientificDomain());
    this.domainArray.controls[this.domainArray.length - 1].get('scientificSubdomain').disable();
  }

  removeDomain(index: number) {
    this.domainArray.removeAt(index);
  }

  onDomainChange(index: number) {
    this.domainArray.controls[index].get('scientificSubdomain').enable();
    this.domainArray.controls[index].get('scientificSubdomain').reset();
  }

  /** <-- Categorization **/

  /** MERIL scientificDomains --> **/
  newMerilScientificDomain(): FormGroup {
    return this.fb.group({
      merilScientificDomain: [''],
      merilScientificSubdomain: ['']
    });
  }

  get merilDomainArray() {
    return this.providerForm.get('merilScientificDomains') as FormArray;
  }

  pushMerilDomain() {
    this.merilDomainArray.push(this.newMerilScientificDomain());
    this.merilDomainArray.controls[this.merilDomainArray.length - 1].get('merilScientificSubdomain').disable();
  }

  removeMerilDomain(index: number) {
    this.merilDomainArray.removeAt(index);
  }

  onMerilDomainChange(index: number) {
    this.merilDomainArray.controls[index].get('merilScientificSubdomain').enable();
    this.merilDomainArray.controls[index].get('merilScientificSubdomain').reset();
  }

  /** <-- MERIL Categorization **/

  /** handle form arrays--> **/
  getFieldAsFormArray(field: string) {
    return this.providerForm.get(field) as FormArray;
  }

  remove(field: string, i: number) {
    this.getFieldAsFormArray(field).removeAt(i);
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

  /** <--handle form arrays**/

  /** Multimedia -->**/
  newMultimedia(): FormGroup {
    return this.fb.group({
      multimediaURL: ['', Validators.compose([Validators.required, URLValidator])],
      multimediaName: ['']
    });
  }

  get multimediaArray() {
    return this.providerForm.get('multimedia') as FormArray;
  }

  pushMultimedia() {
    this.multimediaArray.push(this.newMultimedia());
  }

  removeMultimedia(index: number) {
    this.multimediaArray.removeAt(index);
  }

  /** <--Multimedia**/

  /** Alternative Identifiers-->**/
  newAlternativeIdentifier(): FormGroup {
    return this.fb.group({
      type: [''],
      value: ['']
    });
  }

  get alternativeIdentifiersArray() {
    return this.providerForm.get('alternativeIdentifiers') as FormArray;
  }

  pushAlternativeIdentifier() {
    this.alternativeIdentifiersArray.push(this.newAlternativeIdentifier());
  }

  removeAlternativeIdentifier(index: number) {
    this.alternativeIdentifiersArray.removeAt(index);
  }
  /** <--Alternative Identifiers**/

  /** Contact Info -->**/
  newContact(): FormGroup {
    return this.fb.group({
      firstName: [''],
      lastName: [''],
      email: [''],
      phone: [''],
      position: ['']
    });
  }

  get publicContactArray() {
    return this.providerForm.get('publicContacts') as FormArray;
  }

  pushPublicContact() {
    this.publicContactArray.push(this.newContact());
  }

  removePublicContact(index: number) {
    this.publicContactArray.removeAt(index);
  }

  /** <--Contact Info **/

  /** User Array -->**/
  user(): FormGroup {
    return this.fb.group({
      email: ['', Validators.compose([Validators.required, Validators.email])],
      id: [''],
      name: ['', Validators.required],
      surname: ['', Validators.required]
    });
  }

  get usersArray() { // return form fields as array
    return this.providerForm.get('users') as FormArray;
  }

  addUser() {
    this.usersArray.push(this.user());
  }

  deleteUser(index) {
    if (this.usersArray.length === 1) {
      this.errorMessage = 'There must be at least one provider!';
      window.scrollTo(0, 0);
      return;
    }
    this.usersArray.removeAt(index);
  }

  addDefaultUser() {
    this.userInfo.sub = this.authService.getUserProperty('sub');
    this.userInfo.given_name = this.authService.getUserProperty('given_name');
    this.userInfo.family_name = this.authService.getUserProperty('family_name');
    this.userInfo.email = this.authService.getUserProperty('email');
    this.usersArray.controls[0].get('id').setValue(this.userInfo.sub);
    this.usersArray.controls[0].get('name').setValue(this.userInfo.given_name);
    this.usersArray.controls[0].get('surname').setValue(this.userInfo.family_name);
    this.usersArray.controls[0].get('email').setValue(this.userInfo.email);
    this.providerForm.controls['mainContact'].get('firstName').setValue(this.userInfo.given_name);
    this.providerForm.controls['mainContact'].get('lastName').setValue(this.userInfo.family_name);
    this.providerForm.controls['mainContact'].get('email').setValue(this.userInfo.email);
  }

  /** <-- User Array**/

  showLogoUrlModal() {
    if (this.providerForm && this.providerForm.get('logo').value) {
      this.logoUrl = this.providerForm.get('logo').value;
    }
    UIkit.modal('#logoUrlModal').show();
  }

  addLogoUrl(logoUrl: string) {
    UIkit.modal('#logoUrlModal').hide();
    this.logoUrl = logoUrl;
    this.providerForm.get('logo').setValue(logoUrl);
    this.providerForm.get('logo').updateValueAndValidity();
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

  markFormAsDirty() {
    for (const i in this.providerForm.controls) {
      for (const j in this.providerForm.controls[i].value) {
        // console.log(this.providerForm.controls[i].value);
        if (this.providerForm.controls[i].value.hasOwnProperty(j)) {
          if (this.providerForm.controls[i].get(j)) {
            if (this.providerForm.controls[i].get(j).value.constructor !== Array) {
              this.providerForm.controls[i].get(j).markAsDirty();
              this.providerForm.controls[i].get(j).markAsTouched();
            }
          }
        }
      }
      if (this.providerForm.controls[i].value.constructor === Array) {
        for (let j = 0; j < this.getFieldAsFormArray(i).controls.length; j++) {
          const keys = Object.keys(this.providerForm.controls[i].value[j]);
          for (let k = 0; k < keys.length; k++) {
            if (this.getFieldAsFormArray(i).controls[j].get(keys[k])) {
              this.getFieldAsFormArray(i).controls[j].get(keys[k]).markAsTouched();
              this.getFieldAsFormArray(i).controls[j].get(keys[k]).markAsDirty();
            }
          }
        }
      }
      this.providerForm.controls[i].markAsDirty();
    }
  }

  trimFormWhiteSpaces() {
    for (const i in this.providerForm.controls) {
      // console.log(i);
      if (this.providerForm.controls[i].value && this.providerForm.controls[i].value.constructor === Array) {

      } else if (this.providerForm.controls[i].value && (i === 'location' || i === 'mainContact')) {

      } else if (typeof this.providerForm.controls[i].value === 'boolean') {
        // console.log('skip boolean value');
      } else {
        // console.log('this.providerForm.controls[i].value: ', this.providerForm.controls[i].value);
        this.providerForm.controls[i].setValue(this.providerForm.controls[i].value.trim().replace(/\s\s+/g, ' '));
      }
    }
    for (let j = 0; j < this.providerForm.controls['users'].value.length; j++) {
      this.providerForm.controls['users'].value[j].email = this.providerForm.controls['users'].value[j].email
        .trim().replace(/\s\s+/g, ' ');
      this.providerForm.controls['users'].value[j].name = this.providerForm.controls['users'].value[j].name
        .trim().replace(/\s\s+/g, ' ');
      this.providerForm.controls['users'].value[j].surname = this.providerForm.controls['users'].value[j].surname
        .trim().replace(/\s\s+/g, ' ');
    }

    if (this.providerForm.controls['scientificDomains'] && this.providerForm.controls['scientificDomains'].value) {

      if (this.providerForm.controls['scientificDomains'].value.length === 1
        && !this.providerForm.controls['scientificDomains'].value[0].scientificDomain
        && !this.providerForm.controls['scientificDomains'].value[0].scientificSubdomain) {

        this.removeDomain(0);

      }
    }
    if (this.providerForm.controls['merilScientificDomains'] && this.providerForm.controls['merilScientificDomains'].value) {

      if (this.providerForm.controls['merilScientificDomains'].value.length === 1
        && !this.providerForm.controls['merilScientificDomains'].value[0].merilScientificDomain
        && !this.providerForm.controls['merilScientificDomains'].value[0].merilScientificSubdomain) {

        this.removeMerilDomain(0);

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
      for (let i = 0; i < this.domainArray.controls.length; i++) {
        for (let j = 0; j <  this.domainArray.controls.length; j++) {
          if (i !== j && this.domainArray.controls[i].get('scientificDomain').value === this.domainArray.controls[j].get('scientificDomain').value ) {
            if (this.domainArray.controls[i].get('scientificSubdomain').value === this.domainArray.controls[j].get('scientificSubdomain').value) {
              this.showNotification();
              return;
            }
          }
        }
      }
    } else if (group === 'merilScientificDomains') {
      for (let i = 0; i < this.merilDomainArray.controls.length; i++) {
        for (let j = 0; j <  this.merilDomainArray.controls.length; j++) {
          if (i !== j && this.merilDomainArray.controls[i].get('merilScientificDomain').value === this.merilDomainArray.controls[j].get('merilScientificDomain').value ) {
            if (this.merilDomainArray.controls[i].get('merilScientificSubdomain').value === this.merilDomainArray.controls[j].get('merilScientificSubdomain').value) {
              this.showNotification();
              return;
            }
          }
        }
      }
    } else {
      if (this.providerForm.get(formControlName).value.length > 1) {
        for (let i = 0; i < this.providerForm.get(formControlName).value.length; i++) {
          for (let j = 0; j < this.providerForm.get(formControlName).value.length; j++) {
            if (i !== j && this.providerForm.get(formControlName).value[i] === this.providerForm.get(formControlName).value[j]) {
              this.showNotification();
              return;
            }
          }
        }
      }
    }
  }

  /** BitSets -->**/
  handleBitSets(tabNum: number, bitIndex: number, formControlName: string): void {
    if (bitIndex === 0) {
      this.providerName = this.providerForm.get(formControlName).value;
    }
    if (this.providerForm.get(formControlName).valid || (this.providerForm.get(formControlName).disabled && this.providerForm.get(formControlName).value != '')) {
      this.decreaseRemainingFieldsPerTab(tabNum, bitIndex);
      this.loaderBitSet.set(bitIndex, 1);
    } else if (this.providerForm.get(formControlName).invalid) {
      this.increaseRemainingFieldsPerTab(tabNum, bitIndex);
      this.loaderBitSet.set(bitIndex, 0);
    } else if (this.providerForm.get(formControlName).pending) {
      this.timeOut(300).then( () => this.handleBitSets(tabNum, bitIndex, formControlName));
      return;
    }
    this.updateLoaderPercentage();
  }

  handleBitSetsOfGroups(tabNum: number, bitIndex: number, formControlName: string, group?: string): void {
    if (this.providerForm.controls[group].get(formControlName).valid || (this.providerForm.controls[group].get(formControlName).disabled && this.providerForm.controls[group].get(formControlName).value != '')) {
      this.decreaseRemainingFieldsPerTab(tabNum, bitIndex);
      this.loaderBitSet.set(bitIndex, 1);
    } else if (this.providerForm.controls[group].get(formControlName).invalid) {
      this.increaseRemainingFieldsPerTab(tabNum, bitIndex);
      this.loaderBitSet.set(bitIndex, 0);
    }
    this.updateLoaderPercentage();
  }

  handleBitSetsOfPublicContact(tabNum: number, bitIndex: number, formControlName: string, group?: string): void {
    if (this.providerForm.get(group).value[0][formControlName] !== '' && this.providerForm.controls[group].valid || this.providerForm.controls[group].disabled) {
      this.decreaseRemainingFieldsPerTab(tabNum, bitIndex);
      this.loaderBitSet.set(bitIndex, 1);
    } else {
      this.increaseRemainingFieldsPerTab(tabNum, bitIndex);
      this.loaderBitSet.set(bitIndex, 0);
    }
    this.updateLoaderPercentage();
  }

  handleBitSetsOfUsers(tabNum: number, bitIndex: number, formControlName: string, group?: string): void {
    if (this.providerForm.get(group).value[0][formControlName] !== '') {
      this.decreaseRemainingFieldsPerTab(tabNum, bitIndex);
      this.loaderBitSet.set(bitIndex, 1);
    } else {
      this.increaseRemainingFieldsPerTab(tabNum, bitIndex);
      this.loaderBitSet.set(bitIndex, 0);
    }
    this.updateLoaderPercentage();
  }

  initUserBitSets() {
    this.handleBitSetsOfUsers(7, 12, 'name', 'users');
    this.handleBitSetsOfUsers(7, 13, 'surname', 'users');
    this.handleBitSetsOfUsers(7, 14, 'email', 'users');
    this.handleBitSetsOfGroups(4, 9, 'firstName', 'mainContact');
    this.handleBitSetsOfGroups(4, 10, 'lastName', 'mainContact');
    this.handleBitSetsOfGroups(4, 11, 'email', 'mainContact');
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
    } else if (tabNum === 3) { // Location
      this.BitSetTab3.set(bitIndex, 1);
      this.remainingOnTab3 = this.requiredOnTab3 - this.BitSetTab3.cardinality();
      if (this.remainingOnTab3 === 0 && this.completedTabsBitSet.get(tabNum) !== 1) {
        this.calcCompletedTabs(tabNum, 1);
      }
    } else if (tabNum === 4) { // Contact
      this.BitSetTab4.set(bitIndex, 1);
      const mainContactCardinality = this.BitSetTab4.slice(9, 11).cardinality();
      this.remainingOnTab4 = this.requiredOnTab4 - +(mainContactCardinality === 3) - this.BitSetTab4.get(15);
      if (this.remainingOnTab4 === 0 && this.completedTabsBitSet.get(tabNum) !== 1) {
        this.calcCompletedTabs(tabNum, 1);
      }
    } else if (tabNum === 7) { // Admins
      this.BitSetTab7.set(bitIndex, 1);
      if (this.BitSetTab7.cardinality() === 3) {
        this.remainingOnTab8 = 0;
        if (this.completedTabsBitSet.get(tabNum) !== 1) {
          this.calcCompletedTabs(tabNum, 1);
        }
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
    } else if (tabNum === 3) {
      this.BitSetTab3.set(bitIndex, 0);
      this.remainingOnTab3 = this.requiredOnTab3 - this.BitSetTab3.cardinality();
      if (this.completedTabsBitSet.get(tabNum) !== 0) {
        this.calcCompletedTabs(tabNum, 0);
      }
    } else if (tabNum === 4) { // Contact
      this.BitSetTab4.set(bitIndex, 0);
      const mainContactCardinality = this.BitSetTab4.slice(9, 11).cardinality();
      this.remainingOnTab4 = this.requiredOnTab4 - +(mainContactCardinality === 3) - this.BitSetTab4.get(15);
      if (this.completedTabsBitSet.get(tabNum) !== 0) {
        this.calcCompletedTabs(tabNum, 0);
      }
    } else if (tabNum === 7) { // Admins
      this.BitSetTab7.set(bitIndex, 0);
      this.remainingOnTab8 = this.requiredOnTab8;
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

  /** Terms Modal--> **/
  toggleTerm(term) {
    if (term === 'privacyPolicy') {
      this.privacyPolicy = !this.privacyPolicy;
    } else if (term === 'authorizedRepresentative') {
      this.authorizedRepresentative = !this.authorizedRepresentative;
    }
    this.checkTerms();
  }

  checkTerms() {
    this.agreedToTerms = this.privacyPolicy && this.authorizedRepresentative;
  }

  acceptTerms() {
    if (this._hasUserConsent && this.edit) {
      this.serviceProviderService.adminAcceptedTerms(this.providerId, this.pendingProvider).subscribe(
        res => {},
        error => { console.log(error); },
        () => {}
      );
    }
  }

  /** <--Terms Modal **/

  /** Submit Comment Modal--> **/
  showCommentModal() {
    if (this.edit && !this.pendingProvider) {
      UIkit.modal('#commentModal').show();
    } else {
      this.registerProvider(false);
    }
  }

  /** <--Submit Comment Modal **/

  submitSuggestion(entryValueName, vocabulary, parent) {
    if (entryValueName.trim() !== '') {
      this.serviceProviderService.submitVocabularyEntry(entryValueName, vocabulary, parent, 'provider', this.providerId, null).subscribe(
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

  resetLegalStatus() {
    this.providerForm.get('legalStatus').setValue('');
  }

  switchToTab(id: string){
    const element: HTMLElement = document.getElementById(id) as HTMLElement;
    element.click();
    window.scrollTo(0, -1);
  }

  showCatalogueName(catalogueId: string) {
    this.catalogueService.getCatalogueById(catalogueId).subscribe(
      catalogue => this.displayedCatalogueName = `| Catalogue: ${catalogue.name}`,
      error => console.log(error)
    );
  }

}
