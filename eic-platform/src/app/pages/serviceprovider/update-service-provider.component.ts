import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Component, OnInit} from '@angular/core';
import {
  additionalInfoDesc,
  catalogueOfResourcesDesc,
  Description,
  logoUrlDesc,
  organizationIdDesc,
  organizationNameDesc,
  organizationWebsiteDesc,
  phoneNumberDesc,
  publicDescOfResourcesDesc
} from '../eInfraServices/services.description';
import {AuthenticationService} from '../../services/authentication.service';
import {ServiceProviderService} from '../../services/service-provider.service';
import {Provider} from '../../domain/eic-model';

declare var UIkit: any;

@Component({
  selector: 'app-update-service-provider',
  templateUrl: './update-service-provider.component.html'
})
export class UpdateServiceProviderComponent implements OnInit {
  errorMessage: string;
  logoError = false;
  logoUrlWorks = true;
  userInfo = {family_name: '', given_name: '', email: ''};
  updateProviderForm: FormGroup;
  logoUrl = '';
  provider: Provider;

  formDefinition = {
    id: ['', Validators.required],
    name: ['', Validators.required],
    logo: [''],
    contactInformation: [''],
    users: this.fb.array([
      // this.user()
    ]),
    website: ['', [Validators.required]],
    catalogueOfResources: [''],
    publicDescOfResources: [''],
    additionalInfo: ['', Validators.required]
  };

  organizationIdDesc: Description = organizationIdDesc;
  organizationNameDesc: Description = organizationNameDesc;
  phoneNumberDesc: Description = phoneNumberDesc;
  organizationWebsiteDesc: Description = organizationWebsiteDesc;
  catalogueOfResourcesDesc: Description = catalogueOfResourcesDesc;
  publicDescOfResourcesDesc: Description = publicDescOfResourcesDesc;
  additionalInfoDesc: Description = additionalInfoDesc;
  logoUrlDesc: Description = logoUrlDesc;

  constructor(private fb: FormBuilder,
              private authService: AuthenticationService,
              private serviceProviderService: ServiceProviderService,
              private route: ActivatedRoute,
              private router: Router) {
  }

  user(email: string, id: string, name: string, surname: string): FormGroup {
    return this.fb.group({
      email: [email, [Validators.required, Validators.email]],
      id: [id],
      name: [name, Validators.required],
      surname: [surname, Validators.required]
    });
  }

  ngOnInit() {
    this.updateProviderForm = this.fb.group(this.formDefinition);
    this.getProvider();
    this.userInfo.given_name = this.authService.getUserProperty('given_name');
    this.userInfo.family_name = this.authService.getUserProperty('family_name');
    this.userInfo.email = this.authService.getUserProperty('email');
  }

  updateProvider() {
    this.trimFormWhiteSpaces();

    if (!this.updateProviderForm.get('logo').value) {
      this.updateProviderForm.get('logo').setValue('');
    }
    if (!this.updateProviderForm.get('contactInformation').value) {
      this.updateProviderForm.get('contactInformation').setValue('');
    }
    if (!this.updateProviderForm.get('publicDescOfResources').value) {
      this.updateProviderForm.get('publicDescOfResources').setValue('');
    }
    if (!this.updateProviderForm.get('catalogueOfResources').value) {
      this.updateProviderForm.get('catalogueOfResources').setValue('');
    }

    // this.updateProviderForm.get('logo').setValue(ServiceProviderService.checkUrl(this.updateProviderForm.get('logo').value));
    this.updateProviderForm.get('logo').setValue(this.logoCheckUrl(this.updateProviderForm.get('logo').value));
    this.updateProviderForm.get('website').setValue(ServiceProviderService.checkUrl(this.updateProviderForm.get('website').value));
    this.updateProviderForm.get('catalogueOfResources')
      .setValue(ServiceProviderService.checkUrl(this.updateProviderForm.get('catalogueOfResources').value));
    this.updateProviderForm.get('publicDescOfResources')
      .setValue(ServiceProviderService.checkUrl(this.updateProviderForm.get('publicDescOfResources').value));
    this.updateProviderForm.get('id').enable();

    this.logoUrlWorks = this.imageExists(this.updateProviderForm.get('logo').value);
    this.errorMessage = '';

    if (this.updateProviderForm.valid && !this.logoError && this.logoUrlWorks) {

      this.serviceProviderService.updateServiceProvider(this.updateProviderForm.value).subscribe(
        res => console.log(res),
        err => {
          console.log(err);
          this.errorMessage = 'Something went wrong.';
        },
        () => {
          this.router.navigate(['/myServiceProviders']);
        }
      );
      // console.log('form is valid')
    } else {
      this.updateProviderForm.markAsDirty();
      this.updateProviderForm.updateValueAndValidity();
      for (const i in this.updateProviderForm.controls) {
        this.updateProviderForm.controls[i].markAsDirty();
        this.updateProviderForm.controls[i].updateValueAndValidity();
      }
      this.users.markAsDirty();
      this.users.updateValueAndValidity();
      for (const i in this.users.controls) {
        this.users.controls[i].get('surname').markAsDirty();
        this.users.controls[i].get('surname').updateValueAndValidity();
        // console.log(this.users.controls[i].get('surname').value);
        this.users.controls[i].get('email').markAsDirty();
        this.users.controls[i].get('email').updateValueAndValidity();
        // console.log(this.users.controls[i].get('email').value);
        this.users.controls[i].get('name').markAsDirty();
        this.users.controls[i].get('name').updateValueAndValidity();
        // console.log(this.users.controls[i].get('name').value);
      }
      window.scrollTo(0, 0);
      if (!this.updateProviderForm.valid) {
        this.errorMessage = 'Please fill in all required fields (marked with an asterisk), and fix the data format' +
          ' in fields underlined with a red colour.';
      }
      if (this.logoError) {
        this.updateProviderForm.get('logo').setErrors({'incorrect': true});
        this.logoError = false;
        this.errorMessage += ' Logo url must have https:// prefix.';
      }
      if (!this.logoUrlWorks) {
        this.updateProviderForm.get('logo').setErrors({'incorrect': true});
        this.errorMessage += ' Logo url doesn\'t point to a valid image.';
      }
    }
  }

