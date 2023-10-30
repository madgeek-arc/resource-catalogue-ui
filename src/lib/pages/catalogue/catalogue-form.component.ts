import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import * as dm from '../../shared/description.map';
import {AuthenticationService} from '../../services/authentication.service';
import {ServiceProviderService} from '../../services/service-provider.service';
import {CatalogueService} from "../../services/catalogue.service";
import {ResourceService} from '../../services/resource.service';
import {ActivatedRoute, Router} from '@angular/router';
import {URLValidator} from '../../shared/validators/generic.validator';
import {Vocabulary, Type, Provider} from '../../domain/eic-model';
import BitSet from 'bitset';
import {environment} from '../../../environments/environment';

declare var UIkit: any;

@Component({
  selector: 'app-catalogue-form',
  templateUrl: './catalogue-form.component.html',
  // styleUrls: ['./service-provider-form.component.css']
})
export class CatalogueFormComponent implements OnInit {

  _hasUserConsent = environment.hasUserConsent;
  serviceORresource = environment.serviceORresource;
  projectName = environment.projectName;
  projectMail = environment.projectMail;
  privacyPolicyURL = environment.privacyPolicyURL;
  onboardingAgreementURL = environment.onboardingAgreementURL;
  catalogueId: string = null;
  catalogueName = '';
  errorMessage = '';
  userInfo = {family_name: '', given_name: '', email: ''};
  catalogueForm: FormGroup;
  logoUrl = '';
  vocabularies: Map<string, Vocabulary[]> = null;
  subVocabularies: Map<string, Vocabulary[]> = null;
  edit = false;
  hasChanges = false;
  pendingCatalogue = false;
  disable = false;
  showLoader = false;
  tabs: boolean[] = [false, false, false, false, false, false, false, false];
  isPortalAdmin = false;

  requiredOnTab0 = 7;
  requiredOnTab1 = 2;
  requiredOnTab3 = 4;
  requiredOnTab4 = 2;
  requiredOnTab6 = 1;

  remainingOnTab0 = this.requiredOnTab0;
  remainingOnTab1 = this.requiredOnTab1;
  remainingOnTab3 = this.requiredOnTab3;
  remainingOnTab4 = this.requiredOnTab4;
  remainingOnTab6 = this.requiredOnTab6;

  BitSetTab0 = new BitSet;
  BitSetTab1 = new BitSet;
  BitSetTab3 = new BitSet;
  BitSetTab4 = new BitSet;
  BitSetTab6 = new BitSet;

  requiredTabs = 5;
  completedTabs = 0;
  completedTabsBitSet = new BitSet;

  allRequiredFields = 20;
  loaderBitSet = new BitSet;
  loaderPercentage = 0;

  codeOfConduct = false;
  privacyPolicy = false;
  authorizedRepresentative = false;
  onboardingAgreement = false;
  agreedToTerms: boolean;

  vocabularyEntryForm: FormGroup;
  suggestionsForm = {
    domainsVocabularyEntryValueName: '',
    categoriesVocabularyEntryValueName: '',
    placesVocabularyEntryValueName: '',
    networksVocabularyEntryValueName: '',
    providerTypeVocabularyEntryValueName: '',
    vocabulary: '',
    errorMessage: '',
    successMessage: ''
  };

  commentControl = new FormControl();

