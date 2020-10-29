import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import * as sd from '../provider-resources/services.description';
import {AuthenticationService} from '../../services/authentication.service';
import {ServiceProviderService} from '../../services/service-provider.service';
import {ActivatedRoute, Router} from '@angular/router';
import {URLValidator} from '../../shared/validators/generic.validator';
import {Vocabulary, Type, Provider} from '../../domain/eic-model';
import {ResourceService} from '../../services/resource.service';
import BitSet from 'bitset/bitset';
import {environment} from '../../../environments/environment';
import {PremiumSortPipe} from '../../shared/pipes/premium-sort.pipe';

declare var UIkit: any;

@Component({
  selector: 'app-new-service-provider',
  templateUrl: './service-provider-form.component.html',
  styleUrls: ['./service-provider-form.component.css']
})
export class ServiceProviderFormComponent implements OnInit {

  private _hasUserConsent = environment.hasUserConsent;

  serviceORresource = environment.serviceORresource;
  projectName = environment.projectName;
  projectMail = environment.projectMail;
  privacyPolicyURL = environment.privacyPolicyURL;
  providerId: string;
  providerName = '';
  errorMessage = '';
  userInfo = {family_name: '', given_name: '', email: ''};
  newProviderForm: FormGroup;
  logoUrl = '';
  vocabularies: Map<string, Vocabulary[]> = null;
  premiumSort = new PremiumSortPipe();
  edit = false;
  hasChanges = false;
  pendingProvider = false;
  disable = false;
  showLoader = false;
  tabs: boolean[] = [false, false, false, false, false, false, false, false];

  requiredOnTab0 = 3;
  requiredOnTab1 = 2;
  requiredOnTab3 = 4;
  requiredOnTab4 = 2;
  requiredOnTab7 = 1;

  remainingOnTab0 = this.requiredOnTab0;
  remainingOnTab1 = this.requiredOnTab1;
  remainingOnTab3 = this.requiredOnTab3;
  remainingOnTab4 = this.requiredOnTab4;
  remainingOnTab7 = this.requiredOnTab7;

  BitSetTab0 = new BitSet;
  BitSetTab1 = new BitSet;
  BitSetTab3 = new BitSet;
  BitSetTab4 = new BitSet;
  BitSetTab7 = new BitSet;

  requiredTabs = 5;
  completedTabs = 0;
  completedTabsBitSet = new BitSet;

  allRequiredFields = 16;
  loaderBitSet = new BitSet;
  loaderPercentage = 0;

  codeOfConduct = false;
  privacyPolicy = false;
  authorizedRepresentative = false;
  agreedToTerms: boolean;


