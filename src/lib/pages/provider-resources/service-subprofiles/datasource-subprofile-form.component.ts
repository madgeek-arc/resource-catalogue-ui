import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Component, Injector, OnInit} from '@angular/core';
import {AuthenticationService} from '../../../services/authentication.service';
import {NavigationService} from '../../../services/navigation.service';
import {ResourceService} from '../../../services/resource.service';
import {ServiceExtensionsService} from '../../../services/service-extensions.service';
import * as dm from '../../../shared/description.map';
import {Provider, Service, Helpdesk, Datasource, Vocabulary, Type} from '../../../domain/eic-model';
import {Paging} from '../../../domain/paging';
import {URLValidator} from '../../../shared/validators/generic.validator';
import {environment} from '../../../../environments/environment';
import {ActivatedRoute} from '@angular/router';
import {ServiceProviderService} from '../../../services/service-provider.service';
import {DatasourceService} from "../../../services/datasource.service";
import BitSet from "bitset";
import {PremiumSortPipe} from "../../../shared/pipes/premium-sort.pipe";

declare var UIkit: any;

@Component({
  selector: 'app-datasource-subprofile-form',
  templateUrl: './datasource-subprofile-form.component.html',
  styleUrls: ['../../provider/service-provider-form.component.css']
})
export class DatasourceSubprofileFormComponent implements OnInit {

  serviceORresource = environment.serviceORresource;
  projectName = environment.projectName;
  projectMail = environment.projectMail;
  serviceName = '';
  firstServiceForm = false;
  showLoader = false;
  pendingService = false;
  addOpenAIRE = false; //on addOpenAIRE path
  editMode = false;
  hasChanges = false;
  serviceForm: FormGroup;
  provider: Provider;
  service: Service;
  datasource: Datasource;
  errorMessage = '';
  successMessage: string = null;
  weights: string[] = [];
  tabs: boolean[] = [false];
  fb: FormBuilder = this.injector.get(FormBuilder);
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

  readonly submissionPolicyURLDesc: dm.Description = dm.datasourceDescMap.get('submissionPolicyURLDesc');
  readonly preservationPolicyURLDesc: dm.Description = dm.datasourceDescMap.get('preservationPolicyURLDesc');
  readonly versionControlDesc: dm.Description = dm.datasourceDescMap.get('versionControlDesc');
  readonly persistentIdentityEntityTypeDesc: dm.Description = dm.datasourceDescMap.get('persistentIdentityEntityTypeDesc');
  readonly persistentIdentityEntityTypeSchemeDesc: dm.Description = dm.datasourceDescMap.get('persistentIdentityEntityTypeSchemeDesc');

  readonly jurisdictionDesc: dm.Description = dm.datasourceDescMap.get('jurisdictionDesc');
  readonly datasourceClassificationDesc: dm.Description = dm.datasourceDescMap.get('datasourceClassificationDesc');
  readonly researchEntityTypesDesc: dm.Description = dm.datasourceDescMap.get('researchEntityTypesDesc');
  readonly thematicDesc: dm.Description = dm.datasourceDescMap.get('thematicDesc');

  readonly researchProductLicenseNameDesc: dm.Description = dm.datasourceDescMap.get('researchProductLicenseNameDesc');
  readonly researchProductLicenseURLDesc: dm.Description = dm.datasourceDescMap.get('researchProductLicenseURLDesc');
  readonly researchProductAccessPoliciesDesc: dm.Description = dm.datasourceDescMap.get('researchProductAccessPoliciesDesc');

  readonly researchProductMetadataLicenseNameDesc: dm.Description = dm.datasourceDescMap.get('researchProductMetadataLicenseNameDesc');
  readonly researchProductMetadataLicenseURLDesc: dm.Description = dm.datasourceDescMap.get('researchProductMetadataLicenseURLDesc');
  readonly researchProductMetadataAccessPoliciesDesc: dm.Description = dm.datasourceDescMap.get('researchProductMetadataAccessPoliciesDesc');


