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
})
export class ProviderFormToPdfComponent implements OnInit {

  serviceORresource = environment.serviceORresource;

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

  // page_section: HTMLElement;
  // HTML_Width: number;
  // HTML_Height: number;
  // top_left_margin = 15;
  // PDF_Width: number;
  // PDF_Height: number;
  // canvas_image_width: number;
  // canvas_image_height: number;

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

  generatePDF() {

    let page_section: HTMLElement;
    let HTML_Width: number;
    let HTML_Height: number;
    const top_left_margin = 15;
    let PDF_Width: number;
    let PDF_Height: number;

    page_section = document.getElementById('page1');
    HTML_Width = page_section.offsetWidth;
    HTML_Height = page_section.offsetHeight;
    PDF_Width = HTML_Width + (top_left_margin * 2);
    PDF_Height = (PDF_Width * 1.2) + (top_left_margin * 2);

    const pdf = new jsPDF('p', 'pt', [PDF_Width, PDF_Height]);

    html2canvas(document.getElementById('page1'), { allowTaint: true }).then(function(canvas) {

      const imgData = canvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'JPG', top_left_margin, top_left_margin, HTML_Width, HTML_Height);

      html2canvas(document.getElementById('page2'), { allowTaint: true }).then(function(canvas2) {

        page_section = document.getElementById('page2');
        HTML_Width = page_section.offsetWidth;
        HTML_Height = page_section.offsetHeight;
        PDF_Width = HTML_Width + (top_left_margin * 2);
        PDF_Height = (PDF_Width * 1.5) + (top_left_margin * 2);

        const imgData2 = canvas2.toDataURL('image/png', 1.0);
        pdf.addPage();
        pdf.addImage(imgData2, 'JPG', top_left_margin, top_left_margin, HTML_Width, HTML_Height);

        html2canvas(document.getElementById('page3'), { allowTaint: true }).then(function(canvas3) {

          page_section = document.getElementById('page3');
          HTML_Width = page_section.offsetWidth;
          HTML_Height = page_section.offsetHeight;
          PDF_Width = HTML_Width + (top_left_margin * 2);
          PDF_Height = (PDF_Width * 1.5) + (top_left_margin * 2);

          const imgData3 = canvas3.toDataURL('image/png', 1.0);
          pdf.addPage();
          pdf.addImage(imgData3, 'JPG', top_left_margin, top_left_margin, HTML_Width, HTML_Height);

          html2canvas(document.getElementById('page4'), { allowTaint: true }).then(function(canvas4) {

            page_section = document.getElementById('page4');
            HTML_Width = page_section.offsetWidth;
            HTML_Height = page_section.offsetHeight;
            PDF_Width = HTML_Width + (top_left_margin * 2);
            PDF_Height = (PDF_Width * 1.5) + (top_left_margin * 2);

            const imgData4 = canvas4.toDataURL('image/png', 1.0);
            pdf.addPage();
            pdf.addImage(imgData4, 'JPG', top_left_margin, top_left_margin, HTML_Width, HTML_Height);

            html2canvas(document.getElementById('page5'), { allowTaint: true }).then(function(canvas5) {

              page_section = document.getElementById('page5');
              HTML_Width = page_section.offsetWidth;
              HTML_Height = page_section.offsetHeight;
              PDF_Width = HTML_Width + (top_left_margin * 2);
              PDF_Height = (PDF_Width * 1.5) + (top_left_margin * 2);

              const imgData5 = canvas5.toDataURL('image/png', 1.0);
              pdf.addPage();
              pdf.addImage(imgData5, 'JPG', top_left_margin, top_left_margin, HTML_Width, HTML_Height);

              html2canvas(document.getElementById('page6'), { allowTaint: true }).then(function(canvas6) {

                page_section = document.getElementById('page6');
                HTML_Width = page_section.offsetWidth;
                HTML_Height = page_section.offsetHeight;
                PDF_Width = HTML_Width + (top_left_margin * 2);
                PDF_Height = (PDF_Width * 1.5) + (top_left_margin * 2);

                const imgData6 = canvas6.toDataURL('image/png', 1.0);
                pdf.addPage();
                pdf.addImage(imgData6, 'JPG', top_left_margin, top_left_margin, HTML_Width, HTML_Height);

                html2canvas(document.getElementById('page7'), { allowTaint: true }).then(function(canvas7) {

                  page_section = document.getElementById('page7');
                  HTML_Width = page_section.offsetWidth;
                  HTML_Height = page_section.offsetHeight;
                  PDF_Width = HTML_Width + (top_left_margin * 2);
                  PDF_Height = (PDF_Width * 1.5) + (top_left_margin * 2);

                  const imgData7 = canvas7.toDataURL('image/png', 1.0);
                  pdf.addPage();
                  pdf.addImage(imgData7, 'JPG', top_left_margin, top_left_margin, HTML_Width, HTML_Height);

                  html2canvas(document.getElementById('page8'), { allowTaint: true }).then(function(canvas8) {

                    page_section = document.getElementById('page8');
                    HTML_Width = page_section.offsetWidth;
                    HTML_Height = page_section.offsetHeight;
                    PDF_Width = HTML_Width + (top_left_margin * 2);
                    PDF_Height = (PDF_Width * 1.5) + (top_left_margin * 2);

                    const imgData8 = canvas8.toDataURL('image/png', 1.0);
                    pdf.addPage();
                    pdf.addImage(imgData8, 'JPG', top_left_margin, top_left_margin, HTML_Width, HTML_Height);

                    html2canvas(document.getElementById('page9'), { allowTaint: true }).then(function(canvas9) {

                      page_section = document.getElementById('page9');
                      HTML_Width = page_section.offsetWidth;
                      HTML_Height = page_section.offsetHeight;
                      PDF_Width = HTML_Width + (top_left_margin * 2);
                      PDF_Height = (PDF_Width * 1.5) + (top_left_margin * 2);

                      const imgData9 = canvas9.toDataURL('image/png', 1.0);
                      pdf.addPage();
                      pdf.addImage(imgData9, 'JPG', top_left_margin, top_left_margin, HTML_Width, HTML_Height);

                      html2canvas(document.getElementById('page10'), { allowTaint: true }).then(function(canvas10) {

                        page_section = document.getElementById('page10');
                        HTML_Width = page_section.offsetWidth;
                        HTML_Height = page_section.offsetHeight;
                        PDF_Width = HTML_Width + (top_left_margin * 2);
                        PDF_Height = (PDF_Width * 1.5) + (top_left_margin * 2);

                        const imgData10 = canvas10.toDataURL('image/png', 1.0);
                        pdf.addPage();
                        pdf.addImage(imgData10, 'JPG', top_left_margin, top_left_margin, HTML_Width, HTML_Height);

                        setTimeout(function() {

                          // Save PDF Doc
                          pdf.save('Provider-Form.pdf');

                        }, 0);

                      });

                    });

                  });

                });

              });

            });

          });

        });

      });

    });
  }

  getPDF() {

    const HTML_Width = document.getElementById('provider-sample-form').offsetWidth;
    const HTML_Height = document.getElementById('provider-sample-form').offsetHeight;
    const top_left_margin = 15;
    const PDF_Width = HTML_Width + (top_left_margin * 2);
    const PDF_Height = (PDF_Width * 1.5) + (top_left_margin * 2);
    const canvas_image_width = HTML_Width;
    const canvas_image_height = HTML_Height;

    const totalPDFPages = Math.ceil(HTML_Height / PDF_Height) - 1;


    html2canvas(document.getElementById('provider-sample-form'), {allowTaint : true}).then(function(canvas) {
      canvas.getContext('2d');

      console.log(canvas.height + '' + canvas.width);


      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'pt',  [PDF_Width, PDF_Height]);
      pdf.addImage(imgData, 'JPG', top_left_margin, top_left_margin, canvas_image_width, canvas_image_height);


      for (let i = 1; i <= totalPDFPages; i++) {
        // pdf.addPage(PDF_Width, PDF_Height);
        pdf.addPage();
        pdf.addImage(imgData, 'JPG', top_left_margin, -(PDF_Height * i) + (top_left_margin * 4), canvas_image_width, canvas_image_height);
      }

      pdf.save('HTML-Provider-Form.pdf');
    });
  }

  htmlToPDF() {
    // parentdiv is the html element which has to be converted to PDF
    html2canvas(document.getElementById('provider-sample-form')).then(canvas => {

      const pdf = new jsPDF('p', 'pt', [canvas.width, canvas.height]);

      const imgData  = canvas.toDataURL('image/jpeg', 1.0);
      pdf.addImage(imgData, 0, 0, canvas.width, canvas.height);
      pdf.save('providerForm.pdf');
    });
  }


  // htmlToPDF() {
  //   const node = document.getElementById('provider-sample-form');
  //   let img;
  //   let newImage;
  //   console.log('1');
  //   domtoimage.toPng(node, { bgcolor: '#fff' })
  //     .then(function(dataUrl) {
  //       console.log('2');
  //       img = new Image();
  //       console.log('3');
  //       img.src = dataUrl;
  //       console.log('4');
  //       newImage = img.src;
  //       console.log('5');
  //       img.onload = function() {
  //         console.log('6');
  //         const pdfWidth = img.width;
  //         console.log('7');
  //         const pdfHeight = img.height;
  //         // FileSaver.saveAs(dataUrl, 'my-pdfimage.png'); // Save as Image
  //         let doc;
  //         console.log('8');
  //         if (pdfWidth > pdfHeight) {
  //           doc = new jsPDF('l', 'px', [pdfWidth , pdfHeight]);
  //           console.log('9');
  //         } else {
  //           doc = new jsPDF('p', 'px', [pdfWidth , pdfHeight]);
  //           console.log('10');
  //         }
  //
  //         const width = doc.internal.pageSize.getWidth();
  //         const height = doc.internal.pageSize.getHeight();
  //         console.log('b4 save');
  //         doc.addImage(newImage, 'PNG',  10, 10, width, height);
  //         doc.save('providerForm.pdf');
  //       };
  //     })
  //     .catch(function(error) {
  //       // Error Handling
  //       console.log('Error converting to pdf');
  //     });
  // }

}