  readonly fullNameDesc: sd.Description = sd.providerDescMap.get('fullNameDesc');
  readonly abbreviationDesc: sd.Description = sd.providerDescMap.get('abbreviationDesc');
  readonly websiteDesc: sd.Description = sd.providerDescMap.get('websiteDesc');
  readonly providerDescriptionDesc: sd.Description = sd.providerDescMap.get('providerDescriptionDesc');
  readonly providerLogoDesc: sd.Description = sd.providerDescMap.get('providerLogoDesc');
  readonly providerMultimediaDesc: sd.Description = sd.providerDescMap.get('providerMultimediaDesc');
  readonly providerScientificDomainDesc: sd.Description = sd.providerDescMap.get('providerScientificDomainDesc');
  readonly providerScientificSubdomainsDesc: sd.Description = sd.providerDescMap.get('providerScientificSubdomainsDesc');
  readonly structureTypesDesc: sd.Description = sd.providerDescMap.get('structureTypesDesc');
  readonly participatingCountriesDesc: sd.Description = sd.providerDescMap.get('participatingCountriesDesc');
  readonly affiliationDesc: sd.Description = sd.providerDescMap.get('affiliationDesc');
  readonly providerTagsDesc: sd.Description = sd.providerDescMap.get('providerTagsDesc');
  readonly streetNameAndNumberDesc: sd.Description = sd.providerDescMap.get('streetNameAndNumberDesc');
  readonly postalCodeDesc: sd.Description = sd.providerDescMap.get('postalCodeDesc');
  readonly cityDesc: sd.Description = sd.providerDescMap.get('cityDesc');
  readonly regionDesc: sd.Description = sd.providerDescMap.get('regionDesc');
  readonly countryDesc: sd.Description = sd.providerDescMap.get('countryDesc');
  readonly providerMainContactFirstNameDesc: sd.Description = sd.providerDescMap.get('providerMainContactFirstNameDesc');
  readonly providerMainContactLastNameDesc: sd.Description = sd.providerDescMap.get('providerMainContactLastNameDesc');
  readonly providerMainContactEmailDesc: sd.Description = sd.providerDescMap.get('providerMainContactEmailDesc');
  readonly providerMainContactPhoneDesc: sd.Description = sd.providerDescMap.get('providerMainContactPhoneDesc');
  readonly providerMainContactPositionDesc: sd.Description = sd.providerDescMap.get('providerMainContactPositionDesc');
  readonly providerPublicContactFirstNameDesc: sd.Description = sd.providerDescMap.get('providerPublicContactFirstNameDesc');
  readonly providerPublicContactLastNameDesc: sd.Description = sd.providerDescMap.get('providerPublicContactLastNameDesc');
  readonly providerPublicContactEmailDesc: sd.Description = sd.providerDescMap.get('providerPublicContactEmailDesc');
  readonly providerPublicContactPhoneDesc: sd.Description = sd.providerDescMap.get('providerPublicContactPhoneDesc');
  readonly providerPublicContactPositionDesc: sd.Description = sd.providerDescMap.get('providerPublicContactPositionDesc');
  readonly providerCertificationsDesc: sd.Description = sd.providerDescMap.get('providerCertificationsDesc');
  readonly lifeCycleStatusDesc: sd.Description = sd.providerDescMap.get('lifeCycleStatusDesc');
  readonly ESFRIDomainDesc: sd.Description = sd.providerDescMap.get('ESFRIDomainDesc');
  readonly hostingLegalEntityDesc: sd.Description = sd.providerDescMap.get('hostingLegalEntityDesc');
  readonly ESFRITypeDesc: sd.Description = sd.providerDescMap.get('ESFRITypeDesc');
  readonly merilScientificDomainsDesc: sd.Description = sd.providerDescMap.get('merilScientificDomainsDesc');
  readonly merilScientificSubdomainsDesc: sd.Description = sd.providerDescMap.get('merilScientificSubdomainsDesc');
  readonly areasOfActivityDesc: sd.Description = sd.providerDescMap.get('areasOfActivityDesc');
  readonly societalGrandChallengesDesc: sd.Description = sd.providerDescMap.get('societalGrandChallengesDesc');
  readonly nationalRoadmapsDesc: sd.Description = sd.providerDescMap.get('nationalRoadmapsDesc');
  readonly legalEntityDesc: sd.Description = sd.providerDescMap.get('legalEntityDesc');
  readonly legalStatusDesc: sd.Description = sd.providerDescMap.get('legalStatusDesc');
  readonly networksDesc: sd.Description = sd.providerDescMap.get('networksDesc');

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