  readonly fullNameDesc: dm.Description = dm.catalogueDescMap.get('fullNameDesc');
  readonly abbreviationDesc: dm.Description = dm.catalogueDescMap.get('abbreviationDesc');
  readonly websiteDesc: dm.Description = dm.catalogueDescMap.get('websiteDesc');
  readonly descriptionDesc: dm.Description = dm.catalogueDescMap.get('descriptionDesc');
  readonly scopeDesc: dm.Description = dm.catalogueDescMap.get('scopeDesc');
  readonly logoDesc: dm.Description = dm.catalogueDescMap.get('logoDesc');
  readonly multimediaURLDesc: dm.Description = dm.catalogueDescMap.get('multimediaURLDesc');
  readonly multimediaNameDesc: dm.Description = dm.catalogueDescMap.get('multimediaNameDesc');
  readonly scientificDomainDesc: dm.Description = dm.catalogueDescMap.get('scientificDomainDesc');
  readonly scientificSubdomainsDesc: dm.Description = dm.catalogueDescMap.get('scientificSubdomainsDesc');
  readonly participatingCountriesDesc: dm.Description = dm.catalogueDescMap.get('participatingCountriesDesc');
  readonly affiliationDesc: dm.Description = dm.catalogueDescMap.get('affiliationDesc');
  readonly tagsDesc: dm.Description = dm.catalogueDescMap.get('tagsDesc');
  readonly streetNameAndNumberDesc: dm.Description = dm.catalogueDescMap.get('streetNameAndNumberDesc');
  readonly postalCodeDesc: dm.Description = dm.catalogueDescMap.get('postalCodeDesc');
  readonly cityDesc: dm.Description = dm.catalogueDescMap.get('cityDesc');
  readonly regionDesc: dm.Description = dm.catalogueDescMap.get('regionDesc');
  readonly countryDesc: dm.Description = dm.catalogueDescMap.get('countryDesc');
  readonly mainContactFirstNameDesc: dm.Description = dm.catalogueDescMap.get('mainContactFirstNameDesc');
  readonly mainContactLastNameDesc: dm.Description = dm.catalogueDescMap.get('mainContactLastNameDesc');
  readonly mainContactEmailDesc: dm.Description = dm.catalogueDescMap.get('mainContactEmailDesc');
  readonly mainContactPhoneDesc: dm.Description = dm.catalogueDescMap.get('mainContactPhoneDesc');
  readonly mainContactPositionDesc: dm.Description = dm.catalogueDescMap.get('mainContactPositionDesc');
  readonly publicContactFirstNameDesc: dm.Description = dm.catalogueDescMap.get('publicContactFirstNameDesc');
  readonly publicContactLastNameDesc: dm.Description = dm.catalogueDescMap.get('publicContactLastNameDesc');
  readonly publicContactEmailDesc: dm.Description = dm.catalogueDescMap.get('publicContactEmailDesc');
  readonly publicContactPhoneDesc: dm.Description = dm.catalogueDescMap.get('publicContactPhoneDesc');
  readonly publicContactPositionDesc: dm.Description = dm.catalogueDescMap.get('publicContactPositionDesc');
  readonly hostingLegalEntityDesc: dm.Description = dm.catalogueDescMap.get('hostingLegalEntityDesc');
  readonly legalEntityDesc: dm.Description = dm.catalogueDescMap.get('legalEntityDesc');
  readonly legalStatusDesc: dm.Description = dm.catalogueDescMap.get('legalStatusDesc');
  readonly networksDesc: dm.Description = dm.catalogueDescMap.get('networksDesc');
  readonly inclusionCriteriaDesc: dm.Description = dm.catalogueDescMap.get('inclusionCriteriaDesc');
  readonly validationProcessDesc: dm.Description = dm.catalogueDescMap.get('validationProcessDesc');
  readonly endOfLifeDesc: dm.Description = dm.catalogueDescMap.get('endOfLifeDesc');

  placesVocabulary: Vocabulary[] = null;
  providerTypeVocabulary: Vocabulary[] = null;
  domainsVocabulary: Vocabulary[] = null;
  categoriesVocabulary: Vocabulary[] = null;
  legalStatusVocabulary: Vocabulary[] = null;
  networksVocabulary: Vocabulary[] = null;
  hostingLegalEntityVocabulary: Vocabulary[] = null;

  readonly formDefinition = {
    id: [''],
    name: ['', Validators.required],
    abbreviation: ['', Validators.required],
    website: ['', Validators.compose([Validators.required, URLValidator])],
    legalEntity: [''],
    legalStatus: [''],
    hostingLegalEntity: [''],
    inclusionCriteria: ['', Validators.compose([Validators.required, URLValidator])],
    validationProcess: ['', Validators.compose([Validators.required, URLValidator])],
    endOfLife: ['', Validators.required],
    description: ['', Validators.required],
    scope: [''],
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
    participatingCountries: this.fb.array([this.fb.control('')]),
    affiliations: this.fb.array([this.fb.control('')]),
    networks: this.fb.array([this.fb.control('')]),
    users: this.fb.array([this.user()])
  };

