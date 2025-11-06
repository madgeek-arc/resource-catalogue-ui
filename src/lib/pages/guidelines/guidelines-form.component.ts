import {Component, isDevMode, OnInit, ViewChild} from '@angular/core';
import {UntypedFormArray, UntypedFormBuilder, FormControl, UntypedFormGroup, Validators} from '@angular/forms';
import * as dm from '../../shared/description.map';
import {AuthenticationService} from '../../services/authentication.service';
import {ServiceProviderService} from '../../services/service-provider.service';
import {ResourceService} from '../../services/resource.service';
import {ActivatedRoute, Router} from '@angular/router';
import {URLValidator} from '../../shared/validators/generic.validator';
import {Vocabulary, Type, Provider, InteroperabilityRecord} from '../../domain/eic-model';
import BitSet from 'bitset';
import {ConfigService} from "../../services/config.service";
import {environment} from '../../../environments/environment';
import {PremiumSortPipe} from "../../shared/pipes/premium-sort.pipe";
import {GuidelinesService} from "../../services/guidelines.service";
import {pidHandler} from "../../shared/pid-handler/pid-handler.service";
import {SurveyComponent} from "../../../dynamic-catalogue/pages/dynamic-form/survey.component";
import {Model} from "../../../dynamic-catalogue/domain/dynamic-form-model";

declare var UIkit: any;

@Component({
    selector: 'app-guidelines-form',
    templateUrl: './guidelines-form.component.html',
    standalone: false
})
export class GuidelinesFormComponent implements OnInit {
  @ViewChild(SurveyComponent) child: SurveyComponent
  model: Model = null;
  vocabulariesMap: Map<string, object[]> = null;
  subVocabulariesMap: Map<string, object[]> = null //?
  payloadAnswer: object = null;

  catalogueConfigId: string | null = null;
  providerId: string;
  guideline: InteroperabilityRecord;
  guidelineId: string = null;
  guidelineTitle = '';
  errorMessage = '';
  guidelinesForm: UntypedFormGroup;
  vocabularies: Map<string, Vocabulary[]> = null;
  subVocabularies: Map<string, Vocabulary[]> = null;
  premiumSort = new PremiumSortPipe();
  editMode = false;
  hasChanges = false;
  disable = false;
  showLoader = false;
  tabs: boolean[] = [false, false, false, false, false];
  isPortalAdmin = false;

  requiredOnTab0 = 4;
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

  allRequiredFields = 15;
  loaderBitSet = new BitSet;
  loaderPercentage = 0;

