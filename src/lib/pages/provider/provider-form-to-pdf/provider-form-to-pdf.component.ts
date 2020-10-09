import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import * as sd from '../../provider-resources/services.description';
import {AuthenticationService} from '../../../services/authentication.service';
import {ServiceProviderService} from '../../../services/service-provider.service';
import {ActivatedRoute, Router} from '@angular/router';
import {URLValidator} from '../../../shared/validators/generic.validator';
import {Vocabulary, Type, Provider} from '../../../domain/eic-model';
import {ResourceService} from '../../../services/resource.service';
import BitSet from 'bitset/bitset';
import {environment} from '../../../../environments/environment';
import {PremiumSortPipe} from '../../../shared/pipes/premium-sort.pipe';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import domtoimage from 'dom-to-image';


declare var UIkit: any;

@Component({
  selector: 'app-provider-form-to-pdf',
  templateUrl: './provider-form-to-pdf.component.html',
  styleUrls: ['./provider-form-to-pdf.component.css']
})
export class ProviderFormToPdfComponent implements OnInit {

  private _hasUserConsent = environment.hasUserConsent;

  projectName = environment.projectName;
  projectMail = environment.projectMail;
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

  codeOfConduct = false;
  privacyPolicy = false;
  authorizedRepresentative = false;
  agreedToTerms: boolean;


  readonly fullNameDesc: sd.Description = sd.fullNameDesc;
  readonly abbreviationDesc: sd.Description = sd.abbreviationDesc;
  readonly websiteDesc: sd.Description = sd.websiteDesc;
  readonly providerDescriptionDesc: sd.Description = sd.providerDescriptionDesc;
  readonly providerLogoDesc: sd.Description = sd.providerLogoDesc;
  readonly providerMultimediaDesc: sd.Description = sd.providerMultimediaDesc;
  readonly providerScientificDomainDesc: sd.Description = sd.providerScientificDomainDesc;
  readonly providerScientificSubdomainsDesc: sd.Description = sd.providerScientificSubdomainsDesc;
  readonly structureTypesDesc: sd.Description = sd.structureTypesDesc;
  readonly participatingCountriesDesc: sd.Description = sd.participatingCountriesDesc;
  readonly affiliationDesc: sd.Description = sd.affiliationDesc;
  readonly providerTagsDesc: sd.Description = sd.providerTagsDesc;
  readonly streetNameAndNumberDesc: sd.Description = sd.streetNameAndNumberDesc;
  readonly postalCodeDesc: sd.Description = sd.postalCodeDesc;
  readonly cityDesc: sd.Description = sd.cityDesc;
  readonly regionDesc: sd.Description = sd.regionDesc;
  readonly countryDesc: sd.Description = sd.countryDesc;
  readonly providerMainContactFirstNameDesc: sd.Description = sd.providerMainContactFirstNameDesc;
  readonly providerMainContactLastNameDesc: sd.Description = sd.providerMainContactLastNameDesc;
  readonly providerMainContactEmailDesc: sd.Description = sd.providerMainContactEmailDesc;
  readonly providerMainContactPhoneDesc: sd.Description = sd.providerMainContactPhoneDesc;
  readonly providerMainContactPositionDesc: sd.Description = sd.providerMainContactPositionDesc;
  readonly providerPublicContactFirstNameDesc: sd.Description = sd.providerPublicContactFirstNameDesc;
  readonly providerPublicContactLastNameDesc: sd.Description = sd.providerPublicContactLastNameDesc;
  readonly providerPublicContactEmailDesc: sd.Description = sd.providerPublicContactEmailDesc;
  readonly providerPublicContactPhoneDesc: sd.Description = sd.providerPublicContactPhoneDesc;
  readonly providerPublicContactPositionDesc: sd.Description = sd.providerPublicContactPositionDesc;
  readonly providerCertificationsDesc: sd.Description = sd.providerCertificationsDesc;
  readonly lifeCycleStatusDesc: sd.Description = sd.lifeCycleStatusDesc;
  readonly ESFRIDomainDesc: sd.Description = sd.ESFRIDomainDesc;
  readonly hostingLegalEntityDesc: sd.Description = sd.hostingLegalEntityDesc;
  readonly ESFRITypeDesc: sd.Description = sd.ESFRITypeDesc;
  readonly merilScientificDomainsDesc: sd.Description = sd.merilScientificDomainsDesc;
  readonly merilScientificSubdomainsDesc: sd.Description = sd.merilScientificSubdomainsDesc;
  readonly areasOfActivityDesc: sd.Description = sd.areasOfActivityDesc;
  readonly societalGrandChallengesDesc: sd.Description = sd.societalGrandChallengesDesc;
  readonly nationalRoadmapsDesc: sd.Description = sd.nationalRoadmapsDesc;
  readonly legalEntityDesc: sd.Description = sd.legalEntityDesc;
  readonly legalStatusDesc: sd.Description = sd.legalStatusDesc;
  readonly networksDesc: sd.Description = sd.networksDesc;

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
    // this.setVocabularies();
    this.newProviderForm = this.fb.group(this.formDefinition);
    if (this.edit === false) {
      this.pushDomain();
      this.pushMerilDomain();
      // this.addDefaultUser();  // Admin
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
    this.usersArray.controls[0].get('email').setValue(this.userInfo.email);
    this.usersArray.controls[0].get('name').setValue(this.userInfo.given_name);
    this.usersArray.controls[0].get('surname').setValue(this.userInfo.family_name);
  }

  /** <-- User Array**/

  downloadProviderFormPDF() {
    window.open('../../../lib/files/providerForm.pdf', '_blank');
  }

  unsavedChangesPrompt() {
    this.hasChanges = true;
  }

  // htmlToPDF() {
  //   // parentdiv is the html element which has to be converted to PDF
  //   html2canvas(document.getElementById('provider-sample-form')).then(canvas => {
  //
  //     const pdf = new jsPDF('p', 'pt', [canvas.width, canvas.height]);
  //
  //     const imgData  = canvas.toDataURL('image/jpeg', 1.0);
  //     pdf.addImage(imgData, 0, 0, canvas.width, canvas.height);
  //     pdf.save('providerForm.pdf');
  //   });
  // }


  htmlToPDF() {
    const node = document.getElementById('provider-sample-form');
    let img;
    let newImage;
    domtoimage.toPng(node, { bgcolor: '#fff' })
      .then(function(dataUrl) {
        img = new Image();
        img.src = dataUrl;
        newImage = img.src;
        img.onload = function() {
          const pdfWidth = img.width;
          const pdfHeight = img.height;
          // FileSaver.saveAs(dataUrl, 'my-pdfimage.png'); // Save as Image
          let doc;
          if (pdfWidth > pdfHeight) {
            doc = new jsPDF('l', 'px', [pdfWidth , pdfHeight]);
          } else {
            doc = new jsPDF('p', 'px', [pdfWidth , pdfHeight]);
          }

          const width = doc.internal.pageSize.getWidth();
          const height = doc.internal.pageSize.getHeight();
console.log('b4 save');
          doc.addImage(newImage, 'PNG',  10, 10, width, height);
          doc.save('providerForm.pdf');
        };
      })
      .catch(function(error) {
        // Error Handling
      });
  }

}