  constructor(public fb: FormBuilder,
              public authService: AuthenticationService,
              public serviceProviderService: ServiceProviderService,
              public catalogueService: CatalogueService,
              public resourceService: ResourceService,
              public router: Router,
              public route: ActivatedRoute) {
  }

  ngOnInit() {

    const path = this.route.snapshot.routeConfig.path;
    if (path.includes('add/:catalogueId')) {
      this.pendingCatalogue = true;
    }
    // if (path.includes('info/:catalogueId')) {
    //   this.pendingCatalogue = true;
    // }
    this.setVocabularies();
    this.catalogueForm = this.fb.group(this.formDefinition);
    if (this.edit === false) {
      this.pushDomain();
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
              } else if (i === 'publicContacts') {
                this.pushPublicContact();
              } else if (i === 'users') {
                this.addUser();
              } else if (i === 'multimedia') {
                this.pushMultimedia();
              } else {
                this.push(i, false);
              }
            }
          }
        }
      }
      this.catalogueForm.patchValue(data);
      if (!this.edit) {
        sessionStorage.removeItem('provider');
      }
    }

    if (this._hasUserConsent) {
      if (this.edit) {
        this.catalogueService.hasAdminAcceptedTerms(this.catalogueId, this.pendingCatalogue).subscribe(
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

    this.vocabularyEntryForm = this.fb.group(this.suggestionsForm);
  }

  registerCatalogue(tempSave: boolean) {
    // console.log('Submit');
    // console.log(this.commentControl.value);
    if (!this.authService.isLoggedIn()) {
      sessionStorage.setItem('provider', JSON.stringify(this.catalogueForm.value));
      this.authService.login();
    }

    this.errorMessage = '';
    // this.trimFormWhiteSpaces();
    const path = this.route.snapshot.routeConfig.path;
    let method;
    if (path === 'add/:catalogueId') {
      method = 'updateAndPublishPendingProvider';
    } else {
      method = this.edit ? 'updateCatalogue' : 'createNewCatalogue';
    }

    for (let i = 0; i < this.domainArray.length; i++) {
      if (this.domainArray.controls[i].get('scientificDomain').value === ''
        || this.domainArray.controls[i].get('scientificDomain').value === null) {
        this.removeDomain(i);
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
      this.serviceProviderService.temporarySaveProvider(this.catalogueForm.value, (path !== 'add/:catalogueId' && this.edit))
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
    } else if (this.catalogueForm.valid) {
      this.showLoader = true;
      window.scrollTo(0, 0);

      this.catalogueService[method](this.catalogueForm.value, this.commentControl.value).subscribe(
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
            this.router.navigate(['/catalogue/my']);
          } else {
            this.router.navigate(['/catalogue/my']);
            // this.authService.refreshLogin('/catalogue/my'); // fixme: not redirecting
          }
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
    // if ( (this.firstServiceForm === true) && this.catalogueId) {
    //   ret['providers'] = [];
    //   ret['providers'].push(this.catalogueId);
    // }
    return <Provider>ret;
  }

  /** check form fields and tabs validity--> **/
  checkFormValidity(name: string, edit: boolean): boolean {
    return (this.catalogueForm.get(name).invalid && (edit || this.catalogueForm.get(name).dirty));
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
      || this.checkEveryArrayFieldValidity('scientificDomains', this.edit, 'scientificSubdomain'));
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
    this.tabs[5] = (this.checkEveryArrayFieldValidity('participatingCountries', this.edit)
      || this.checkEveryArrayFieldValidity('affiliations', this.edit)
      || this.checkEveryArrayFieldValidity('networks', this.edit));
    this.tabs[6] = (this.checkEveryArrayFieldValidity('users', this.edit, 'name')
      || this.checkEveryArrayFieldValidity('users', this.edit, 'surname')
      || this.checkEveryArrayFieldValidity('users', this.edit, 'email'));
  }

  /** <--check form fields and tabs validity**/

  /** get and set vocabularies **/
  setVocabularies() {
    this.resourceService.getAllVocabulariesByType().subscribe(
      res => {
        this.vocabularies = res;
        this.placesVocabulary = this.vocabularies[Type.COUNTRY];
        this.domainsVocabulary = this.vocabularies[Type.SCIENTIFIC_DOMAIN];
        this.categoriesVocabulary = this.vocabularies[Type.SCIENTIFIC_SUBDOMAIN];
        this.legalStatusVocabulary = this.vocabularies[Type.PROVIDER_LEGAL_STATUS];
        this.networksVocabulary = this.vocabularies[Type.PROVIDER_NETWORK];
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
    return this.catalogueForm.get('scientificDomains') as FormArray;
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

  /** handle form arrays--> **/
  getFieldAsFormArray(field: string) {
    return this.catalogueForm.get(field) as FormArray;
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
    return this.catalogueForm.get('multimedia') as FormArray;
  }

  pushMultimedia() {
    this.multimediaArray.push(this.newMultimedia());
  }

  removeMultimedia(index: number) {
    this.multimediaArray.removeAt(index);
  }

  /** <--Multimedia**/

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
    return this.catalogueForm.get('publicContacts') as FormArray;
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
    return this.catalogueForm.get('users') as FormArray;
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
    this.catalogueForm.controls['mainContact'].get('firstName').setValue(this.userInfo.given_name);
    this.catalogueForm.controls['mainContact'].get('lastName').setValue(this.userInfo.family_name);
    this.catalogueForm.controls['mainContact'].get('email').setValue(this.userInfo.email);
  }

  /** <-- User Array**/

  showLogoUrlModal() {
    if (this.catalogueForm && this.catalogueForm.get('logo').value) {
      this.logoUrl = this.catalogueForm.get('logo').value;
    }
    UIkit.modal('#logoUrlModal').show();
  }

  addLogoUrl(logoUrl: string) {
    UIkit.modal('#logoUrlModal').hide();
    this.logoUrl = logoUrl;
    this.catalogueForm.get('logo').setValue(logoUrl);
    this.catalogueForm.get('logo').updateValueAndValidity();
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
    for (const i in this.catalogueForm.controls) {
      for (const j in this.catalogueForm.controls[i].value) {
        // console.log(this.providerForm.controls[i].value);
        if (this.catalogueForm.controls[i].value.hasOwnProperty(j)) {
          if (this.catalogueForm.controls[i].get(j)) {
            if (this.catalogueForm.controls[i].get(j).value.constructor !== Array) {
              this.catalogueForm.controls[i].get(j).markAsDirty();
              this.catalogueForm.controls[i].get(j).markAsTouched();
            }
          }
        }
      }
      if (this.catalogueForm.controls[i].value.constructor === Array) {
        for (let j = 0; j < this.getFieldAsFormArray(i).controls.length; j++) {
          const keys = Object.keys(this.catalogueForm.controls[i].value[j]);
          for (let k = 0; k < keys.length; k++) {
            if (this.getFieldAsFormArray(i).controls[j].get(keys[k])) {
              this.getFieldAsFormArray(i).controls[j].get(keys[k]).markAsTouched();
              this.getFieldAsFormArray(i).controls[j].get(keys[k]).markAsDirty();
            }
          }
        }
      }
      this.catalogueForm.controls[i].markAsDirty();
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
    } else {
      if (this.catalogueForm.get(formControlName).value.length > 1) {
        for (let i = 0; i < this.catalogueForm.get(formControlName).value.length; i++) {
          for (let j = 0; j < this.catalogueForm.get(formControlName).value.length; j++) {
            if (i !== j && this.catalogueForm.get(formControlName).value[i] === this.catalogueForm.get(formControlName).value[j]) {
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
      this.catalogueName = this.catalogueForm.get(formControlName).value;
    }
    if (this.catalogueForm.get(formControlName).valid || (this.catalogueForm.get(formControlName).disabled && this.catalogueForm.get(formControlName).value != '')) {
      this.decreaseRemainingFieldsPerTab(tabNum, bitIndex);
      this.loaderBitSet.set(bitIndex, 1);
    } else if (this.catalogueForm.get(formControlName).invalid) {
      this.increaseRemainingFieldsPerTab(tabNum, bitIndex);
      this.loaderBitSet.set(bitIndex, 0);
    } else if (this.catalogueForm.get(formControlName).pending) {
      this.timeOut(300).then( () => this.handleBitSets(tabNum, bitIndex, formControlName));
      return;
    }
    this.updateLoaderPercentage();
  }

  handleBitSetsOfGroups(tabNum: number, bitIndex: number, formControlName: string, group?: string): void {
    if (this.catalogueForm.controls[group].get(formControlName).valid || (this.catalogueForm.controls[group].get(formControlName).disabled && this.catalogueForm.controls[group].get(formControlName).value != '')) {
      this.decreaseRemainingFieldsPerTab(tabNum, bitIndex);
      this.loaderBitSet.set(bitIndex, 1);
    } else if (this.catalogueForm.controls[group].get(formControlName).invalid) {
      this.increaseRemainingFieldsPerTab(tabNum, bitIndex);
      this.loaderBitSet.set(bitIndex, 0);
    }
    this.updateLoaderPercentage();
  }

  handleBitSetsOfPublicContact(tabNum: number, bitIndex: number, formControlName: string, group?: string): void {
    if (this.catalogueForm.get(group).value[0][formControlName] !== '' && this.catalogueForm.controls[group].valid || this.catalogueForm.controls[group].disabled) {
      this.decreaseRemainingFieldsPerTab(tabNum, bitIndex);
      this.loaderBitSet.set(bitIndex, 1);
    } else {
      this.increaseRemainingFieldsPerTab(tabNum, bitIndex);
      this.loaderBitSet.set(bitIndex, 0);
    }
    this.updateLoaderPercentage();
  }

  handleBitSetsOfUsers(tabNum: number, bitIndex: number, formControlName: string, group?: string): void {
    if (this.catalogueForm.get(group).value[0][formControlName] !== '') {
      this.decreaseRemainingFieldsPerTab(tabNum, bitIndex);
      this.loaderBitSet.set(bitIndex, 1);
    } else {
      this.increaseRemainingFieldsPerTab(tabNum, bitIndex);
      this.loaderBitSet.set(bitIndex, 0);
    }
    this.updateLoaderPercentage();
  }

  initUserBitSets() {
    this.handleBitSetsOfUsers(6, 12, 'name', 'users');
    this.handleBitSetsOfUsers(6, 13, 'surname', 'users');
    this.handleBitSetsOfUsers(6, 14, 'email', 'users');
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
    } else if (tabNum === 6) { // Admins
      this.BitSetTab6.set(bitIndex, 1);
      if (this.BitSetTab6.cardinality() === 3) {
        this.remainingOnTab6 = 0;
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
    } else if (tabNum === 6) { // Admins
      this.BitSetTab6.set(bitIndex, 0);
      this.remainingOnTab6 = this.requiredOnTab6;
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
    } else if (term === 'onboardingAgreement') {
      this.onboardingAgreement = !this.onboardingAgreement;
    }
    this.checkTerms();
  }

  checkTerms() {
    this.agreedToTerms = this.privacyPolicy && this.authorizedRepresentative && this.onboardingAgreement;
  }

  acceptTerms() {
    if (this._hasUserConsent && this.edit) {
      this.catalogueService.adminAcceptedTerms(this.catalogueId, this.pendingCatalogue).subscribe(
        res => {},
        error => { console.log(error); },
        () => {}
      );
    }
  }

  /** <--Terms Modal **/

  /** Submit Comment Modal--> **/
  showCommentModal() {
    if (this.edit && !this.pendingCatalogue) {
      UIkit.modal('#commentModal').show();
    } else {
      this.registerCatalogue(false);
    }
  }

  /** <--Submit Comment Modal **/

  submitSuggestion(entryValueName, vocabulary, parent) {
    if (entryValueName.trim() !== '') {
      this.serviceProviderService.submitVocabularyEntry(entryValueName, vocabulary, parent, 'provider', this.catalogueId, null).subscribe(
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
    this.catalogueForm.get('legalStatus').setValue('');
  }

  switchToTab(id: string){
    const element: HTMLElement = document.getElementById(id) as HTMLElement;
    element.click();
    window.scrollTo(0, -1);
  }

}