  readonly identifierDesc: dm.Description = dm.guidelinesDescMap.get('identifierDesc');
  readonly identifierTypeDesc: dm.Description = dm.guidelinesDescMap.get('identifierTypeDesc');
  readonly creatorDesc: dm.Description = dm.guidelinesDescMap.get('creatorDesc');
  readonly creatorNameDesc: dm.Description = dm.guidelinesDescMap.get('creatorNameDesc');
  readonly nameTypeDesc: dm.Description = dm.guidelinesDescMap.get('nameTypeDesc');
  readonly givenNameDesc: dm.Description = dm.guidelinesDescMap.get('givenNameDesc');
  readonly familyNameDesc: dm.Description = dm.guidelinesDescMap.get('familyNameDesc');
  readonly nameIdentifierDesc: dm.Description = dm.guidelinesDescMap.get('nameIdentifierDesc');
  readonly affiliationDesc: dm.Description = dm.guidelinesDescMap.get('affiliationDesc');
  readonly affiliationIdentifierDesc: dm.Description = dm.guidelinesDescMap.get('affiliationIdentifierDesc');
  readonly titleDesc: dm.Description = dm.guidelinesDescMap.get('titleDesc');
  readonly publicationYearDesc: dm.Description = dm.guidelinesDescMap.get('publicationYearDesc');
  readonly resourceTypeDesc: dm.Description = dm.guidelinesDescMap.get('resourceTypeDesc');
  readonly resourceTypeGeneralDesc: dm.Description = dm.guidelinesDescMap.get('resourceTypeGeneralDesc');
  readonly createdDesc: dm.Description = dm.guidelinesDescMap.get('createdDesc');
  readonly updatedDesc: dm.Description = dm.guidelinesDescMap.get('updatedDesc');
  readonly relatedStandardURIDesc: dm.Description = dm.guidelinesDescMap.get('relatedStandardURIDesc');
  readonly relatedStandardIdentifierDesc: dm.Description = dm.guidelinesDescMap.get('relatedStandardIdentifierDesc');
  readonly rightTitleDesc: dm.Description = dm.guidelinesDescMap.get('rightTitleDesc');
  readonly rightURIDesc: dm.Description = dm.guidelinesDescMap.get('rightURIDesc');
  readonly rightIdentifierDesc: dm.Description = dm.guidelinesDescMap.get('rightIdentifierDesc');
  readonly descriptionDesc: dm.Description = dm.guidelinesDescMap.get('descriptionDesc');
  readonly statusDesc: dm.Description = dm.guidelinesDescMap.get('statusDesc');
  readonly domainDesc: dm.Description = dm.guidelinesDescMap.get('domainDesc');
  readonly eoscGuidelineTypeDesc: dm.Description = dm.guidelinesDescMap.get('eoscGuidelineTypeDesc');
  readonly eoscIntegrationOptionsDesc: dm.Description = dm.guidelinesDescMap.get('eoscIntegrationOptionsDesc');
  readonly altIdTypeDesc: dm.Description = dm.serviceDescMap.get('altIdTypeDesc');
  readonly altIdValueDesc: dm.Description = dm.serviceDescMap.get('altIdValueDesc');

  identifierTypeVocabulary: Vocabulary[] = null;
  nameTypeVocabulary: Vocabulary[] = null;
  resourceTypeGeneralVocabulary: Vocabulary[] = null;
  statusVocabulary: Vocabulary[] = null;
  domainVocabulary: Vocabulary[] = null;
  eoscGuidelineTypeVocabulary: Vocabulary[] = null;

  readonly formDefinition = {
    id: [''],
    catalogueId: [this.catalogueConfigId], //assuming that non-eosc providers cannot add/edit/assign guidelines
    providerId: [''],
    title: ['', Validators.required],
    publicationYear: ['', Validators.required],
    created: [''],
    updated: [''],
    relatedStandards: this.fb.array([
      this.fb.group({
        relatedStandardURI: ['', URLValidator],
        relatedStandardIdentifier: ['']
      })
    ]),
    description: ['', Validators.required],
    status: ['', Validators.required],
    domain: [''],
    eoscGuidelineType: ['', Validators.required],
    eoscIntegrationOptions: this.fb.array([this.fb.control('')]),
    identifierInfo: this.fb.group({
      identifier: ['', Validators.required],
      identifierType: ['', Validators.required]
    }, Validators.required),
    alternativeIdentifiers: this.fb.array([
      this.fb.group({
        type: [''],
        value: ['']
      })
    ]),
    creators: this.fb.array([this.fb.group({
      creatorNameTypeInfo: this.fb.group({creatorName:'', nameType:'ir_name_type-personal'}),
      givenName: [''],
      familyName: [''],
      nameIdentifier: [''],
      creatorAffiliationInfo: this.fb.group({affiliation:'', affiliationIdentifier:''}),
    }, Validators.required)]),
    resourceTypesInfo: this.fb.array([
      this.fb.group({
        resourceType: ['', Validators.required],
        resourceTypeGeneral: ['', Validators.required]
      })
    ]),
    rights: this.fb.array([
      this.fb.group({
        rightTitle: ['', Validators.required],
        rightURI: ['', Validators.compose([Validators.required, URLValidator])],
        rightIdentifier: ['', Validators.required]
      })
    ])
  };

