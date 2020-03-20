import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {
  Description,
  fullNameDesc,
  acronymDesc,
  legalFormDesc,
  websiteDesc,
  providerDescriptionDesc,
  providerLogoDesc,
  providerMultimediaDesc,
  providerScientificDomainDesc,
  providerCategoryDesc,
  typeDesc,
  participatingCountriesDesc,
  affiliationDesc,
  providerTagsDesc,
  streetNameDesc,
  streetNumberDesc,
  locationNameDesc,
  postalCodeDesc,
  cityDesc,
  regionDesc,
  countryDesc,
  providerMainContactFirstNameDesc,
  providerMainContactLastNameDesc,
  providerMainContactEmailDesc,
  providerMainContactPhoneDesc,
  providerMainContactPositionDesc,
  providerPublicContactFirstNameDesc,
  providerPublicContactLastNameDesc,
  providerPublicContactEmailDesc,
  providerPublicContactPhoneDesc,
  providerPublicContactPositionDesc,
  providerCertificationsDesc,
  lifeCycleStatusDesc,
  ESFRIDomainDesc,
  hostingLegalEntityDesc,
  ESFRIDesc,
  areasOfActivityDesc,
  societalGrandChallengesDesc,
  nationalRoadmapsDesc,
  legalStatusDesc,
  networksDesc, multimediaDesc
} from '../eInfraServices/services.description';
import {AuthenticationService} from '../../services/authentication.service';
import {ServiceProviderService} from '../../services/service-provider.service';
import {ActivatedRoute, Router} from '@angular/router';
import {URLValidator} from '../../shared/validators/generic.validator';
import {Vocabulary, VocabularyType, Provider} from '../../domain/eic-model';
import {ResourceService} from '../../services/resource.service';

declare var UIkit: any;

@Component({
  selector: 'app-new-service-provider',
  templateUrl: './service-provider-form.component.html',
  styleUrls: ['./service-provider-form.component.css']
})
export class ServiceProviderFormComponent implements OnInit {
  errorMessage = '';
  userInfo = {family_name: '', given_name: '', email: ''};
  newProviderForm: FormGroup;
  logoUrl = '';
  vocabularies: Map<string, Vocabulary[]> = null;
  edit = false;
  pendingProvider = false;
  disable = false;
  showLoader = false;
  tabs: boolean[] = [false, false, false, false, false, false, false];

  readonly fullNameDesc: Description = fullNameDesc;
  readonly acronymDesc: Description = acronymDesc;
  readonly legalFormDesc: Description = legalFormDesc;
  readonly websiteDesc: Description = websiteDesc;
  readonly providerDescriptionDesc: Description = providerDescriptionDesc;
  readonly providerLogoDesc: Description = providerLogoDesc;
  readonly providerMultimediaDesc: Description = providerMultimediaDesc;
  readonly providerScientificDomainDesc: Description = providerScientificDomainDesc;
  readonly providerCategoryDesc: Description = providerCategoryDesc;
  readonly typeDesc: Description = typeDesc;
  readonly participatingCountriesDesc: Description = participatingCountriesDesc;
  readonly affiliationDesc: Description = affiliationDesc;
  readonly providerTagsDesc: Description = providerTagsDesc;
  readonly locationNameDesc: Description = locationNameDesc;
  readonly streetNameDesc: Description = streetNameDesc;
  readonly streetNumberDesc: Description = streetNumberDesc;
  readonly postalCodeDesc: Description = postalCodeDesc;
  readonly cityDesc: Description = cityDesc;
  readonly regionDesc: Description = regionDesc;
  readonly countryDesc: Description = countryDesc;
  readonly providerMainContactFirstNameDesc: Description = providerMainContactFirstNameDesc;
  readonly providerMainContactLastNameDesc: Description = providerMainContactLastNameDesc;
  readonly providerMainContactEmailDesc: Description = providerMainContactEmailDesc;
  readonly providerMainContactPhoneDesc: Description = providerMainContactPhoneDesc;
  readonly providerMainContactPositionDesc: Description = providerMainContactPositionDesc;
  readonly providerPublicContactFirstNameDesc: Description = providerPublicContactFirstNameDesc;
  readonly providerPublicContactLastNameDesc: Description = providerPublicContactLastNameDesc;
  readonly providerPublicContactEmailDesc: Description = providerPublicContactEmailDesc;
  readonly providerPublicContactPhoneDesc: Description = providerPublicContactPhoneDesc;
  readonly providerPublicContactPositionDesc: Description = providerPublicContactPositionDesc;
  readonly providerCertificationsDesc: Description = providerCertificationsDesc;
  readonly lifeCycleStatusDesc: Description = lifeCycleStatusDesc;
  readonly ESFRIDomainDesc: Description = ESFRIDomainDesc;
  readonly hostingLegalEntityDesc: Description = hostingLegalEntityDesc;
  readonly ESFRIDesc: Description = ESFRIDesc;
  readonly areasOfActivityDesc: Description = areasOfActivityDesc;
  readonly societalGrandChallengesDesc: Description = societalGrandChallengesDesc;
  readonly nationalRoadmapsDesc: Description = nationalRoadmapsDesc;
  readonly legalStatusDesc: Description = legalStatusDesc;
  readonly networksDesc: Description = networksDesc;