  readonly formDefinition = {
    id: [''],
    name: ['', Validators.required],
    abbreviation: ['', Validators.required],
    website: ['', Validators.compose([Validators.required, URLValidator])],
    legalEntity: [''],
    legalStatus: [''],
    description: ['', Validators.required],
    logo: ['', Validators.compose([Validators.required, URLValidator])],
    multimedia: this.fb.array([this.fb.control('', URLValidator)]),
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
      phone: ['', Validators.pattern('[+]?\\d+$')],
      position: [''],
    }, Validators.required),
    publicContacts: this.fb.array([
      this.fb.group({
        firstName: [''],
        lastName: [''],
        email: ['', Validators.compose([Validators.required, Validators.email])],
        phone: ['', Validators.pattern('[+]?\\d+$')],
        position: [''],
      })
    ]),
    lifeCycleStatus: [''],
    certifications: this.fb.array([this.fb.control('')]),
    hostingLegalEntity: [''],
    participatingCountries: this.fb.array([this.fb.control('')]),
    affiliations: this.fb.array([this.fb.control('')]),
    networks: this.fb.array([this.fb.control('')]),
    structureTypes: this.fb.array([this.fb.control('')]),
    esfriDomains: this.fb.array([this.fb.control('')]),
    esfriType: [''],
    merilScientificDomains: this.fb.array([]),
    // merilScientificDomain: this.fb.array([]),
    // merilScientificSubdomains: this.fb.array([]),
    areasOfActivity: this.fb.array([this.fb.control('')]),
    societalGrandChallenges: this.fb.array([this.fb.control('')]),
    nationalRoadmaps: this.fb.array([this.fb.control('')]),
    users: this.fb.array([
      this.user()
    ])
  };

  constructor(public fb: FormBuilder,
              public authService: AuthenticationService,
              public serviceProviderService: ServiceProviderService,
              public resourceService: ResourceService,
              public router: Router,
              public route: ActivatedRoute) {
  }

  ngOnInit() {

    const path = this.route.snapshot.routeConfig.path;
    if (path.includes('add/:providerId')) {
      this.pendingProvider = true;
    }
    // if (path.includes('info/:providerId')) {
    //   this.pendingProvider = true;
    // }
    this.setVocabularies();
    this.newProviderForm = this.fb.group(this.formDefinition);
    if (this.edit === false) {
      this.pushDomain();
      this.pushMerilDomain();
      this.addDefaultUser();  // Admin + mainContact
      this.newProviderForm.get('legalEntity').setValue(false);
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
                this.push(i, false, true);
              } else {
                this.push(i, false);
              }
            }
          }
        }
      }
      this.newProviderForm.patchValue(data);
      if (!this.edit) {
        sessionStorage.removeItem('provider');
      }
    }

    if (this._hasUserConsent) {
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

    this.initUserBitSets(); // Admin + mainContact
  }

  registerProvider(tempSave: boolean) {
    if (!this.authService.isLoggedIn()) {
      console.log('Submit');
      sessionStorage.setItem('provider', JSON.stringify(this.newProviderForm.value));
      this.authService.login();
    }

    this.errorMessage = '';
    this.trimFormWhiteSpaces();
    const path = this.route.snapshot.routeConfig.path;
    let method;
    if (path === 'add/:providerId') {
      method = 'updateAndPublishPendingProvider';
    } else {
      method = this.edit ? 'updateServiceProvider' : 'createNewServiceProvider';
    }

    if (!tempSave) {
      this.getFieldAsFormArray('scientificDomains').controls = [];
      this.getFieldAsFormArray('merilScientificDomains').controls = [];
    }

    for (const category of this.domainArray.controls) {
      if (category.get('scientificSubdomain').value) {
        this.getFieldAsFormArray('scientificDomain').push(this.fb.control(category.get('scientificDomain').value));
        this.getFieldAsFormArray('scientificSubdomains').push(this.fb.control(category.get('scientificSubdomain').value));
      }
    }
    for (const category of this.merilDomainArray.controls) {
      if (category.get('merilScientificSubdomain').value) {
        this.getFieldAsFormArray('merilScientificDomain').push(this.fb.control(category.get('merilScientificDomain').value));
        this.getFieldAsFormArray('merilScientificSubdomains').push(this.fb.control(category.get('merilScientificSubdomain').value));
      }
    }

    if (tempSave) {
      this.showLoader = true;
      window.scrollTo(0, 0);
      this.serviceProviderService.temporarySaveProvider(this.newProviderForm.value, (path !== 'add/:providerId' && this.edit))
        .subscribe(
          res => {
            this.showLoader = false;
            this.router.navigate([`/provider/add/${res.id}`]);
          },
          err => {
            this.showLoader = false;
            window.scrollTo(0, 0);
            this.errorMessage = 'Something went wrong. ' + JSON.stringify(err.error.error);
          },
          () => {
            this.showLoader = false;
          }
        );
    } else if (this.newProviderForm.valid) {
      this.showLoader = true;
      window.scrollTo(0, 0);

      this.serviceProviderService[method](this.newProviderForm.value).subscribe(
        res => {
        },
        err => {
          this.showLoader = false;
          window.scrollTo(0, 0);
          this.errorMessage = 'Something went wrong. ' + JSON.stringify(err.error.error);
        },
        () => {
          this.showLoader = false;
          if (this.edit) {
            this.router.navigate(['/provider/my']);
          } else {
            this.authService.refreshLogin('/provider/my');
          }
        }
      );
    } else {
      console.log(this.newProviderForm);
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
      console.log(name);
      if (Array.isArray(values)) {
        newValues = [];
        values.forEach(e => {
          console.log('is array');
          if (typeof e === 'string' || e instanceof String) {
            if (e !== '') {
              newValues.push(e.trim().replace(/\s\s+/g, ' '));
            }
          } else {
            console.log('array with objects');
          }
        });
      } else if (typeof newValues === 'string' || newValues instanceof String) {
        newValues = newValues.trim().replace(/\s\s+/g, ' ');
      } else {
        console.log('single object');
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
  checkFormValidity(name: string): boolean {
    return (!this.newProviderForm.get(name).valid && this.newProviderForm.get(name).dirty);
  }

  checkFormArrayValidity(name: string, position: number, groupName?: string): boolean {
    if (groupName) {
      return !this.getFieldAsFormArray(name).get([position]).get(groupName).valid && this.getFieldAsFormArray(name).get([position]).get(groupName).dirty;
    }
    return !this.getFieldAsFormArray(name).get([position]).valid && this.getFieldAsFormArray(name).get([position]).dirty;
  }

  checkEveryArrayFieldValidity(name: string, groupName?: string): boolean {
    for (let i = 0; i < this.getFieldAsFormArray(name).length; i++) {
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
      || this.checkFormValidity('abbreviation')
      || this.checkFormValidity('website')
      || this.checkEveryArrayFieldValidity('legalEntity')
      || this.checkFormValidity('legalStatus'));
    this.tabs[1] = (this.checkFormValidity('description')
      || this.checkFormValidity('logo')
      || this.checkEveryArrayFieldValidity('multimedia'));
    this.tabs[2] = (this.checkEveryArrayFieldValidity('tags')
      || this.checkEveryArrayFieldValidity('scientificDomains', 'scientificDomain')
      || this.checkEveryArrayFieldValidity('scientificDomains', 'scientificSubdomain'));
    this.tabs[3] = (this.checkFormValidity('location.streetNameAndNumber')
      || this.checkFormValidity('location.postalCode')
      || this.checkFormValidity('location.city')
      || this.checkFormValidity('location.region')
      || this.checkFormValidity('location.country'));
    this.tabs[4] = (this.checkFormValidity('mainContact.firstName')
      || this.checkFormValidity('mainContact.lastName')
      || this.checkFormValidity('mainContact.email')
      || this.checkFormValidity('mainContact.phone')
      || this.checkFormValidity('mainContact.position')
      || this.checkEveryArrayFieldValidity('publicContacts', 'firstName')
      || this.checkEveryArrayFieldValidity('publicContacts', 'lastName')
      || this.checkEveryArrayFieldValidity('publicContacts', 'email')
      || this.checkEveryArrayFieldValidity('publicContacts', 'phone')
      || this.checkEveryArrayFieldValidity('publicContacts', 'position'));
    this.tabs[5] = (this.checkFormValidity('lifeCycleStatus')
      || this.checkEveryArrayFieldValidity('certifications'));
    this.tabs[6] = (this.checkFormValidity('hostingLegalEntity')
      || this.checkEveryArrayFieldValidity('participatingCountries')
      || this.checkEveryArrayFieldValidity('affiliations')
      || this.checkEveryArrayFieldValidity('networks')
      || this.checkEveryArrayFieldValidity('structureTypes')
      || this.checkEveryArrayFieldValidity('esfriDomains')
      || this.checkFormValidity('esfriType')
      || this.checkEveryArrayFieldValidity('merilScientificDomains', 'merilScientificDomain')
      || this.checkEveryArrayFieldValidity('merilScientificDomains', 'merilScientificSubdomain')
      || this.checkEveryArrayFieldValidity('areasOfActivity')
      || this.checkEveryArrayFieldValidity('societalGrandChallenges')
      || this.checkEveryArrayFieldValidity('nationalRoadmaps'));
    this.tabs[6] = (this.checkEveryArrayFieldValidity('users', 'name') || this.checkEveryArrayFieldValidity('users', 'surname')
      || this.checkEveryArrayFieldValidity('users', 'email'));
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
        return this.vocabularies;
      },
      error => console.log(JSON.stringify(error.error)),
      () => {
        this.premiumSort.transform(this.placesVocabulary, ['Europe', 'Worldwide']);
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
    return this.newProviderForm.get('scientificDomains') as FormArray;
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
    return this.newProviderForm.get('merilScientificDomains') as FormArray;
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
    return this.newProviderForm.get(field) as FormArray;
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

  /** Contact Info -->**/
  newContact(): FormGroup {
    return this.fb.group({
      firstName: [''],
      lastName: [''],
      email: [''],
      phone: [''],
      position: [''],
    });
  }

  get publicContactArray() {
    return this.newProviderForm.get('publicContacts') as FormArray;
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
    return this.newProviderForm.get('users') as FormArray;
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
    this.userInfo.given_name = this.authService.getUserProperty('given_name');
    this.userInfo.family_name = this.authService.getUserProperty('family_name');
    this.userInfo.email = this.authService.getUserProperty('email');
    this.usersArray.controls[0].get('name').setValue(this.userInfo.given_name);
    this.usersArray.controls[0].get('surname').setValue(this.userInfo.family_name);
    this.usersArray.controls[0].get('email').setValue(this.userInfo.email);
    this.newProviderForm.controls['mainContact'].get('firstName').setValue(this.userInfo.given_name);
    this.newProviderForm.controls['mainContact'].get('lastName').setValue(this.userInfo.family_name);
    this.newProviderForm.controls['mainContact'].get('email').setValue(this.userInfo.email);
  }

  /** <-- User Array**/

  showLogoUrlModal() {
    if (this.newProviderForm && this.newProviderForm.get('logo').value) {
      this.logoUrl = this.newProviderForm.get('logo').value;
    }
    UIkit.modal('#logoUrlModal').show();
  }

  addLogoUrl(logoUrl: string) {
    UIkit.modal('#logoUrlModal').hide();
    this.logoUrl = logoUrl;
    this.newProviderForm.get('logo').setValue(logoUrl);
    this.newProviderForm.get('logo').updateValueAndValidity();
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
    for (const i in this.newProviderForm.controls) {
      for (const j in this.newProviderForm.controls[i].value) {
        // console.log(this.newProviderForm.controls[i].value);
        if (this.newProviderForm.controls[i].value.hasOwnProperty(j)) {
          if (this.newProviderForm.controls[i].get(j)) {
            if (this.newProviderForm.controls[i].get(j).value.constructor !== Array) {
              this.newProviderForm.controls[i].get(j).markAsDirty();
              this.newProviderForm.controls[i].get(j).markAsTouched();
            }
          }
        }
      }
      if (this.newProviderForm.controls[i].value.constructor === Array) {
        for (let j = 0; j < this.getFieldAsFormArray(i).controls.length; j++) {
          const keys = Object.keys(this.newProviderForm.controls[i].value[j]);
          for (let k = 0; k < keys.length; k++) {
            if (this.getFieldAsFormArray(i).controls[j].get(keys[k])) {
              this.getFieldAsFormArray(i).controls[j].get(keys[k]).markAsTouched();
              this.getFieldAsFormArray(i).controls[j].get(keys[k]).markAsDirty();
            }
          }
        }
      }
      this.newProviderForm.controls[i].markAsDirty();
    }
  }

  trimFormWhiteSpaces() {
    for (const i in this.newProviderForm.controls) {
      // console.log(i);
      if (this.newProviderForm.controls[i].value && this.newProviderForm.controls[i].value.constructor === Array) {

      } else if (this.newProviderForm.controls[i].value && (i === 'location' || i === 'mainContact')) {
        // TODO
      } else if (typeof this.newProviderForm.controls[i].value === 'boolean') {
        // console.log('skip boolean value');
      } else {
        // console.log('this.newProviderForm.controls[i].value: ', this.newProviderForm.controls[i].value);
        this.newProviderForm.controls[i].setValue(this.newProviderForm.controls[i].value.trim().replace(/\s\s+/g, ' '));
      }
    }
    for (let j = 0; j < this.newProviderForm.controls['users'].value.length; j++) {
      this.newProviderForm.controls['users'].value[j].email = this.newProviderForm.controls['users'].value[j].email
        .trim().replace(/\s\s+/g, ' ');
      this.newProviderForm.controls['users'].value[j].name = this.newProviderForm.controls['users'].value[j].name
        .trim().replace(/\s\s+/g, ' ');
      this.newProviderForm.controls['users'].value[j].surname = this.newProviderForm.controls['users'].value[j].surname
        .trim().replace(/\s\s+/g, ' ');
    }

    if (this.newProviderForm.controls['scientificDomains'] && this.newProviderForm.controls['scientificDomains'].value) {

      if (this.newProviderForm.controls['scientificDomains'].value.length === 1
        && !this.newProviderForm.controls['scientificDomains'].value[0].scientificDomain
        && !this.newProviderForm.controls['scientificDomains'].value[0].scientificSubdomain) {

        this.removeDomain(0);

      }
    }
    if (this.newProviderForm.controls['merilScientificDomains'] && this.newProviderForm.controls['merilScientificDomains'].value) {

      if (this.newProviderForm.controls['merilScientificDomains'].value.length === 1
        && !this.newProviderForm.controls['merilScientificDomains'].value[0].merilScientificDomain
        && !this.newProviderForm.controls['merilScientificDomains'].value[0].merilScientificSubdomain) {

        this.removeMerilDomain(0);

      }
    }
  }

  unsavedChangesPrompt() {
    this.hasChanges = true;
  }

  /** BitSets -->**/
  handleBitSets(tabNum: number, bitIndex: number, formControlName: string): void {
    if (bitIndex === 0) {
      this.providerName = this.newProviderForm.get(formControlName).value;
    }
    if (this.newProviderForm.get(formControlName).valid || (this.newProviderForm.get(formControlName).disabled && this.newProviderForm.get(formControlName).value != '')) {
      this.decreaseRemainingFieldsPerTab(tabNum, bitIndex);
      this.loaderBitSet.set(bitIndex, 1);
    } else if (this.newProviderForm.get(formControlName).invalid) {
      this.increaseRemainingFieldsPerTab(tabNum, bitIndex);
      this.loaderBitSet.set(bitIndex, 0);
    }
    this.updateLoaderPercentage();
  }

  handleBitSetsOfGroups(tabNum: number, bitIndex: number, formControlName: string, group?: string): void {
    if (this.newProviderForm.controls[group].get(formControlName).valid || (this.newProviderForm.controls[group].get(formControlName).disabled && this.newProviderForm.controls[group].get(formControlName).value != '')) {
      this.decreaseRemainingFieldsPerTab(tabNum, bitIndex);
      this.loaderBitSet.set(bitIndex, 1);
    } else if (this.newProviderForm.controls[group].get(formControlName).invalid) {
      this.increaseRemainingFieldsPerTab(tabNum, bitIndex);
      this.loaderBitSet.set(bitIndex, 0);
    }
    this.updateLoaderPercentage();
  }

  handleBitSetsOfPublicContact(tabNum: number, bitIndex: number, formControlName: string, group?: string): void {
    if (this.newProviderForm.get(group).value[0][formControlName] !== '' && this.newProviderForm.controls[group].valid || this.newProviderForm.controls[group].disabled) {
      this.decreaseRemainingFieldsPerTab(tabNum, bitIndex);
      this.loaderBitSet.set(bitIndex, 1);
    } else {
      this.increaseRemainingFieldsPerTab(tabNum, bitIndex);
      this.loaderBitSet.set(bitIndex, 0);
    }
    this.updateLoaderPercentage();
  }

  handleBitSetsOfUsers(tabNum: number, bitIndex: number, formControlName: string, group?: string): void {
    if (this.newProviderForm.get(group).value[0][formControlName] !== '') {
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
    } else if (tabNum === 3) {
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
        this.remainingOnTab7 = 0;
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
      this.remainingOnTab7 = this.requiredOnTab7;
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

  /** URL Validation--> **/
  checkUrlValidity(formControlName: string) {
    let urlValidity;
    if (this.newProviderForm.get(formControlName).valid && this.newProviderForm.get(formControlName).value !== '') {
      const url = this.newProviderForm.get(formControlName).value;
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
    console.log(this.newProviderForm.get(formArrayName).value[position]);
    if (this.newProviderForm.get(formArrayName).value[position] !== '') {
      const url = this.newProviderForm.get(formArrayName).value[position];
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

}