  constructor(public fb: UntypedFormBuilder,
              public authService: AuthenticationService,
              public serviceProviderService: ServiceProviderService,
              public guidelinesService: GuidelinesService,
              public resourceService: ResourceService,
              public router: Router,
              public route: ActivatedRoute,
              public pidHandler: pidHandler,
              public config: ConfigService) {
  }

  ngOnInit() {
    this.catalogueConfigId = this.config.getProperty('catalogueId');
    this.showLoader = true;
    this.providerId = this.route.snapshot.paramMap.get('providerId');
    this.serviceProviderService.getFormModelById('m-b-guidelines').subscribe(
      res => this.model = res,
      err => console.log(err),
      ()=>{
        if (!this.editMode) { //prefill field(s)
          this.payloadAnswer = {
            'answer': {
              Guidelines:
                {
                  'providerId': decodeURIComponent(this.providerId),
                  'catalogueId': this.catalogueConfigId
                }
            }
          };
        }
        this.showLoader = false;
      }
    )

    // const path = this.route.snapshot.routeConfig.path;
    // if (path.includes('update/:guidelineId')) {
    //
    // }
    this.setVocabularies();
    this.guidelinesForm = this.fb.group(this.formDefinition);
    this.guidelinesForm.get('providerId').setValue(decodeURIComponent(this.route.snapshot.paramMap.get('providerId')));
    // if (this.editMode === false) {
    //   // this.pushDomain();
    // }

    if (sessionStorage.getItem('guideline')) {
      const data = JSON.parse(sessionStorage.getItem('guideline'));
      for (const i in data) {
        if (data.hasOwnProperty(i)) {
          if (Array.isArray(data[i])) {
            // console.log(i);
            for (let j = 0; j < data[i].length - 1; j++) {
              if (i === 'scientificDomains') {
                // this.domainArray.push(this.newScientificDomain());
              // } else if (i === 'publicContacts') {
              //   this.pushPublicContact();
              // } else if (i === 'users') {
              //   this.addUser();
              // } else if (i === 'multimedia') {
              //   this.pushMultimedia();
              } else {
                this.push(i, false);
              }
            }
          }
        }
      }
      this.guidelinesForm.patchValue(data);
      if (!this.editMode) {
        sessionStorage.removeItem('guideline');
      }
    }

    this.isPortalAdmin = this.authService.isAdmin();

  }

  submitForm(value: any) {
    let guidelinesValue = value[0].value.Guidelines;
    window.scrollTo(0, 0);
    if (!this.authService.isLoggedIn()) {
      sessionStorage.setItem('guideline', JSON.stringify(this.guidelinesForm.value));
      this.authService.login();
    }

    this.errorMessage = '';
    this.showLoader = true;

    this.cleanArrayProperty(guidelinesValue, 'alternativeIdentifiers');

    let method = this.editMode ? 'updateInteroperabilityRecord' : 'addInteroperabilityRecord';
    this.guidelinesService[method](guidelinesValue).subscribe(
      res => {},
      err => {
        this.showLoader = false;
        this.errorMessage = 'Something went wrong. ' + JSON.stringify(err.error.message);
      },
      () => {
        this.showLoader = false;
        this.router.navigate(['/dashboard/' + this.catalogueConfigId +'/'+ this.pidHandler.customEncodeURIComponent(this.providerId) +'/guidelines/']);
      }
    );
  }