  get users() { // return form resource types as array
    return this.updateProviderForm.get('users') as FormArray;
  }

  getProvider() {
    const id = this.route.snapshot.paramMap.get('id');
    this.errorMessage = '';
    this.serviceProviderService.getServiceProviderById(id).subscribe(
      provider => {
        this.provider = provider;
      },
      err => {
        console.log(err);
        this.errorMessage = 'Something went wrong.';
      },
      () => {
        this.updateProviderForm.patchValue(this.provider);
        // let users: User[] = [];
        for (let i = 0; i < this.provider.users.length; i++) {
          this.users.push(this.user(this.provider.users[i].email, this.provider.users[i].id,
            this.provider.users[i].name, this.provider.users[i].surname));
          // console.log(this.provider.users[i]);

          // this.user.patchValue(this.provider.users[i]);
          // console.log(this.user.value);
          // this.users.push(this.User);
          // console.log(this.users.value);
        }
        this.updateProviderForm.get('id').disable();
        this.updateProviderForm.updateValueAndValidity();
        // console.log(this.updateProviderForm.value);
      }
    );
  }

  addUser() {
    this.users.push(this.user('', null, '', ''));
  }

  deleteUser(index) {
    if (this.users.length === 1) {
      this.errorMessage = 'There must be at least one user!';
      window.scrollTo(0, 0);
      return;
    }
    let i = 0;
    // console.log(index.value);
    while (i < this.users.length) {
      if (this.users.value[i] === index.value) {
        this.users.removeAt(i);
        break;
      }
      i++;
    }
  }

  showLogoUrlModal() {
    if (this.updateProviderForm && this.updateProviderForm.get('logo').value) {
      this.logoUrl = this.updateProviderForm.get('logo').value;
    }
    UIkit.modal('#logoUrlModal').show();
  }

  addLogoUrl(logoUrl: string) {
    UIkit.modal('#logoUrlModal').hide();
    this.logoUrl = logoUrl;
    this.updateProviderForm.get('logo').setValue(logoUrl);
    this.updateProviderForm.get('logo').updateValueAndValidity();
  }

  imageExists(url) {
    if (url === '') {// image is not required for providers
      return true;
    }
    const image = new Image();
    image.src = url;
    if (!image.complete) {
      return false;
    } else if (image.height === 0) {
      return false;
    }

    return true;
  }

  logoCheckUrl(url: string) {
    if (url !== '') {
      if (url.match(/^(http:\/\/.+)?$/)) {
        this.updateProviderForm.controls['logo'].setErrors({'incorrect': true});
        this.updateProviderForm.get('logo').setErrors({'incorrect': true});
        this.logoError = true;
      } else if (!url.match(/^(https:\/\/.+)?$/)) {
        url = 'https://' + url;
      }
    }
    // console.log(url);
    return url;
  }

  trimFormWhiteSpaces() {
    for (const i in this.updateProviderForm.controls) {
      if (this.updateProviderForm.controls[i].value && this.updateProviderForm.controls[i].value.constructor === Array) {
        for (let j = 0; j < this.updateProviderForm.controls[i].value.length; j++) {
          this.updateProviderForm.controls[i].value[j].email = this.updateProviderForm.controls[i].value[j].email
            .trim().replace(/\s\s+/g, ' ');
          this.updateProviderForm.controls[i].value[j].name = this.updateProviderForm.controls[i].value[j].name
            .trim().replace(/\s\s+/g, ' ');
          this.updateProviderForm.controls[i].value[j].surname = this.updateProviderForm.controls[i].value[j].surname
            .trim().replace(/\s\s+/g, ' ');
        }
      } else if (this.updateProviderForm.controls[i].value) {
        this.updateProviderForm.controls[i].setValue(this.updateProviderForm.controls[i].value.trim().replace(/\s\s+/g, ' '));
      }
    }
  }
}
