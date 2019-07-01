import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Component, Injector, OnInit} from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {NavigationService} from '../../services/navigation.service';
import {ResourceService} from '../../services/resource.service';
import {UserService} from '../../services/user.service';
import * as sd from './services.description';
import {NewVocabulary, Service, VocabularyType} from '../../domain/eic-model';
import {IndicatorsPage} from '../../domain/indicators';
import {ProvidersPage} from '../../domain/funders-page';
import {URLValidator} from '../../shared/validators/generic.validator';
import {zip} from 'rxjs/internal/observable/zip';

@Component({
  selector: 'app-service-form',
  templateUrl: './service-form.component.html'
})
export class ServiceFormComponent implements OnInit {
  firstServiceForm = false;
  providerId: string;
  editMode: boolean;
  serviceForm: FormGroup;
  private servicePostSuccess = false;
  service: Service;
  serviceID: string;
  errorMessage = '';
  logoError = false;
  logoUrlWorks = true;
  successMessage: string = null;
  weights: string[] = [];
  fb: FormBuilder = this.injector.get(FormBuilder);

  measurementForm: FormGroup;
  places: NewVocabulary[] = null;
  public indicators: IndicatorsPage;
  public indicatorDesc = '';
  public idArray: string[] = [];

  readonly urlDesc: sd.Description = sd.urlDesc;
  readonly nameDesc: sd.Description = sd.nameDesc;
  readonly taglineDesc: sd.Description = sd.taglineDesc;
  readonly descriptionDesc: sd.Description = sd.descriptionDesc;
  readonly optionsDesc: sd.Description = sd.optionsDesc;
  readonly targetUsersDesc: sd.Description = sd.targetUsersDesc;
  readonly userValueDesc: sd.Description = sd.userValueDesc;
  readonly userBaseDesc: sd.Description = sd.userBaseDesc;
  readonly symbolDesc: sd.Description = sd.symbolDesc;
  readonly multimediaURLDesc: sd.Description = sd.multimediaURLDesc;
  readonly providersDesc: sd.Description = sd.providersDesc;
  readonly versionDesc: sd.Description = sd.versionDesc;
  readonly lastUpdateDesc: sd.Description = sd.lastUpdateDesc;
  readonly changeLogDesc: sd.Description = sd.changeLogDesc;
  readonly validForDesc: sd.Description = sd.validForDesc;
  readonly lifeCycleStatusDesc: sd.Description = sd.lifeCycleStatusDesc;
  readonly trlDesc: sd.Description = sd.trlDesc;
  readonly categoryDesc: sd.Description = sd.categoryDesc;
  readonly subcategoryDesc: sd.Description = sd.subcategoryDesc;
  readonly placesDesc: sd.Description = sd.placesDesc;
  readonly languagesDesc: sd.Description = sd.languagesDesc;
  readonly tagsDesc: sd.Description = sd.tagsDesc;
  readonly requiredServicesDesc: sd.Description = sd.requiredServicesDesc;
  readonly relatedServicesDesc: sd.Description = sd.relatedServicesDesc;
  readonly orderDesc: sd.Description = sd.orderDesc;
  readonly helpdeskDesc: sd.Description = sd.helpdeskDesc;
  readonly userManualDesc: sd.Description = sd.userManualDesc;
  readonly trainingInformationDesc: sd.Description = sd.trainingInformationDesc;
  readonly feedbackDesc: sd.Description = sd.feedbackDesc;
  readonly priceDesc: sd.Description = Object.assign({mandatory: false}, sd.priceDesc);
  readonly serviceLevelAgreementDesc: sd.Description = sd.serviceLevelAgreementDesc;
  readonly termsOfUseDesc: sd.Description = sd.termsOfUseDesc;
  readonly fundingDesc: sd.Description = sd.fundingDesc;

