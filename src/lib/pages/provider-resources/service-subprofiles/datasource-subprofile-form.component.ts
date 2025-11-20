import {UntypedFormArray, UntypedFormBuilder, FormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {Component, Injector, isDevMode, OnInit, ViewChild} from '@angular/core';
import {AuthenticationService} from '../../../services/authentication.service';
import {NavigationService} from '../../../services/navigation.service';
import {ResourceService} from '../../../services/resource.service';
import {ServiceExtensionsService} from '../../../services/service-extensions.service';
import * as dm from '../../../shared/description.map';
import {Provider, Service, Datasource, Vocabulary, Type} from '../../../domain/eic-model';
import {Paging} from '../../../domain/paging';
import {URLValidator} from '../../../shared/validators/generic.validator';
import {environment} from '../../../../environments/environment';
import {ActivatedRoute} from '@angular/router';
import {DatasourceService} from "../../../services/datasource.service";
import BitSet from "bitset";
import {PremiumSortPipe} from "../../../shared/pipes/premium-sort.pipe";
import {SurveyComponent} from "../../../../dynamic-catalogue/pages/dynamic-form/survey.component";
import {Model} from "../../../../dynamic-catalogue/domain/dynamic-form-model";
import {FormControlService} from "../../../../dynamic-catalogue/services/form-control.service";
import {zip} from "rxjs";
import {ConfigService} from "../../../services/config.service";

declare var UIkit: any;

@Component({
  selector: 'app-datasource-subprofile-form',
  templateUrl: './datasource-subprofile-form.component.html',
  styleUrls: ['../../provider/service-provider-form.component.css']
})
export class DatasourceSubprofileFormComponent implements OnInit {
  @ViewChild(SurveyComponent) child: SurveyComponent
  model: Model = null;
  vocabulariesMap: Map<string, object[]> = null;
  subVocabulariesMap: Map<string, object[]> = null
  payloadAnswer: object = null;

  catalogueConfigId: string = this.config.getProperty('catalogueId');
  serviceORresource = environment.serviceORresource;
  serviceName = '';
  firstServiceForm = false;
  showLoader = false;
  pendingService = false;
  addOpenAIRE = false; //on addOpenAIRE path
  openaireId: string = null; //datasource OA id
  providerId: string;
  editMode = false;
  hasChanges = false;
  serviceForm: UntypedFormGroup;
  provider: Provider;
  service: Service;
  datasource: Datasource;
  errorMessage = '';
  successMessage: string = null;
  weights: string[] = [];
  tabs: boolean[] = [false];
  fb: UntypedFormBuilder = this.injector.get(UntypedFormBuilder);
  disable = false;
  isPortalAdmin = false;

  serviceId: string = null; //filled for all types (service, datasource, training)
  resourceType = '';
  //only one of these 3 ids will be filled from URL
  resourceId: string = null;
  datasourceId: string = null;
  trainingResourceId: string = null;

  requiredOnTab0 = 4;
  requiredOnTab1 = 3;
  requiredOnTab2 = 3;
  requiredOnTab3 = 2;
  requiredOnTab5 = 4;
  requiredOnTab6 = 1;
  requiredOnTab9 = 2;
  requiredOnTab10 = 1;
  requiredOnTab13 = 4;

  remainingOnTab0 = this.requiredOnTab0;
  remainingOnTab1 = this.requiredOnTab1;
  remainingOnTab2 = this.requiredOnTab2;
  remainingOnTab3 = this.requiredOnTab3;
  remainingOnTab5 = this.requiredOnTab5;
  remainingOnTab6 = this.requiredOnTab6;
  remainingOnTab9 = this.requiredOnTab9;
  remainingOnTab10 = this.requiredOnTab10;
  remainingOnTab13 = this.requiredOnTab13;

  BitSetTab0 = new BitSet;
  BitSetTab1 = new BitSet;
  BitSetTab2 = new BitSet;
  BitSetTab3 = new BitSet;
  BitSetTab5 = new BitSet;
  BitSetTab6 = new BitSet;
  BitSetTab9 = new BitSet;
  BitSetTab10 = new BitSet;
  BitSetTab13 = new BitSet;

  requiredTabs = 9;
  completedTabs = 0;
  completedTabsBitSet = new BitSet;

  allRequiredFields = 28;
  loaderBitSet = new BitSet;
  loaderPercentage = 0;

  readonly nodeDesc: dm.Description = dm.datasourceDescMap.get('nodeDesc');
  readonly catalogueIdDesc: dm.Description = dm.datasourceDescMap.get('catalogueIdDesc');

  readonly submissionPolicyURLDesc: dm.Description = dm.datasourceDescMap.get('submissionPolicyURLDesc');
  readonly preservationPolicyURLDesc: dm.Description = dm.datasourceDescMap.get('preservationPolicyURLDesc');
  readonly versionControlDesc: dm.Description = dm.datasourceDescMap.get('versionControlDesc');
  readonly persistentIdentityEntityTypeDesc: dm.Description = dm.datasourceDescMap.get('persistentIdentityEntityTypeDesc');
  readonly persistentIdentityEntityTypeSchemeDesc: dm.Description = dm.datasourceDescMap.get('persistentIdentityEntityTypeSchemeDesc');

  readonly jurisdictionDesc: dm.Description = dm.datasourceDescMap.get('jurisdictionDesc');
  readonly datasourceClassificationDesc: dm.Description = dm.datasourceDescMap.get('datasourceClassificationDesc');
  readonly researchEntityTypesDesc: dm.Description = dm.datasourceDescMap.get('researchEntityTypesDesc');
  readonly thematicDesc: dm.Description = dm.datasourceDescMap.get('thematicDesc');
  readonly harvestableDesc: dm.Description = dm.datasourceDescMap.get('harvestableDesc');

  readonly researchProductLicenseNameDesc: dm.Description = dm.datasourceDescMap.get('researchProductLicenseNameDesc');
  readonly researchProductLicenseURLDesc: dm.Description = dm.datasourceDescMap.get('researchProductLicenseURLDesc');
  readonly researchProductAccessPoliciesDesc: dm.Description = dm.datasourceDescMap.get('researchProductAccessPoliciesDesc');

  readonly researchProductMetadataLicenseNameDesc: dm.Description = dm.datasourceDescMap.get('researchProductMetadataLicenseNameDesc');
  readonly researchProductMetadataLicenseURLDesc: dm.Description = dm.datasourceDescMap.get('researchProductMetadataLicenseURLDesc');
  readonly researchProductMetadataAccessPoliciesDesc: dm.Description = dm.datasourceDescMap.get('researchProductMetadataAccessPoliciesDesc');


  formGroupMeta = {
    id: [''],
    serviceId: [''],
    node: [''],
    catalogueId: [this.catalogueConfigId],

    submissionPolicyURL: this.fb.control(''),
    preservationPolicyURL: this.fb.control(''),
    versionControl: [''],
    persistentIdentitySystems: this.fb.array([
      this.fb.group({
        persistentIdentityEntityType: [''],
        persistentIdentityEntityTypeSchemes: this.fb.array([this.fb.control('')])
        // persistentIdentityEntityTypeSchemes: this.fb.array([this.initPersistentIdentityEntityTypeScheme()])
      })
    ]),

    jurisdiction: ['', Validators.required],
    datasourceClassification: ['', Validators.required],
    researchEntityTypes: this.fb.array([this.fb.control('', Validators.required)], Validators.required),
    thematic: ['', Validators.required],
    harvestable: [''],

    researchProductLicensings: this.fb.array([
      this.fb.group({
        researchProductLicenseName: [''],
        researchProductLicenseURL: ['', Validators.compose([Validators.required, URLValidator])]
      })
    ]),
    researchProductAccessPolicies: this.fb.array([this.fb.control('')]),

    researchProductMetadataLicensing: this.fb.group({
      researchProductMetadataLicenseName: [''],
      researchProductMetadataLicenseURL: ['', Validators.compose([Validators.required, URLValidator])]
    }),
    researchProductMetadataAccessPolicies: this.fb.array([this.fb.control('')]),
  };

  providersPage: Paging<Provider>;
  requiredResources: any;
  relatedResources: any;
  resourceService: ResourceService = this.injector.get(ResourceService);
  serviceExtensionsService: ServiceExtensionsService = this.injector.get(ServiceExtensionsService);

  navigator: NavigationService = this.injector.get(NavigationService);

  vocabularies: Map<string, Vocabulary[]> = null;
  subVocabularies: Map<string, Vocabulary[]> = null;
  premiumSort = new PremiumSortPipe();
  public jurisdictionVocabulary: Vocabulary[] = null;
  public classificationVocabulary: Vocabulary[] = null;
  public researchEntityTypeVocabulary: Vocabulary[] = null;
  public persistentIdentitySchemeVocabulary: Vocabulary[] = null;
  public accessRightsVocabulary: Vocabulary[] = null;
  public nodeVocabulary: Vocabulary[] = null;

  constructor(protected injector: Injector,
              protected authenticationService: AuthenticationService,
              protected datasourceService: DatasourceService,
              protected route: ActivatedRoute,
              public dynamicFormService: FormControlService,
              public config: ConfigService
  ) {
    this.resourceService = this.injector.get(ResourceService);
    this.fb = this.injector.get(UntypedFormBuilder);
    this.navigator = this.injector.get(NavigationService);
    this.serviceForm = this.fb.group(this.formGroupMeta);
    this.weights[0] = this.authenticationService.getUserEmail().split('@')[0];
  }

  submitForm(value: any, tempSave: boolean, pendingService: boolean) {
    let datasourceValue = value[0].value.Datasource;
    window.scrollTo(0, 0);

    if (!this.authenticationService.isLoggedIn()) {
      sessionStorage.setItem('service', JSON.stringify(this.serviceForm.value));
      this.authenticationService.login();
    }

    this.errorMessage = '';
    this.showLoader = true;

    this.cleanArrayProperty(datasourceValue, 'persistentIdentitySystems');
    this.cleanArrayProperty(datasourceValue, 'researchProductLicensings');
    this.cleanArrayProperty(datasourceValue, 'researchProductMetadataLicensing', true);

    this.datasourceService.submitDatasource(datasourceValue, this.editMode).subscribe(
      _ds => {
        this.showLoader = false;
        if (this.addOpenAIRE) return this.navigator.datasourceSubmitted(_ds.id);
        return this.navigator.resourceDashboard(this.providerId, _ds.serviceId); // fixme: Datasource providerId -2test
      },
      err => {
        this.showLoader = false;
        window.scrollTo(0, 0);
        this.errorMessage = 'Something went bad, server responded: ' + JSON.stringify(err.error.message);
      }
    );
}


  onSubmit() {
    if (!this.authenticationService.isLoggedIn()) {
      sessionStorage.setItem('service', JSON.stringify(this.serviceForm.value));
      this.authenticationService.login();
    }

    this.errorMessage = '';
    this.showLoader = true;

    for (let i = 0; i < this.licensingArray.length; i++) {
      if ((this.licensingArray.controls[i].get('researchProductLicenseName').value === '' || this.licensingArray.controls[i].get('researchProductLicenseName').value === null)
        && (this.licensingArray.controls[i].get('researchProductLicenseURL').value === '' || this.licensingArray.controls[i].get('researchProductLicenseURL').value === null)) {
        this.removeLicensing(i);
      }
    }
    if ((this.metadataLicensingArray?.get('researchProductMetadataLicenseURL')?.value === '')
      && (this.metadataLicensingArray?.get('researchProductMetadataLicenseName')?.value === '')) {
      this.serviceForm.setControl('researchProductMetadataLicensing', this.fb.control(null));
    }
    for (let i = 0; i < this.persistentIdentitySystemArray.length; i++) {
      // console.log(this.persistentIdentitySystemArray.controls[i].get('persistentIdentityEntityTypeSchemes'));
      // console.log(this.persistentIdentitySystemArray.controls[i].get('persistentIdentityEntityTypeSchemes').value[0]);
      //TODO: fix persistentIdentityEntityTypeSchemes ....value[0]
      if ((this.persistentIdentitySystemArray.controls[i].get('persistentIdentityEntityType').value === '' || this.persistentIdentitySystemArray.controls[i].get('persistentIdentityEntityType').value === null)
        && (this.persistentIdentitySystemArray.controls[i].get('persistentIdentityEntityTypeSchemes').value[0] === '' || this.persistentIdentitySystemArray.controls[i].get('persistentIdentityEntityTypeSchemes').value[0] === null)) {
        this.removePersistentIdentitySystem(i);
      }
    }

    if (this.serviceForm.valid) {
      window.scrollTo(0, 0);
      this.datasourceService.submitDatasource(this.serviceForm.value, this.editMode).subscribe(
        _ds => {
          this.showLoader = false;
          if (this.addOpenAIRE) return this.navigator.datasourceSubmitted(_ds.id);
          return this.navigator.resourceDashboard(this.providerId, _ds.serviceId); // fixme: Datasource providerId -2test
        },
        err => {
          this.showLoader = false;
          window.scrollTo(0, 0);
          this.errorMessage = 'Something went bad, server responded: ' + JSON.stringify(err.error.message);
        }
      );
    } else {
      window.scrollTo(0, 0);
      this.showLoader = false;

      this.serviceForm.markAsDirty();
      this.serviceForm.updateValueAndValidity();
      if (!this.serviceForm.valid) {
        this.errorMessage = 'Please fill in all required fields (marked with an asterisk) ' +
          'and fix data format.';
      }
    }
  }

  ngOnInit() {
    this.showLoader = true;
    this.addOpenAIRE = window.location.pathname.includes('addOpenAIRE');
    this.openaireId = this.route.snapshot.paramMap.get('openaireId');
    this.providerId = this.route.snapshot.paramMap.get('providerId');
    this.resourceId = this.route.snapshot.paramMap.get('resourceId');
    zip(
      this.resourceService.getAllVocabulariesByType(),
      this.resourceService.getFormModelById('m-b-datasource'),
    ).subscribe(
      suc => {
        // TODO: 2 vars with the same data / keep one
        this.vocabularies = <Map<string, Vocabulary[]>>suc[0];
        this.vocabulariesMap = suc[0];
        this.model = suc[1];
      },
      error => {
        this.errorMessage = 'Something went bad while getting the data for page initialization. ' + JSON.stringify(error.error.message);
      },
      () => {
        if (!this.editMode) { //prefill field(s)
          this.payloadAnswer = {
            'answer': {
              Datasource:
                {
                  'id': this.openaireId,
                  'serviceId': decodeURIComponent(this.resourceId),
                  'catalogueId': this.catalogueConfigId
                }
            }
          };
        }
        this.showLoader = false;
      }
    )
    if (this.route.snapshot.paramMap.get('resourceId')) {
      this.serviceId = this.route.snapshot.paramMap.get('resourceId');
      this.resourceType = 'service';
    }
    if (this.route.snapshot.paramMap.get('datasourceId')) {
      this.serviceId = this.route.snapshot.paramMap.get('datasourceId');
      this.resourceType = 'datasource';
    }
    if (this.route.snapshot.paramMap.get('trainingResourceId')) {
      this.serviceId = this.route.snapshot.paramMap.get('trainingResourceId');
      this.resourceType = 'training_resource';
    }
    this.serviceForm.get('serviceId').setValue(decodeURIComponent(this.serviceId)); // revisit?

    if (!this.addOpenAIRE) {
      this.datasourceService.getDatasourceByServiceId(this.serviceId).subscribe(
        res => {
          if (res != null) {
            this.datasource = res;
            this.editMode = true;
          }
        },
        err => {
          console.log(err);
        },
        () => {
          if (this.datasource) { //fill the form -->
            const parsedDatasource = { ...this.datasource };
            ['versionControl', 'thematic', 'harvestable'].forEach(field => {
              if (typeof parsedDatasource[field] === 'boolean') {
                parsedDatasource[field] = parsedDatasource[field].toString();
              }
            });
            this.payloadAnswer = { 'answer': { Datasource: parsedDatasource } };
          }
        }
      );
    }

    if (this.addOpenAIRE) {
      console.log(this.openaireId);
      this.datasourceService.getOpenAIREDatasourcesById(this.openaireId).subscribe(
        res => { if(res!=null) {
          this.datasource = res;
          this.editMode = false;
          }
        },
        err => { console.log(err); },
        () => {
          if (this.datasource) { //fill the form -->
            this.formPrepare(this.datasource);
            this.serviceForm.patchValue(this.datasource);
            this.serviceForm.get('serviceId').setValue(decodeURIComponent(this.serviceId));
            this.serviceForm.get('catalogueId').setValue(this.catalogueConfigId);

          }
        }
      );
    }

  }

  // checkFormValidity(name: string, edit: boolean): boolean {
  //   return (this.serviceForm.get(name).invalid && (edit || this.serviceForm.get(name).dirty));
  // }

  checkFormValidity(name: string, edit: boolean, required?: boolean): boolean {
    if (required && edit && (this.serviceForm.get(name).value === "")) return false; // for dropdown required fields that get red on edit
    return (this.serviceForm.get(name).invalid && (edit || this.serviceForm.get(name).dirty));
  }

  checkFormArrayValidity(name: string, position: number, edit: boolean, groupName?: string): boolean {
    if (groupName) {
      return this.getFieldAsFormArray(name).get([position]).get(groupName).invalid
        && (edit || this.getFieldAsFormArray(name).get([position]).get(groupName).dirty);
    }
    return (this.getFieldAsFormArray(name).get([position]).invalid && (edit || this.getFieldAsFormArray(name).get([position]).dirty));
  }

  /** manage form arrays--> **/
  getFieldAsFormArray(field: string) {
    return this.serviceForm.get(field) as UntypedFormArray;
  }

  push(field: string, required: boolean, url?: boolean) {
    if (required) {
      if (url) {
        this.getFieldAsFormArray(field).push(this.fb.control('', Validators.compose([Validators.required, URLValidator])));
      } else {
        this.getFieldAsFormArray(field).push(this.fb.control('', Validators.required));
      }
    } else if (url) {
      // console.log('added non mandatory url field');
      this.getFieldAsFormArray(field).push(this.fb.control('', URLValidator));
    } else {
      this.getFieldAsFormArray(field).push(this.fb.control(''));
    }
  }

  remove(field: string, i: number) {
    this.getFieldAsFormArray(field).removeAt(i);
  }

  /** <--manage form arrays **/

  /** Licensing -->**/
  newLicensing(): UntypedFormGroup {
    return this.fb.group({
      researchProductLicenseName: [''],
      researchProductLicenseURL: ['', Validators.compose([Validators.required, URLValidator])]
    });
  }

  get licensingArray() {
    return this.serviceForm.get('researchProductLicensings') as UntypedFormArray;
  }

  pushLicensing() {
    this.licensingArray.push(this.newLicensing());
  }

  removeLicensing(index: number) {
    this.licensingArray.removeAt(index);
  }
  /** <--Licensing**/

  /** MetadataLicensing -->**/
  get metadataLicensingArray() {
    return this.serviceForm.get('researchProductMetadataLicensing') as UntypedFormArray;
  }
  /** <--MetadataLicensing**/

  /** Persistent Identity Systems--> **/
  newPersistentIdentitySystem(): UntypedFormGroup {
    return this.fb.group({
      persistentIdentityEntityType: [''],
      persistentIdentityEntityTypeSchemes: this.fb.array([''])
    });
  }

  get persistentIdentitySystemArray() {
    return this.serviceForm.get('persistentIdentitySystems') as UntypedFormArray;
  }

  pushPersistentIdentitySystem() {
    this.persistentIdentitySystemArray.push(this.newPersistentIdentitySystem());
  }

  removePersistentIdentitySystem(index: number) {
    this.persistentIdentitySystemArray.removeAt(index);
  }

  pushPersistentIdentityEntityTypeScheme(i) {
    // const control = (<FormArray>this.serviceForm.controls['persistentIdentitySystems']).at(i).get('persistentIdentityEntityTypeSchemes') as FormArray;
    // control.push(this.fb.control(''));
    (this.persistentIdentitySystemArray.controls[i].get('persistentIdentityEntityTypeSchemes') as UntypedFormArray).push(this.fb.control(''));
  }

  removePersistentIdentityEntityTypeScheme(i:number, index: number) {
    (this.persistentIdentitySystemArray.controls[i].get('persistentIdentityEntityTypeSchemes') as UntypedFormArray).removeAt(index);
  }
  /** <--Persistent Identity Systems**/

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

  formPrepare(datasource: Datasource) {
    if (datasource.persistentIdentitySystems) {
      for (let i = 0; i < datasource.persistentIdentitySystems.length - 1; i++) {
        this.pushPersistentIdentitySystem();
      }
    }
    if (datasource.researchEntityTypes) {
      for (let i = 0; i < datasource.researchEntityTypes.length - 1; i++) {
        this.push('researchEntityTypes', true);
      }
    }
    if (datasource.researchProductLicensings) {
      for (let i = 0; i < datasource.researchProductLicensings.length - 1; i++) {
        this.pushLicensing();
      }
    }
    if (datasource.researchProductAccessPolicies) {
      for (let i = 0; i < datasource.researchProductAccessPolicies.length - 1; i++) {
        this.push('researchProductAccessPolicies', false);
      }
    }
    if (datasource.researchProductMetadataAccessPolicies) {
      for (let i = 0; i < datasource.researchProductMetadataAccessPolicies.length - 1; i++) {
        this.push('researchProductMetadataAccessPolicies', false);
      }
    }
  }

  unsavedChangesPrompt() {
    this.hasChanges = true;
  }

  handleBitSets(a: any, b: any, c: any){};

  checkForDuplicates(formControlName, group?) {
    if (this.serviceForm.get(formControlName).value.length > 1) {
      for (let i = 0; i < this.serviceForm.get(formControlName).value.length; i++) {
        for (let j = 0; j < this.serviceForm.get(formControlName).value.length; j++) {
          if (i !== j && this.serviceForm.get(formControlName).value[i] === this.serviceForm.get(formControlName).value[j]) {
            this.showNotification();
            return;
          }
        }
      }
    }
  }

  switchToTab(id: string){
    const element: HTMLElement = document.getElementById(id) as HTMLElement;
    element.click();
    window.scrollTo(0, -1);
  }

  showNotification() {
    UIkit.notification({
      // message: `Please remove duplicate entries for ${label}.`,
      message: 'Please remove duplicate entries.',
      status: 'danger',
      pos: 'top-center',
      timeout: 7000
    });
  }

  deleteDatasource() {
    this.showLoader = true;
    this.datasourceService.deleteDatasourceWithoutAdminRights(this.datasource.catalogueId, this.datasource.serviceId).subscribe(
      res => {},
      error => {
        this.showLoader = false;
        this.errorMessage = 'Something went bad. ' + error.error ;
        return this.navigator.resourceDashboard(this.providerId, this.datasource.serviceId); // fixme: Datasource providerId -2test
      },
      () => {
        this.showLoader = false;
        return this.navigator.resourceDashboard(this.providerId, this.datasource.serviceId); // fixme: Datasource providerId -2test
      }
    );
  }

  cleanArrayProperty(obj: any, property: string, supportPlainObject = false): void {
    const value = obj[property];

    if (Array.isArray(value)) {
      const cleaned = value.filter((element: any) => {
        if (element && typeof element === 'object' && !Array.isArray(element)) {
          return Object.keys(element).some(key => {
            const val = element[key];
            return val !== null && val !== '' && !(Array.isArray(val) && val.every(v => v === null || v === ''));
          });
        }
        return element !== null && element !== '';
      });

      obj[property] = cleaned.length ? cleaned : null;

    } else if (supportPlainObject && value && typeof value === 'object') {
      const allEmpty = Object.values(value).every(val =>
        val === null || val === '' || (Array.isArray(val) && val.every(v => v === null || v === ''))
      );
      if (allEmpty) obj[property] = null;
    }
  }

  protected readonly environment = environment;
  protected readonly isDevMode = isDevMode;
}
