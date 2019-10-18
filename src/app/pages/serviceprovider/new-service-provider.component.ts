import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {
  Description,
  legalNameDesc,
  acronymDesc,
  legalFormDesc,
  websiteDesc,
  providerDescriptionDesc,
  providerLogoDesc,
  providerMultimediaDesc,
  providerScientificDomainDesc,
  ProviderScientificSubDomainDesc,
  typeDesc,
  participatingCountriesDesc,
  affiliationDesc,
  providerTagsDesc,
  streetNameAndNumberDesc,
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
  nationalRoadmapsDesc
} from '../eInfraServices/services.description';
import {AuthenticationService} from '../../services/authentication.service';
import {ServiceProviderService} from '../../services/service-provider.service';
import {Router} from '@angular/router';
import {URLValidator} from '../../shared/validators/generic.validator';

declare var UIkit: any;

@Component({
  selector: 'app-new-service-provider',
  templateUrl: './new-service-provider.component.html'
})
export class NewServiceProviderComponent implements OnInit {
  errorMessage = '';
  userInfo = {family_name: '', given_name: '', email: ''};
  newProviderForm: FormGroup;
  logoUrl = '';

  readonly legalNameDesc: Description = legalNameDesc;
  readonly acronymDesc: Description = acronymDesc;
  readonly legalFormDesc: Description = legalFormDesc;
  readonly websiteDesc: Description = websiteDesc;
  readonly providerDescriptionDesc: Description = providerDescriptionDesc;
  readonly providerLogoDesc: Description = providerLogoDesc;
  readonly providerMultimediaDesc: Description = providerMultimediaDesc;
  readonly providerScientificDomainDesc: Description = providerScientificDomainDesc;
  readonly ProviderScientificSubDomainDesc: Description = ProviderScientificSubDomainDesc;
  readonly typeDesc: Description = typeDesc;
  readonly participatingCountriesDesc: Description = participatingCountriesDesc;
  readonly affiliationDesc: Description = affiliationDesc;
  readonly providerTagsDesc: Description = providerTagsDesc;
  readonly streetNameAndNumberDesc: Description = streetNameAndNumberDesc;
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

  readonly formDefinition = {
    // id: ['', Validators.compose([Validators.required, Validators.pattern(/^[a-zA-z][a-zA-Z0-9-_]{1,}$/)])],
    legalName: ['', Validators.required],
    acronym: [''],
    legalForm: ['', Validators.required],
    website: ['', Validators.compose([Validators.required, URLValidator])],
    description: ['', Validators.required],
    logo: ['', Validators.compose([Validators.required, URLValidator])],
    multimedia: this.fb.array([this.fb.control('', URLValidator)]),
    scientificDomains: this.fb.array([]),
    scientificSubdomains: this.fb.array([]),
    types: this.fb.array([this.fb.control('', Validators.required)], Validators.required),
    participatingCountries: this.fb.array([this.fb.control('')]),
    affiliations: this.fb.array([this.fb.control('')]),
    tags: this.fb.array([this.fb.control('')]),
    location: this.fb.group({
      streetNameNumber: ['', Validators.required],
      postalCode: ['', Validators.required],
      city: ['', Validators.required],
      region: [''],
      country: ['', Validators.required]
    }),
    contacts: this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.required],
      phone: [''],
      position: [''],
    }),
    certifications: this.fb.array([this.fb.control('')]),
    esfriDomains: this.fb.array([this.fb.control('')]),
    hostingLegalEntity: [''],
    esfriParticipation: [''],
    lifeCycleStatus: [''],
    areasOfActivity: this.fb.array([this.fb.control('')]),
    societalGrandChallenges: this.fb.array([this.fb.control('')]),
    nationalRoadmap: [''],
    users: this.fb.array([
      this.user()
    ])
  };

  constructor(private fb: FormBuilder,
              private authService: AuthenticationService,
              private serviceProviderService: ServiceProviderService,
              private router: Router) {
  }

  ngOnInit() {
    this.newProviderForm = this.fb.group(this.formDefinition);
    this.userInfo.given_name = this.authService.getUserProperty('given_name');
    this.userInfo.family_name = this.authService.getUserProperty('family_name');
    this.userInfo.email = this.authService.getUserProperty('email');
    this.usersArray.controls[0].get('email').setValue(this.userInfo.email);
    this.usersArray.controls[0].get('name').setValue(this.userInfo.given_name);
    this.usersArray.controls[0].get('surname').setValue(this.userInfo.family_name);
  }

  user(): FormGroup {
    return this.fb.group({
      email: ['', Validators.compose([Validators.required, Validators.email])],
      id: [''],
      name: ['', Validators.required],
      surname: ['', Validators.required]
    });
  }

  registerProvider() {
    this.errorMessage = '';
    this.trimFormWhiteSpaces();

    if (this.newProviderForm.valid) {
      this.serviceProviderService.createNewServiceProvider(this.newProviderForm.value).subscribe(
        res => {},
        err => {
          this.errorMessage = 'Something went wrong. ' + err.error;
        },
        () => {
          this.router.navigate(['/myServiceProviders']);
        }
      );
    } else {
      this.newProviderForm.markAsDirty();
      this.newProviderForm.updateValueAndValidity();
      for (const i in this.newProviderForm.controls) {
        this.newProviderForm.controls[i].markAsDirty();
      }
      window.scrollTo(0, 0);
      if (!this.newProviderForm.valid) {
        this.errorMessage = 'Please fill in all required fields (marked with an asterisk),' +
          ' and fix the data format in fields underlined with a red colour.';
      }
    }
  }

  /** handle form arrays -> **/
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
  /** <- handle form arrays**/

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
    console.log(index);
    this.usersArray.removeAt(index);
  }

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

  trimFormWhiteSpaces() {
    for (const i in this.newProviderForm.controls) {
      if (this.newProviderForm.controls[i].value && this.newProviderForm.controls[i].value.constructor === Array) {
        for (let j = 0; j < this.newProviderForm.controls[i].value.length; j++) {
          this.newProviderForm.controls[i].value[j].email = this.newProviderForm.controls[i].value[j].email
            .trim().replace(/\s\s+/g, ' ');
          this.newProviderForm.controls[i].value[j].name = this.newProviderForm.controls[i].value[j].name
            .trim().replace(/\s\s+/g, ' ');
          this.newProviderForm.controls[i].value[j].surname = this.newProviderForm.controls[i].value[j].surname
            .trim().replace(/\s\s+/g, ' ');
        }
      } else if (this.newProviderForm.controls[i].value) {
        this.newProviderForm.controls[i].setValue(this.newProviderForm.controls[i].value.trim().replace(/\s\s+/g, ' '));
      }
    }
  }

}