  formGroupMeta = {
    'id': '',
    'url': ['', Validators.compose([Validators.required, URLValidator])],
    'name': ['', Validators.required],
    'tagline': [''],
    'description': ['', Validators.required],
    'options': [''],
    'targetUsers': [''],
    'userValue': [''],
    'userBase': [''],
    'symbol': ['', Validators.compose([Validators.required, URLValidator])],
    'multimediaURL': ['', URLValidator],
    // providers is defined in component
    'providers': this.fb.array([
      this.fb.control('', Validators.required)
    ], Validators.required),
    'version': ['', Validators.required],
    'lastUpdate': ['', Validators.required],
    'changeLog': [''],
    'validFor': [''],
    'lifeCycleStatus': ['', Validators.compose([Validators.required])],
    'trl': ['', Validators.compose([Validators.required])],
    'supercategory': ['', Validators.required],
    'category': ['', Validators.required],
    'subcategory': ['', Validators.required],
    'places': this.fb.array([
      this.fb.control('', Validators.required)
    ], Validators.required),
    'languages': this.fb.array([
      this.fb.control('', Validators.required)
    ], Validators.required),
    'tags': this.fb.array([
      this.fb.control('')
    ]),
    'requiredServices': this.fb.array([
      this.fb.control('')
    ]),
    'relatedServices': this.fb.array([
      this.fb.control('')
    ]),
    'order': ['', Validators.compose([Validators.required, URLValidator])],
    'helpdesk': ['', URLValidator],
    'userManual': ['', URLValidator],
    'trainingInformation': ['', URLValidator],
    'feedback': ['', URLValidator],
    'price': ['', URLValidator],
    'serviceLevelAgreement': ['', Validators.compose([Validators.required, URLValidator])],
    // TOS is defined in component
    'termsOfUse': this.fb.array([
      this.fb.control('', URLValidator)
    ]),
    'funding': ['']
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
  vocabularies: Map<string, NewVocabulary[]> = null;
  resourceService: ResourceService = this.injector.get(ResourceService);

  router: NavigationService = this.injector.get(NavigationService);
  userService: UserService = this.injector.get(UserService);

  // TODO: rename to 'phaseVocabulary'
  public lifeCycleStatusVocabulary: NewVocabulary[] = null;
  public trlVocabulary: NewVocabulary[] = null;
  public superCategoriesVocabulary: NewVocabulary[] = null;
  public categoriesVocabulary: NewVocabulary[] = null;
  public subCategoriesVocabulary: NewVocabulary[] = null;
  public placesVocabulary: NewVocabulary[] = [];
  public placesVocIdArray: string[] = [];
  public languagesVocabulary: NewVocabulary[] = null;
  public languagesVocIdArray: string[] = [];

  constructor(protected injector: Injector,
              protected authenticationService: AuthenticationService,
  ) {
    this.resourceService = this.injector.get(ResourceService);
    this.fb = this.injector.get(FormBuilder);
    this.router = this.injector.get(NavigationService);
    this.userService = this.injector.get(UserService);
    this.serviceForm = this.fb.group(this.formGroupMeta);
    this.measurementForm = this.fb.group(this.multiMeasurementForm);
    this.weights[0] = this.authenticationService.user.email.split('@')[0];
  }

  // onSubmit(service: Service, isValid: boolean) {
  //   this.errorMessage = '';
  //
  //   /** if valid submit **/
  //   if (isValid) {
  //     // console.log(service);
  //     // console.log('pristine: ' + this.serviceForm.pristine);
  //     if (this.serviceForm.pristine) {
  //       this.postMeasurement(this.serviceID);
  //     } else {
  //       this.resourceService.uploadService(service, this.editMode)
  //         .subscribe(_service => {
  //             this.serviceID = _service.id;
  //             // this.servicePostSuccess = true;
  //             this.postMeasurement(_service.id);
  //           },
  //           error => {
  //             window.scrollTo(0, 0);
  //             this.errorMessage = error.error.error;
  //             this.serviceForm.markAsPristine();
  //           },
  //         );
  //     }
  //   } else {
  //     window.scrollTo(0, 0);
  //     this.setAsTouched();
  //     this.serviceForm.markAsDirty();
  //     this.serviceForm.updateValueAndValidity();
  //     if (!isValid) {
  //       this.errorMessage = 'Please fill in all required fields (marked with an asterisk), and fix the data format in fields underlined with a red colour.';
  //       if (!this.serviceForm.controls['description'].valid) {
  //         this.errorMessage += ' Description is an mandatory field.';
  //       }
  //     }
  //     if (this.logoError) {
  //       this.logoError = false;
  //       this.serviceForm.controls['symbol'].setErrors({'incorrect': true});
  //       this.errorMessage += ' Logo url must have https:// prefix.';
  //     }
  //     if (!this.logoUrlWorks) {
  //       this.serviceForm.controls['symbol'].setErrors({'incorrect': true});
  //       this.errorMessage += ' Logo url doesn\'t point to a valid image.';
  //     }
  //   }
  // }

  onSubmit(service: Service, isValid: boolean) {
    this.errorMessage = '';
    for (let i = 0; i < this.measurements.length; i++) {
      // console.log(i + ' = ' + this.measurements.controls[i].untouched);
      if (this.measurements.controls[i].untouched && this.measurements.controls[i].get('indicatorId').value === '') {
        this.removeFroMeasurements(i);
        continue;
      }
      this.measurements.controls[i].get('serviceId').setValue(service.id);
    }
    if (isValid) {
      this.resourceService.uploadServiceWithMeasurements(service, this.measurements.value).subscribe(
        _service => {
          console.log(_service);
          this.router.service(_service.id);
        },
        er => {
          window.scrollTo(0, 0);
          this.errorMessage = er.error.error;
          console.log(er);
        }
      );
    } else {
      window.scrollTo(0, 0);
      this.setAsTouched();
      this.serviceForm.markAsDirty();
      this.serviceForm.updateValueAndValidity();
      if (!isValid) {
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
      this.resourceService.getServices()
    ).subscribe(suc => {
        this.providersPage = <ProvidersPage>suc[0];
        this.vocabularies = <Map<string, NewVocabulary[]>>suc[1];
        this.requiredServices = this.transformInput(suc[2]);
        this.relatedServices = this.requiredServices;
        this.getIndicatorIds();
        this.getLocations();
        this.lifeCycleStatusVocabulary = this.vocabularies[VocabularyType.PHASE];
        this.trlVocabulary = this.vocabularies[VocabularyType.TRL];
        this.superCategoriesVocabulary = this.vocabularies[VocabularyType.SUPERCATEGORY];
        this.categoriesVocabulary = this.vocabularies[VocabularyType.CATEGORY];
        this.subCategoriesVocabulary = this.vocabularies[VocabularyType.SUBCATEGORY];
        this.placesVocabulary = this.vocabularies[VocabularyType.PLACE];
        this.languagesVocabulary = this.vocabularies[VocabularyType.LANGUAGE];
        this.placesVocIdArray = this.placesVocabulary.map(entry => entry.id);
        this.languagesVocIdArray = this.languagesVocabulary.map(entry => entry.id);
      },
      error => {
      },
      () => {
        this.providersPage.results.sort((a, b) => 0 - (a.name > b.name ? -1 : 1));
      }
    );

    this.serviceForm.get('category').disable();
    this.serviceForm.get('subcategory').disable();
    const categorySubscription = this.serviceForm.get('supercategory').valueChanges.subscribe(() => {
      this.serviceForm.get('category').enable();
      const subCategorySubscription = this.serviceForm.get('category').valueChanges.subscribe(() => {
        this.serviceForm.get('subcategory').enable();
        subCategorySubscription.unsubscribe();
        categorySubscription.unsubscribe();
      });
    });

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

  transformInput(input) {
    return Object.keys(input).reduce((accumulator, value) => {
      accumulator[value] = input[value][0].providers[0] + ' - ' + input[value][0].name;
      return accumulator;
    }, {});
  }

  /** INDICATORS **/
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
    // this.measurementForm.get('locations').disable();
    // this.measurementForm.get('time').disable();
    this.measurements.controls[index].get('locations').disable();
    this.measurements.controls[index].get('time').disable();
    // console.log(this.measurements);
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
      error => this.errorMessage = error,
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
      }
    );
  }

