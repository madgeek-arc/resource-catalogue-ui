import {UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {Component, Injector, isDevMode, OnInit, ViewChild} from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {NavigationService} from '../../services/navigation.service';
import {TrainingResourceService} from '../../services/training-resource.service';
import * as dm from '../../shared/description.map';
import {
  DeployableService,
  Provider,
  Service,
  Type,
  Vocabulary
} from '../../domain/eic-model';
import {Paging} from '../../domain/paging';
import {URLValidator} from '../../shared/validators/generic.validator';
import {zip} from 'rxjs';
import {PremiumSortPipe} from '../../shared/pipes/premium-sort.pipe';
import {environment} from '../../../environments/environment';
import BitSet from 'bitset';
import {ActivatedRoute} from '@angular/router';
import {ResourceService} from "../../services/resource.service";
import {SurveyComponent} from "../../../dynamic-catalogue/pages/dynamic-form/survey.component";
import {Model} from "../../../dynamic-catalogue/domain/dynamic-form-model";
import {FormControlService} from "../../../dynamic-catalogue/services/form-control.service";
import {DeployableServiceService} from "../../services/deployable-service.service";

declare var UIkit: any;

@Component({
  selector: 'app-deployable-service-form',
  templateUrl: './deployable-service-form.html',
  styleUrls: ['../provider/service-provider-form.component.css']
})
export class DeployableServiceForm implements OnInit {
  @ViewChild(SurveyComponent) child: SurveyComponent
  model: Model = null;
  vocabulariesMap: Map<string, object[]> = null;
  subVocabulariesMap: Map<string, object[]> = null
  payloadAnswer: object = null;
  formDataToSubmit: any = null;

  protected _marketplaceServicesURL = environment.marketplaceServicesURL;
  projectMail = environment.projectMail;
  serviceName = '';
  firstServiceForm = false;
  showLoader = false;
  pendingResource = false;
  catalogueId: string;
  providerId: string;
  editMode = false;
  hasChanges = false;
  serviceForm: UntypedFormGroup;
  provider: Provider;
  service: Service;
  deployableServiceId: string = null;
  errorMessage = '';
  successMessage: string = null;
  weights: string[] = [];
  tabs: boolean[] = [false, false, false, false, false, false, false, false, false, false, false, false];
  fb: UntypedFormBuilder = this.injector.get(UntypedFormBuilder);
  disable = false;
  isPortalAdmin = false;

  requiredOnTab0 = 4;
  requiredOnTab1 = 3;
  requiredOnTab2 = 3;
  requiredOnTab3 = 2;
  requiredOnTab4 = 1;
  requiredOnTab5 = 1;

  remainingOnTab0 = this.requiredOnTab0;
  remainingOnTab1 = this.requiredOnTab1;
  remainingOnTab2 = this.requiredOnTab2;
  remainingOnTab3 = this.requiredOnTab3;
  remainingOnTab4 = this.requiredOnTab4;
  remainingOnTab5 = this.requiredOnTab5;

  BitSetTab0 = new BitSet;
  BitSetTab1 = new BitSet;
  BitSetTab2 = new BitSet;
  BitSetTab3 = new BitSet;
  BitSetTab4 = new BitSet;
  BitSetTab5 = new BitSet;

  requiredTabs = 6;
  completedTabs = 0;
  completedTabsBitSet = new BitSet;

  allRequiredFields = 17;
  loaderBitSet = new BitSet;
  loaderPercentage = 0;

  vocabularyEntryForm: UntypedFormGroup;
  suggestionsForm = {
    targetGroupsVocabularyEntryValueName: '', //targetUsersVocabularyEntryValueName: '',
    contentResourceTypesVocabularyEntryValueName: '',
    learningResourceTypesVocabularyEntryValueName: '',
    scientificDomainVocabularyEntryValueName: '',
    scientificSubDomainVocabularyEntryValueName: '',
    languagesVocabularyEntryValueName: '',
    geographicalVocabularyEntryValueName: '',
    vocabulary: '',
    errorMessage: '',
    successMessage: ''
  };

  commentControl = new UntypedFormControl();

  providersPage: Paging<Provider>;
  providersAsVocs: any;
  resourcesAsVocs: any;
  territoriesVoc: any;
  vocabularies: Map<string, Vocabulary[]> = null;
  subVocabularies: Map<string, Vocabulary[]> = null;
  premiumSort = new PremiumSortPipe();
  resourceService: ResourceService = this.injector.get(ResourceService);
  trainingResourceService: TrainingResourceService = this.injector.get(TrainingResourceService);

  router: NavigationService = this.injector.get(NavigationService);


  constructor(protected injector: Injector,
              protected authenticationService: AuthenticationService,
              protected deployableServiceService: DeployableServiceService,
              protected route: ActivatedRoute,
              public dynamicFormService: FormControlService
  ) {
    this.resourceService = this.injector.get(ResourceService);
    this.trainingResourceService = this.injector.get(TrainingResourceService);
    this.fb = this.injector.get(UntypedFormBuilder);
    this.router = this.injector.get(NavigationService);
    this.weights[0] = this.authenticationService.user.email.split('@')[0];
  }

  submitForm(value: any, tempSave: boolean, pendingService: boolean) {//TODO
    let dsValue = value[0].value.DeployableService;
    window.scrollTo(0, 0);

/*    if (!this.authenticationService.isLoggedIn()) {
      sessionStorage.setItem('service', JSON.stringify(this.serviceForm.value));
      this.authenticationService.login();
    }*/

    this.errorMessage = '';
    this.showLoader = true;

    this.cleanArrayProperty(dsValue, 'scientificDomains');

    if (tempSave) {//TODO
      // this.deployableServiceService.saveServiceAsDraft(this.serviceForm.value).subscribe(
      //   _service => {
      //     // console.log(_service);
      //     this.showLoader = false;
      //     // return this.router.dashboardDraftResources(this.providerId); // navigate to draft list
      //     return this.router.go('/provider/' + _service.resourceOrganisation + '/draft-resource/update/' + _service.id);
      //   },
      //   err => {
      //     this.showLoader = false;
      //     window.scrollTo(0, 0);
      //     this.scientificDomainArray.enable();
      //     this.errorMessage = 'Something went bad, server responded: ' + JSON.stringify(err.error.message);
      //   }
      // );
    } else {
      this.deployableServiceService[pendingService ? 'submitPendingService' : 'submitService']
      (dsValue, this.editMode, this.commentControl.value).subscribe(
        _service => {
          // console.log(_service);
          this.showLoader = false;
          return this.router.deployableServiceDashboard(this.providerId, _service.id);  // navigate to deployable-service-dashboard
          // return this.router.dashboardResources(this.providerId);                  // navigate to provider dashboard -> resource list
          // return this.router.dashboard(this.providerId);                          // navigate to provider dashboard
          // return this.router.service(_service.id);                               // navigate to old service info page
          // return window.location.href = this._marketplaceServicesURL + _service.id; // navigate to marketplace
        },
        err => {
          this.showLoader = false;
          window.scrollTo(0, 0);
          this.errorMessage = 'Something went bad, server responded: ' + JSON.stringify(err.error.message);
          console.log(err);
          console.log(this.errorMessage);
        }
      );
    }
  }

  ngOnInit() {
    this.showLoader = true;
    zip(
      this.trainingResourceService.getProvidersNames('approved'),
      this.trainingResourceService.getAllVocabulariesByType(),
      this.resourceService.getProvidersAsVocs(this.catalogueId ? this.catalogueId : 'eosc'),
      this.resourceService.getResourcesAsVocs(this.catalogueId ? this.catalogueId : 'eosc'),
      this.trainingResourceService.getTerritories(),
      this.deployableServiceService.getFormModelById('m-b-deployable')
    ).subscribe(suc => {
        this.providersPage = <Paging<Provider>>suc[0];
        this.vocabularies = <Map<string, Vocabulary[]>>suc[1];
        this.vocabulariesMap = suc[1];
        this.providersAsVocs = suc[2];
        this.resourcesAsVocs = suc[3];
        this.territoriesVoc = suc[4]; //combined COUNTRY and REGION vocs
        this.model = suc[5];
        // this.getLocations();

        this.vocabulariesMap = suc[1];
        let subVocs: Vocabulary[] = this.vocabulariesMap['SCIENTIFIC_SUBDOMAIN'].concat(this.vocabulariesMap['SUBCATEGORY']);
        this.subVocabulariesMap = this.groupByKey(subVocs, 'parentId');

        [this.providersAsVocs, this.resourcesAsVocs, this.territoriesVoc].forEach(vocSet => {
          Object.entries(vocSet).forEach(([key, newItems]) => {
            // Type assertion to ensure newItems is an array
            const additionalItems = newItems as Vocabulary[];
            const existingItems = this.vocabulariesMap[key] || [];
            this.vocabulariesMap[key] = [...existingItems, ...additionalItems];
          });
        });
      },
      error => {
        this.errorMessage = 'Something went bad while getting the data for page initialization. ' + JSON.stringify(error.error.message);
      },
      () => {
        this.providersPage.results.sort((a, b) => 0 - (a.name > b.name ? -1 : 1));

        let voc: Vocabulary[] = this.vocabularies[Type.SUBCATEGORY].concat(this.vocabularies[Type.SCIENTIFIC_SUBDOMAIN]);
        this.subVocabularies = this.groupByKey(voc, 'parentId');

        this.providerId = this.route.snapshot.paramMap.get('providerId');

        if(!this.editMode){ //prefill field(s)
          this.payloadAnswer = {
            'answer': {
              DeployableService:
                {
                  'resourceOrganisation': decodeURIComponent(this.providerId),
                  'catalogueId': environment.CATALOGUE
                }
            }
          };
        }
        this.showLoader = false;
      }
    );

    this.isPortalAdmin = this.authenticationService.isAdmin();

    this.vocabularyEntryForm = this.fb.group(this.suggestionsForm);
  }

  public setAsTouched() {
    const ret = {};
    this.setAsTouched_(this.serviceForm, ret);
  }

  private setAsTouched_(form: UntypedFormGroup, ret: any) {
    Object.keys(form.controls).forEach(control => {
      const control_ = form.controls[control];
      // console.log(control, control_);
      if (!control_.valid) {
        ret[control] = {};
        if (control_.hasOwnProperty('controls')) {
          this.setAsTouched_(control_ as UntypedFormGroup, ret[control]);
        } else {
          if (control_.enabled && !control_.valid) {
            // console.log(control);
            ret[control] = control_.valid;
            (control_ as UntypedFormGroup).markAsDirty();
            (control_ as UntypedFormGroup).markAsTouched();
            // console.log(control, form.controls[control].valid);
          }
        }
      }
    });
  }

  /** check form fields and tabs validity--> **/
  checkFormValidity(name: string, edit: boolean, required?: boolean): boolean {
    // console.log(name, edit, required);
    if (required && edit && (this.serviceForm.get(name).value === "")) return false; // for dropdown required fields that get red on edit
    return (this.serviceForm.get(name).invalid && (edit || this.serviceForm.get(name).dirty));
  }

  checkFormArrayValidity(name: string, position: number, edit: boolean, groupName?: string, position2?: number, contactField?: string): boolean {
    if (contactField) {
      return this.getFieldAsFormArray(name).controls[position].get(groupName).get([position2]).get(contactField).valid
        && (edit || this.getFieldAsFormArray(name).controls[position].get(groupName).get([position2]).get(contactField).dirty);
    }
    if (groupName) {
      return this.getFieldAsFormArray(name).get([position]).get(groupName).invalid
        && (edit || this.getFieldAsFormArray(name).get([position]).get(groupName).dirty);
    }
    return (this.getFieldAsFormArray(name).get([position]).invalid && (edit || this.getFieldAsFormArray(name).get([position]).dirty));
  }

  checkEveryArrayFieldValidity(name: string, edit: boolean, groupName?: string, contactField?: string): boolean {
    for (let i = 0; i < this.getFieldAsFormArray(name).length; i++) {
      if (groupName && contactField) {
        for (let j = 0; j < this.getFieldAsFormArray(name).controls[i].get(groupName)[length]; j++) {
          if (this.getFieldAsFormArray(name).controls[i].get(groupName).get([j]).get(contactField).valid
            && (edit || this.getFieldAsFormArray(name).controls[i].get(groupName).get([j]).get(contactField).dirty)) {
            return true;
          }
        }
      }
      if (groupName) {
        if (this.getFieldAsFormArray(name).get([i]).get(groupName).invalid && (edit || this.getFieldAsFormArray(name).get([i]).get(groupName).dirty)) {
          return true;
        }
      } else if (this.getFieldAsFormArray(name).get([i]).invalid && (edit || this.getFieldAsFormArray(name).get([i]).dirty)) {
        return true;
      }
    }
    return false;
  }

  markTabs() {
    this.tabs[0] = (this.checkFormValidity('title', this.editMode)
      || this.checkFormValidity('resourceOrganisation', this.editMode)
      || this.checkEveryArrayFieldValidity('resourceProviders', this.editMode)
      || this.checkEveryArrayFieldValidity('authors', this.editMode)
      || this.checkFormValidity('url', this.editMode)
      || this.checkFormValidity('urlType', this.editMode)
      || this.checkEveryArrayFieldValidity('eoscRelatedServices', this.editMode));
    this.tabs[1] = (this.checkFormValidity('description', this.editMode)
      || this.checkEveryArrayFieldValidity('keywords', this.editMode)
      || this.checkFormValidity('license', this.editMode)
      || this.checkFormValidity('accessRights', this.editMode)
      || this.checkFormValidity('versionDate', this.editMode));
    this.tabs[2] = (this.checkEveryArrayFieldValidity('targetGroups', this.editMode)
      || this.checkEveryArrayFieldValidity('learningResourceTypes', this.editMode)
      || this.checkEveryArrayFieldValidity('learningOutcomes', this.editMode)
      || this.checkFormValidity('expertiseLevel', this.editMode)
      || this.checkEveryArrayFieldValidity('contentResourceTypes', this.editMode)
      || this.checkEveryArrayFieldValidity('qualifications', this.editMode)
      || this.checkFormValidity('duration', this.editMode));
    this.tabs[3] = (this.checkEveryArrayFieldValidity('languages', this.editMode)
      || this.checkEveryArrayFieldValidity('geographicalAvailabilities', this.editMode));
    this.tabs[4] = (this.checkEveryArrayFieldValidity('scientificDomains', this.editMode, 'scientificDomain')
      || this.checkEveryArrayFieldValidity('scientificDomains', this.editMode, 'scientificSubdomain'));
    this.tabs[5] = (this.checkFormValidity('contact.firstName', this.editMode)
      || this.checkFormValidity('contact.lastName', this.editMode)
      || this.checkFormValidity('contact.email', this.editMode)
      || this.checkFormValidity('contact.phone', this.editMode)
      || this.checkFormValidity('contact.position', this.editMode)
      || this.checkFormValidity('contact.organisation', this.editMode));

    // console.log(this.tabs);
  }

  /** <--check form fields and tabs validity **/

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

  getVocabularyById(vocabularies: Vocabulary[], id: string) {
    return vocabularies.find(entry => entry.id === id);
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

  unsavedChangesPrompt() {
    this.hasChanges = true;
  }

  timeOut(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /** Modals--> **/
  showCommentModal(formData: any) {
    if (this.editMode && !this.pendingResource) {
      this.formDataToSubmit = formData;
      UIkit.modal('#commentModal').show();
    } else {
      this.submitForm(formData,false,false);
    }
  }

  openPreviewModal() {
    // console.log('Resource ==>', this.serviceForm.value);
    UIkit.modal('#modal-preview').show();
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

  /** <--Modals **/

  groupByKey(array, key) {
    return array.reduce((hash, obj) => {
      if (obj[key] === undefined) {
        return hash;
      }
      return Object.assign(hash, {[obj[key]]: (hash[obj[key]] || []).concat(obj)});
    }, {});
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