  placesVocabulary: Vocabulary[] = null;
  providerTypeVocabulary: Vocabulary[] = null;
  providerTRLVocabulary: Vocabulary[] = null;
  domainsVocabulary: Vocabulary[] = null;
  categoriesVocabulary: Vocabulary[] = null;
  esfriDomainVocabulary: Vocabulary[] = null;
  legalStatusVocabulary: Vocabulary[] = null;
  esfriVocabulary: Vocabulary[] = null;
  areasOfActivityVocabulary: Vocabulary[] = null;
  networksVocabulary: Vocabulary[] = null;
  societalGrandChallengesVocabulary: Vocabulary[] = null;

  readonly formDefinition = {
    id: [''],
    name: ['', Validators.required],
    acronym: ['', Validators.required],
    // legalForm: ['', Validators.required],
    website: ['', Validators.compose([Validators.required, URLValidator])],
    description: ['', Validators.required],
    logo: ['', Validators.compose([Validators.required, URLValidator])],
    multimedia: this.fb.array([this.fb.control('', URLValidator)]),
    domains: this.fb.array([]),
    categories: this.fb.array([]),
    types: this.fb.array([this.fb.control('', Validators.required)], Validators.required),
    // affiliations: this.fb.array([this.fb.control('')]),
    tags: this.fb.array([this.fb.control('')]),
    location: this.fb.group({
      name: ['', Validators.required],
      street: ['', Validators.required],
      number: ['', Validators.required],
      postalCode: ['', Validators.required],
      city: ['', Validators.required],
      region: ['', Validators.required]
    }, Validators.required),
    coordinatingCountry: ['', Validators.required],
    participatingCountries: this.fb.array([this.fb.control('')]),
    contacts: this.fb.array([
      this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', Validators.compose([Validators.required, Validators.email])],
        tel: ['', Validators.compose([Validators.required, Validators.pattern('[+]?\\d+$')])],
        position: [''],
      }, Validators.required)
    ]),
    // certifications: this.fb.array([this.fb.control('')]),
    esfriDomains: this.fb.array([this.fb.control('')]),
    hostingLegalEntity: [''],
    esfriParticipation: [''],
    lifeCycleStatus: ['', Validators.required],
    networks: this.fb.array([this.fb.control('')]),
    areasOfActivity: this.fb.array([this.fb.control('')]),
    societalGrandChallenges: this.fb.array([this.fb.control('')]),
    nationalRoadmap: [''],
    users: this.fb.array([
      this.user()
    ]),
    legalStatus: [''],
    categorization: this.fb.array([], Validators.required)
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
    if (path === 'registerServiceProvider/:id') {
      this.pendingProvider = true;
    }
    this.setVocabularies();
    this.newProviderForm = this.fb.group(this.formDefinition);
    if (this.edit === false) {
      this.pushDomain();
      this.addDefaultUser();
    }

    if (sessionStorage.getItem('provider')) {
      const data = JSON.parse(sessionStorage.getItem('provider'));
      for (const i in data) {
        if (data.hasOwnProperty(i)) {
          if (Array.isArray(data[i])) {
            // console.log(i);
            for (let j = 0; j < data[i].length - 1; j++) {
              if (i === 'categorization') {
                this.domainArray.push(this.newScientificDomain());
              } else if (i === 'contacts') {
                this.pushContact();
              } else if (i === 'users') {
                this.addUser();
              } else if ( i === 'types') {
                this.push(i, true);
              } else if ( i === 'multimedia') {
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
    if (path === 'registerServiceProvider/:id') {
      method = 'updateAndPublishPendingProvider';
    } else {
      method = this.edit ? 'updateServiceProvider' : 'createNewServiceProvider';
    }
    for (const category of this.domainArray.controls) {
      if (category.get('category').value) {
        this.getFieldAsFormArray('categories').push(this.fb.control(category.get('category').value));
      }
    }
    if (tempSave) {
      this.showLoader = true;
      window.scrollTo(0, 0);
      this.serviceProviderService.temporarySaveProvider(this.newProviderForm.value, (path !== 'registerServiceProvider/:id' && this.edit))
        .subscribe(
        res => {
          this.showLoader = false;
          this.router.navigate([`/registerServiceProvider/${res.id}`]);
        },
        err => {
          this.showLoader = false;
          window.scrollTo(0, 0);
          this.errorMessage = 'Something went wrong. ' + err.error;
        },
        () => {
          this.showLoader = false;
        }
      );
    } else if (this.newProviderForm.valid) {
      this.showLoader = true;
      window.scrollTo(0, 0);
      this.getFieldAsFormArray('categories').controls = [];

      this.serviceProviderService[method](this.newProviderForm.value).subscribe(
        res => {},
        err => {
          this.showLoader = false;
          window.scrollTo(0, 0);
          this.errorMessage = 'Something went wrong. ' + err.error;
        },
        () => {
          this.showLoader = false;
          if (this.edit) {
            this.router.navigate(['/myServiceProviders']);
          } else {
            this.authService.refreshLogin('/myServiceProviders');
          }
        }
      );
    } else {
      console.log(this.newProviderForm);
      this.markFormAsDirty();
      window.scrollTo(0, 0);
      this.markTabs();
      this.errorMessage = 'Please fill in all required fields (marked with an asterisk), and fix the data format in fields underlined with a red colour.';
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
            console.log('array with objectsg');
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
    this.tabs[0] = (this.checkFormValidity('name') || this.checkFormValidity('acronym')
      || this.checkFormValidity('website') || this.checkFormValidity('description')
      || this.checkFormValidity('logo') || this.checkEveryArrayFieldValidity('multimedia'));
    this.tabs[1] = (this.checkEveryArrayFieldValidity('types') || this.checkEveryArrayFieldValidity('tags')
      || this.checkEveryArrayFieldValidity('categorization', 'domain')
      || this.checkEveryArrayFieldValidity('esfriDomains') || this.checkEveryArrayFieldValidity('categorization', 'category'));
    this.tabs[2] = this.checkFormValidity('lifeCycleStatus');
    this.tabs[3] = (this.checkFormValidity('location.name') || this.checkFormValidity('location.street')
      || this.checkFormValidity('location.number') || this.checkFormValidity('location.postalCode')
      || this.checkFormValidity('location.city') || this.checkFormValidity('location.region')
      || this.checkFormValidity('coordinatingCountry') || this.checkEveryArrayFieldValidity('participatingCountries'));
    this.tabs[4] = (this.checkEveryArrayFieldValidity('contacts', 'firstName') || this.checkEveryArrayFieldValidity('contacts', 'lastName')
      || this.checkEveryArrayFieldValidity('contacts', 'email') || this.checkEveryArrayFieldValidity('contacts', 'email')
      || this.checkEveryArrayFieldValidity('contacts', 'position'));
    this.tabs[5] = (this.checkFormValidity('hostingLegalEntity') || this.checkFormValidity('legalStatus')
      || this.checkFormValidity('esfriParticipation') || this.checkEveryArrayFieldValidity('networks')
      || this.checkEveryArrayFieldValidity('areasOfActivity') || this.checkEveryArrayFieldValidity('societalGrandChallenges')
      || this.checkFormValidity('nationalRoadmap'));
    this.tabs[6] = (this.checkEveryArrayFieldValidity('users', 'name') || this.checkEveryArrayFieldValidity('users', 'surname')
      || this.checkEveryArrayFieldValidity('users', 'email'));

  }

  /** check form fields and tabs validity--> **/

  /** get and set vocabularies **/
  setVocabularies() {
    this.resourceService.getAllVocabulariesByType().subscribe(
      res => {
        this.vocabularies = res;
        this.placesVocabulary = this.vocabularies[VocabularyType.PLACE];
        this.providerTypeVocabulary = this.vocabularies[VocabularyType.PROVIDER_TYPE];
        this.providerTRLVocabulary = this.vocabularies[VocabularyType.PROVIDER_LIFE_CYCLE_STATUS];
        this.domainsVocabulary =  this.vocabularies[VocabularyType.PROVIDER_DOMAIN];
        this.categoriesVocabulary =  this.vocabularies[VocabularyType.PROVIDER_CATEGORY];
        this.esfriDomainVocabulary =  this.vocabularies[VocabularyType.PROVIDER_ESFRI_DOMAIN];
        this.legalStatusVocabulary =  this.vocabularies[VocabularyType.PROVIDER_LEGAL_STATUS];
        this.esfriVocabulary =  this.vocabularies[VocabularyType.PROVIDER_ESFRI];
        this.areasOfActivityVocabulary =  this.vocabularies[VocabularyType.PROVIDER_AREA_OF_ACTIVITY];
        this.networksVocabulary =  this.vocabularies[VocabularyType.PROVIDER_NETWORKS];
        this.societalGrandChallengesVocabulary =  this.vocabularies[VocabularyType.PROVIDER_SOCIETAL_GRAND_CHALLENGES];
        return this.vocabularies;
      },
      error => console.log(error),
      () => {
        return this.vocabularies;
      }
    );
  }

  /** Categorization --> **/
  newScientificDomain(): FormGroup {
    return this.fb.group({
      domain: ['', Validators.required],
      category: ['', Validators.required]
    });
  }

  get domainArray() {
    return this.newProviderForm.get('categorization') as FormArray;
  }

  pushDomain() {
    this.domainArray.push(this.newScientificDomain());
    this.domainArray.controls[this.domainArray.length - 1].get('category').disable();
  }

  removeDomain(index: number) {
    this.domainArray.removeAt(index);
  }

  onDomainChange(index: number) {
    this.domainArray.controls[index].get('category').enable();
    this.domainArray.controls[index].get('category').reset();
  }
  /** <-- Categorization **/

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
      tel: [''],
      position: [''],
    });
  }

  get contactArray() {
    return this.newProviderForm.get('contacts') as FormArray;
  }

  pushContact() {
    this.contactArray.push(this.newContact());
  }
  removeContact(index: number) {
    this.contactArray.removeAt(index);
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
    this.usersArray.controls[0].get('email').setValue(this.userInfo.email);
    this.usersArray.controls[0].get('name').setValue(this.userInfo.given_name);
    this.usersArray.controls[0].get('surname').setValue(this.userInfo.family_name);
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
      if (this.newProviderForm.controls[i].value && this.newProviderForm.controls[i].value.constructor === Array) {

      } else if (this.newProviderForm.controls[i].value && i !== 'location') {
        // console.log(i);
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
  }

  downloadProviderFormPDF() {
    window.open('../../../assets/files/providerForm.pdf', '_blank');
  }

}