  onSubmit() {
    if (!this.authService.isLoggedIn()) {
      sessionStorage.setItem('guideline', JSON.stringify(this.guidelinesForm.value));
      this.authService.login();
    }

    this.errorMessage = '';
    // this.findInvalidControls();
    // this.trimFormWhiteSpaces();
    // const path = this.route.snapshot.routeConfig.path;
    let method = this.editMode ? 'updateInteroperabilityRecord' : 'addInteroperabilityRecord';

    for (let i = 0; i < this.alternativeIdentifiersArray.length; i++) {
      if (this.alternativeIdentifiersArray.controls[i].get('value').value === ''
        || this.alternativeIdentifiersArray.controls[i].get('value').value === null) {
        this.removeAlternativeIdentifier(i);
      }
    }

    if (this.guidelinesForm.valid) {
      this.showLoader = true;
      window.scrollTo(0, 0);

      this.guidelinesService[method](this.guidelinesForm.value).subscribe(
        res => {},
        err => {
          this.showLoader = false;
          window.scrollTo(0, 0);
          this.errorMessage = 'Something went wrong. ' + JSON.stringify(err.error.message);
        },
        () => {
          this.showLoader = false;
          this.router.navigate(['/dashboard/' + this.catalogueConfigId +'/'+ this.pidHandler.customEncodeURIComponent(this.guidelinesForm.get('providerId').value) +'/guidelines/']);
        }
      );
    } else {
      // console.log(this.guidelinesForm);
      this.markFormAsDirty();
      window.scrollTo(0, 0);
      // this.markTabs();
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
  checkFormValidity(name: string, edit: boolean, required?: boolean): boolean {
    return false;
    // if (required && edit && (this.guidelinesForm.get(name).value === "")) return false; // for dropdown required fields that get red on edit
    // console.log(name);
    // return (this.guidelinesForm.get(name).invalid && (edit || this.guidelinesForm.get(name).dirty));
  }

  checkFormArrayValidity(name: string, position: number, edit: boolean, groupName?: string): boolean {
    return false;
    // if (groupName) {
    //   return (this.getFieldAsFormArray(name).get([position]).get(groupName).invalid
    //     && (edit || this.getFieldAsFormArray(name).get([position]).get(groupName).dirty));
    // }
    // return (this.getFieldAsFormArray(name).get([position]).invalid
    //   && (edit || this.getFieldAsFormArray(name).get([position]).dirty));
  }

  checkEveryArrayFieldValidity(name: string, edit: boolean, groupName?: string): boolean {
    return false;
    // for (let i = 0; i < this.getFieldAsFormArray(name).length; i++) {
    //   if (groupName) {
    //     if (this.getFieldAsFormArray(name).get([i]).get(groupName).invalid
    //       && (edit || this.getFieldAsFormArray(name).get([i]).get(groupName).dirty)) {
    //       return true;
    //     }
    //   } else if (this.getFieldAsFormArray(name).get([i]).invalid
    //     && (edit || this.getFieldAsFormArray(name).get([i]).dirty)) {
    //     return true;
    //   }
    // }
    // return false;
  }

  // markTabs() {
  //   this.tabs[0] = (this.checkFormValidity('name', this.edit)
  //     || this.checkFormValidity('abbreviation', this.edit)
  //     || this.checkFormValidity('website', this.edit)
  //     || this.checkEveryArrayFieldValidity('legalEntity', this.edit)
  //     || this.checkFormValidity('legalStatus', this.edit)
  //     || this.checkFormValidity('hostingLegalEntity', this.edit));
  //   this.tabs[1] = (this.checkFormValidity('description', this.edit)
  //     || this.checkFormValidity('logo', this.edit)
  //     || this.checkEveryArrayFieldValidity('multimedia', this.edit, 'multimediaURL')
  //     || this.checkEveryArrayFieldValidity('multimedia', this.edit, 'multimediaName'));
  //   this.tabs[2] = (this.checkEveryArrayFieldValidity('tags', this.edit)
  //     || this.checkEveryArrayFieldValidity('scientificDomains', this.edit, 'scientificDomain')
  //     || this.checkEveryArrayFieldValidity('scientificDomains', this.edit, 'scientificSubdomain'));
  //   this.tabs[3] = (this.checkFormValidity('location.streetNameAndNumber', this.edit)
  //     || this.checkFormValidity('location.postalCode', this.edit)
  //     || this.checkFormValidity('location.city', this.edit)
  //     || this.checkFormValidity('location.region', this.edit)
  //     || this.checkFormValidity('location.country', this.edit));
  //   this.tabs[4] = (this.checkFormValidity('mainContact.firstName', this.edit)
  //     || this.checkFormValidity('mainContact.lastName', this.edit)
  //     || this.checkFormValidity('mainContact.email', this.edit)
  //     || this.checkFormValidity('mainContact.phone', this.edit)
  //     || this.checkFormValidity('mainContact.position', this.edit)
  //     || this.checkEveryArrayFieldValidity('publicContacts', this.edit, 'firstName')
  //     || this.checkEveryArrayFieldValidity('publicContacts', this.edit, 'lastName')
  //     || this.checkEveryArrayFieldValidity('publicContacts', this.edit, 'email')
  //     || this.checkEveryArrayFieldValidity('publicContacts', this.edit, 'phone')
  //     || this.checkEveryArrayFieldValidity('publicContacts', this.edit, 'position'));
  // }

  /** <--check form fields and tabs validity**/

  /** get and set vocabularies **/
  setVocabularies() {
    this.resourceService.getAllVocabulariesByType().subscribe(
      res => {
        this.vocabulariesMap = res;

        // this.vocabularies = res;
        // this.identifierTypeVocabulary = this.vocabularies[Type.IR_IDENTIFIER_TYPE];
        // this.nameTypeVocabulary = this.vocabularies[Type.IR_NAME_TYPE];
        // this.resourceTypeGeneralVocabulary = this.vocabularies[Type.IR_RESOURCE_TYPE_GENERAL];
        // this.statusVocabulary = this.vocabularies[Type.IR_STATUS];
        // this.domainVocabulary = this.vocabularies[Type.SCIENTIFIC_DOMAIN];
        // this.eoscGuidelineTypeVocabulary = this.vocabularies[Type.IR_EOSC_GUIDELINE_TYPE];
        // return this.vocabularies;
      },
      error => console.log(JSON.stringify(error.error)),
      () => {
        // let voc: Vocabulary[] = this.vocabularies[Type.SCIENTIFIC_SUBDOMAIN].concat(this.vocabularies[Type.PROVIDER_MERIL_SCIENTIFIC_SUBDOMAIN]);
        // this.subVocabularies = this.groupByKey(voc, 'parentId');
        // this.premiumSort.transform(this.statusVocabulary, ['Candidate', 'Proposed', 'Consultation', 'On Hold', 'Update Pending', 'Accepted', 'Operating', 'Deprecated', 'Abandoned', 'Withdrawn', 'Rejected']);
        // return this.vocabularies;
      }
    );
  }

  /** handle form arrays--> **/
  getFieldAsFormArray(field: string) {
    return this.guidelinesForm.get(field) as UntypedFormArray;
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

  /** ResourceTypeInfo--> **/

  newResourceTypeInfo(): UntypedFormGroup {
    return this.fb.group({
      resourceType: [''],
      resourceTypeGeneral: ['']
    });
  }

  get resourceTypeInfoArray() {
    return this.guidelinesForm.get('resourceTypesInfo') as UntypedFormArray;
  }

  pushResourceTypeInfo() {
    this.resourceTypeInfoArray.push(this.newResourceTypeInfo());
  }

  removeResourceTypeInfo(index: number) {
    this.resourceTypeInfoArray.removeAt(index);
  }

  /** <-- ResourceTypeInfo**/

  /** Rights-->**/
  newRight(): UntypedFormGroup {
    return this.fb.group({
      rightTitle: ['', Validators.required],
      rightURI: ['', Validators.compose([Validators.required, URLValidator])],
      rightIdentifier: ['', Validators.required]
    });
  }

  get rightsArray() {
    return this.guidelinesForm.get('rights') as UntypedFormArray;
  }

  pushRight() {
    this.rightsArray.push(this.newRight());
  }

  removeRight(index: number) {
    this.rightsArray.removeAt(index);
  }

  /** <--Rights**/

  /** Related Standards -->**/
  newRelatedStandard(): UntypedFormGroup {
    return this.fb.group({
      relatedStandardURI: ['', URLValidator],
      relatedStandardIdentifier: ['']
    });
  }

  get relatedStandardsArray() {
    return this.guidelinesForm.get('relatedStandards') as UntypedFormArray;
  }

  pushRelatedStandard() {
    this.relatedStandardsArray.push(this.newRelatedStandard());
  }

  removeRelatedStandard(index: number) {
    this.relatedStandardsArray.removeAt(index);
  }

  /** <--Related Standards **/

  /** Alternative Identifiers-->**/
  newAlternativeIdentifier(): UntypedFormGroup {
    return this.fb.group({
      type: [''],
      value: ['']
    });
  }

  get alternativeIdentifiersArray() {
    return this.guidelinesForm.get('alternativeIdentifiers') as UntypedFormArray;
  }

  pushAlternativeIdentifier() {
    this.alternativeIdentifiersArray.push(this.newAlternativeIdentifier());
  }

  removeAlternativeIdentifier(index: number) {
    this.alternativeIdentifiersArray.removeAt(index);
  }
  /** <--Alternative Identifiers**/

  /** Creators as public contacts -->**/
  newCreator(): UntypedFormGroup {
    return this.fb.group({
      creatorNameTypeInfo: this.fb.group({creatorName:'', nameType:'ir_name_type-personal'}),
      givenName: [''],
      familyName: [''],
      nameIdentifier: [''],
      creatorAffiliationInfo: this.fb.group({affiliation:'', affiliationIdentifier:''}),
    }, Validators.required);
  }

  get creatorsArray() {
    return this.guidelinesForm.get('creators') as UntypedFormArray;
  }

  pushCreator() {
    this.creatorsArray.push(this.newCreator());
  }

  removeCreator(index: number) {
    this.creatorsArray.removeAt(index);
  }

  /** <--creator as public contacts **/


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
    for (const i in this.guidelinesForm.controls) {
      for (const j in this.guidelinesForm.controls[i].value) {
        // console.log(this.providerForm.controls[i].value);
        if (this.guidelinesForm.controls[i].value.hasOwnProperty(j)) {
          if (this.guidelinesForm.controls[i].get(j)) {
            if (this.guidelinesForm.controls[i].get(j).value.constructor !== Array) {
              this.guidelinesForm.controls[i].get(j).markAsDirty();
              this.guidelinesForm.controls[i].get(j).markAsTouched();
            }
          }
        }
      }
      if (this.guidelinesForm.controls[i].value.constructor === Array) {
        for (let j = 0; j < this.getFieldAsFormArray(i).controls.length; j++) {
          const keys = Object.keys(this.guidelinesForm.controls[i].value[j]);
          for (let k = 0; k < keys.length; k++) {
            if (this.getFieldAsFormArray(i).controls[j].get(keys[k])) {
              this.getFieldAsFormArray(i).controls[j].get(keys[k]).markAsTouched();
              this.getFieldAsFormArray(i).controls[j].get(keys[k]).markAsDirty();
            }
          }
        }
      }
      this.guidelinesForm.controls[i].markAsDirty();
    }
  }

  unsavedChangesPrompt() {
    this.hasChanges = true;
  }

  timeOut(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  checkForDuplicates(formControlName, group?) {
    return;
/*    if (group === 'scientificDomains') {
      // for (let i = 0; i < this.domainArray.controls.length; i++) {
      //   for (let j = 0; j <  this.domainArray.controls.length; j++) {
      //     if (i !== j && this.domainArray.controls[i].get('scientificDomain').value === this.domainArray.controls[j].get('scientificDomain').value ) {
      //       if (this.domainArray.controls[i].get('scientificSubdomain').value === this.domainArray.controls[j].get('scientificSubdomain').value) {
      //         this.showNotification();
      //         return;
      //       }
      //     }
      //   }
      // }
    } else {
      if (this.guidelinesForm.get(formControlName).value.length > 1) {
        for (let i = 0; i < this.guidelinesForm.get(formControlName).value.length; i++) {
          for (let j = 0; j < this.guidelinesForm.get(formControlName).value.length; j++) {
            if (i !== j && this.guidelinesForm.get(formControlName).value[i] === this.guidelinesForm.get(formControlName).value[j]) {
              this.showNotification();
              return;
            }
          }
        }
      }
    }*/
  }

  /** BitSets -->**/
  /*handleBitSets(tabNum: number, bitIndex: number, formControlName: string): void {
    if (bitIndex === 0) {
      // this.catalogueName = this.guidelinesForm.get(formControlName).value;
    }
    if (this.guidelinesForm.get(formControlName).valid || (this.guidelinesForm.get(formControlName).disabled && this.guidelinesForm.get(formControlName).value != '')) {
      this.decreaseRemainingFieldsPerTab(tabNum, bitIndex);
      this.loaderBitSet.set(bitIndex, 1);
    } else if (this.guidelinesForm.get(formControlName).invalid) {
      this.increaseRemainingFieldsPerTab(tabNum, bitIndex);
      this.loaderBitSet.set(bitIndex, 0);
    } else if (this.guidelinesForm.get(formControlName).pending) {
      this.timeOut(300).then( () => this.handleBitSets(tabNum, bitIndex, formControlName));
      return;
    }
    this.updateLoaderPercentage();
  }

  handleBitSetsOfGroups(tabNum: number, bitIndex: number, formControlName: string, group?: string): void {
    if (this.guidelinesForm.controls[group].get(formControlName).valid || (this.guidelinesForm.controls[group].get(formControlName).disabled && this.guidelinesForm.controls[group].get(formControlName).value != '')) {
      this.decreaseRemainingFieldsPerTab(tabNum, bitIndex);
      this.loaderBitSet.set(bitIndex, 1);
    } else if (this.guidelinesForm.controls[group].get(formControlName).invalid) {
      this.increaseRemainingFieldsPerTab(tabNum, bitIndex);
      this.loaderBitSet.set(bitIndex, 0);
    }
    this.updateLoaderPercentage();
  }

  handleBitSetsOfPublicContact(tabNum: number, bitIndex: number, formControlName: string, group?: string): void {
    if (this.guidelinesForm.get(group).value[0][formControlName] !== '' && this.guidelinesForm.controls[group].valid || this.guidelinesForm.controls[group].disabled) {
      this.decreaseRemainingFieldsPerTab(tabNum, bitIndex);
      this.loaderBitSet.set(bitIndex, 1);
    } else {
      this.increaseRemainingFieldsPerTab(tabNum, bitIndex);
      this.loaderBitSet.set(bitIndex, 0);
    }
    this.updateLoaderPercentage();
  }

  initUserBitSets() {
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
  }*/

  /** <--BitSets **/

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

  timestampToDate(timestamp: string) {
    return new Date(+timestamp).toUTCString();
    // return new Date(+timestamp).toISOString().split('T')[0]; //Date without time
  }

  switchToTab(id: string){
    const element: HTMLElement = document.getElementById(id) as HTMLElement;
    element.click();
    window.scrollTo(0, -1);
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.guidelinesForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    // return invalid;
    console.log('findInvalidControls ', invalid);
  }

  cleanArrayProperty(obj: any, property: string): void {
    if (obj && Array.isArray(obj[property])) {
      // Filter out elements that are entirely empty:
      const cleaned = obj[property].filter((element: any) => {
        if (element && typeof element === 'object') {
          // Keep the element if at least one property has a non-empty value.
          return Object.keys(element).some(key => element[key] !== null && element[key] !== '');
        }
        // For non-objects, keep the element if it's not null or ''.
        return element !== null && element !== '';
      });
      // If the cleaned array is empty, set the property to null. Otherwise, update it.
      obj[property] = cleaned.length ? cleaned : null;
    }
  }

  protected readonly environment = environment;
  protected readonly isDevMode = isDevMode;
}