  formGroupMeta = {
    id: [''],
    serviceId: [''],
    catalogueId: ['eosc'],

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

  router: NavigationService = this.injector.get(NavigationService);

  vocabularies: Map<string, Vocabulary[]> = null;
  subVocabularies: Map<string, Vocabulary[]> = null;
  premiumSort = new PremiumSortPipe();
  public jurisdictionVocabulary: Vocabulary[] = null;
  public classificationVocabulary: Vocabulary[] = null;
  public researchEntityTypeVocabulary: Vocabulary[] = null;
  public persistentIdentitySchemeVocabulary: Vocabulary[] = null;
  public accessRightsVocabulary: Vocabulary[] = null;

  constructor(protected injector: Injector,
              protected authenticationService: AuthenticationService,
              protected datasourceService: DatasourceService,
              protected route: ActivatedRoute
  ) {
    this.resourceService = this.injector.get(ResourceService);
    this.fb = this.injector.get(FormBuilder);
    this.router = this.injector.get(NavigationService);
    this.serviceForm = this.fb.group(this.formGroupMeta);
    this.weights[0] = this.authenticationService.user.email.split('@')[0];
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
          if (this.addOpenAIRE) return this.router.datasourceSubmitted(_ds.id);
          return this.router.resourceDashboard(_ds.serviceId.split('.')[0], _ds.serviceId);
        },
        err => {
          this.showLoader = false;
          window.scrollTo(0, 0);
          this.errorMessage = 'Something went bad, server responded: ' + JSON.stringify(err.error.error);
        }
      );
    } else {
      window.scrollTo(0, 0);
      this.showLoader = false;

      this.serviceForm.markAsDirty();
      this.serviceForm.updateValueAndValidity();
      if (!this.serviceForm.valid) {
        this.errorMessage = 'Please fill in all required fields (marked with an asterisk), ' +
          'and fix the data format in fields underlined with a red colour.';
      }
    }
  }

  ngOnInit() {
    this.addOpenAIRE = window.location.pathname.includes('addOpenAIRE');
    this.resourceService.getAllVocabulariesByType().subscribe(
      suc => {
        this.vocabularies = <Map<string, Vocabulary[]>>suc;
        this.jurisdictionVocabulary = this.vocabularies[Type.DS_JURISDICTION];
        this.classificationVocabulary = this.vocabularies[Type.DS_CLASSIFICATION];
        this.researchEntityTypeVocabulary = this.vocabularies[Type.DS_RESEARCH_ENTITY_TYPE];
        this.persistentIdentitySchemeVocabulary = this.vocabularies[Type.DS_PERSISTENT_IDENTITY_SCHEME];
        this.accessRightsVocabulary = this.vocabularies[Type.DS_COAR_ACCESS_RIGHTS_1_0];
      },
      error => {
        this.errorMessage = 'Something went bad while getting the data for page initialization. ' + JSON.stringify(error.error.error);
      },
      () => {}
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
    this.serviceForm.get('serviceId').setValue(this.serviceId);

    this.datasourceService.getDatasourceByServiceId(this.serviceId).subscribe(
      res => { if(res!=null) {
        this.datasource = res;
        this.editMode = true;
      }
      },
      err => { console.log(err); },
      () => {
        if (this.datasource) { //fill the form -->
          this.formPrepare(this.datasource);
          this.serviceForm.patchValue(this.datasource);
        }
      }
    );

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
  newLicensing(): FormGroup {
    return this.fb.group({
      researchProductLicenseName: [''],
      researchProductLicenseURL: ['', Validators.compose([Validators.required, URLValidator])]
    });
  }

  get licensingArray() {
    return this.serviceForm.get('researchProductLicensings') as FormArray;
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
    return this.serviceForm.get('researchProductMetadataLicensing') as FormArray;
  }
  /** <--MetadataLicensing**/

  /** Persistent Identity Systems--> **/
  newPersistentIdentitySystem(): FormGroup {
    return this.fb.group({
      persistentIdentityEntityType: [''],
      persistentIdentityEntityTypeSchemes: this.fb.array([''])
    });
  }

  get persistentIdentitySystemArray() {
    return this.serviceForm.get('persistentIdentitySystems') as FormArray;
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
    (this.persistentIdentitySystemArray.controls[i].get('persistentIdentityEntityTypeSchemes') as FormArray).push(this.fb.control(''));
  }

  removePersistentIdentityEntityTypeScheme(i:number, index: number) {
    (this.persistentIdentitySystemArray.controls[i].get('persistentIdentityEntityTypeSchemes') as FormArray).removeAt(index);
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

}