  getVocabularyById(vocabularies: NewVocabulary[], id: string) {
    return vocabularies.find(entry => entry.id === id);
  }

  getSortedChildrenCategories(childrenCategory: NewVocabulary[], parentId: string) {
    return this.sortVocabulariesByName(childrenCategory.filter(entry => entry.parentId === parentId));
  }

  sortVocabulariesByName(vocabularies: NewVocabulary[]): NewVocabulary[] {
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

  validateMeasurements() {
    // console.log(this.measurements.controls.length);
    for (let i = 0; i < this.measurements.controls.length; i++) {
      // console.log(this.measurements.controls[i]);
      for (const j in this.measurements.controls[i].value) {
        if (this.measurements.controls[i].value.hasOwnProperty(j)) {
          // console.log(this.measurements.controls[i].get(j).value);
          if (this.measurements.controls[i].get(j).value.constructor !== Array) {
            this.measurements.controls[i].get(j).markAsDirty();
            this.measurements.controls[i].get(j).updateValueAndValidity();
          }
        }
      }
      for (const j in this.locations(i).controls) {
        this.locations(i).controls[j].markAsDirty();
        this.locations(i).controls[j].updateValueAndValidity();
      }
      if (this.measurements.controls[i].get('valueIsRange').value) {
        this.measurements.controls[i].get('rangeValue.fromValue').markAsDirty();
        this.measurements.controls[i].get('rangeValue.fromValue').updateValueAndValidity();
        this.measurements.controls[i].get('rangeValue.toValue').markAsDirty();
        this.measurements.controls[i].get('rangeValue.toValue').updateValueAndValidity();
      }
    }
  }

  postMeasurement(serviceId: string) {
    // if (this.measurements.length > 0) {
    for (let i = 0; i < this.measurements.length; i++) {
      // console.log(i + ' = ' + this.measurements.controls[i].untouched);
      if (this.measurements.controls[i].untouched && this.measurements.controls[i].get('indicatorId').value === '') {
        this.removeFroMeasurements(i);
        continue;
      }
      this.measurements.controls[i].get('serviceId').setValue(serviceId);
    }
    // console.log(this.measurementForm.controls);
    if (this.measurementForm.valid) {
      this.resourceService.postMeasurementUpdateAll(serviceId, this.measurements.value)
        .subscribe(
          res => this.router.service(serviceId),
          error => { // on measurement post error
            window.scrollTo(0, 0);
            this.errorMessage = error.error.error;
            this.serviceForm.get('id').setValue(serviceId);
            this.editMode = true;
          },
          () => {
          }
        );
    } else {
      this.validateMeasurements();
      window.scrollTo(0, 0);
      this.errorMessage = 'Please fill all underlined fields at Indicator section';
    }
    // } else {
    //   this.router.service(serviceId);
    // }
  }

  /** INDICATORS **/

  checkUrl(url: string) {
    if (url !== '') {
      if (!url.match(/^(https?:\/\/.+)?$/)) {
        url = 'http://' + url;
      }
    }
    return url;
  }

  imageExists(url) {
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
        this.serviceForm.controls['symbol'].setErrors({'incorrect': true});
        this.logoError = true;
      } else if (!url.match(/^(https:\/\/.+)?$/)) {
        url = 'https://' + url;
      }
    }
    console.log(url);
    return url;
  }

}
