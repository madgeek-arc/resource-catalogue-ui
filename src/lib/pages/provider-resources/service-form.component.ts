import {UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {Component, Injector, isDevMode, OnInit, ViewChild} from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {NavigationService} from '../../services/navigation.service';
import {ResourceService} from '../../services/resource.service';
import {Provider, Service, Type, Vocabulary} from '../../domain/eic-model';
import {Paging} from '../../domain/paging';
import {URLValidator} from '../../shared/validators/generic.validator';
import {Observable, of, zip} from 'rxjs';
import {PremiumSortPipe} from '../../shared/pipes/premium-sort.pipe';
import {ConfigService} from '../../services/config.service';
import {environment} from '../../../environments/environment';
import {ActivatedRoute, Router} from '@angular/router';
import {ServiceProviderService} from '../../services/service-provider.service';
import {RecommendationsService} from "../../services/recommendations.service";
import {CatalogueService} from "../../services/catalogue.service";
import {pidHandler} from "../../shared/pid-handler/pid-handler.service";
import {FormControlService} from "../../../dynamic-catalogue/services/form-control.service";
import {SurveyComponent} from "../../../dynamic-catalogue/pages/dynamic-form/survey.component";
import {Model} from "../../../dynamic-catalogue/domain/dynamic-form-model";

declare var UIkit: any;

@Component({
    selector: 'app-service-form',
    templateUrl: './service-form.component.html',
    styleUrls: ['../provider/service-provider-form.component.css'],
    providers: [FormControlService],
    standalone: false
})
export class ServiceFormComponent implements OnInit {
  @ViewChild(SurveyComponent) child: SurveyComponent
  model: Model = null;
  vocabulariesMap: Map<string, object[]> = null;
  subVocabulariesMap: Map<string, object[]> = null
  payloadAnswer: object = null;
  formDataToSubmit: any = null;

  protected readonly isDevMode = isDevMode;
  catalogueConfigId: string = this.config.getProperty('catalogueId');
  catalogueName: string | null = null;
  protected readonly environment = environment;
  protected _marketplaceServicesURL = environment.marketplaceServicesURL;
  serviceORresource = environment.serviceORresource;
  serviceName = '';
  firstServiceForm = false;
  showLoader = false;
  pendingService = false;
  saveAsDraftAvailable = false;
  catalogueId: string;
  providerId: string;
  displayedProviderName: string;
  displayedCatalogueName: string;
  submitMode: 'draft' | 'submit' = 'submit';
  editMode = false;
  hasChanges = false;
  serviceForm: UntypedFormGroup;
  provider: Provider;
  service: Service;
  serviceId: string = null;
  errorMessage = '';
  successMessage: string = null;
  weights: string[] = [];
  tabs: boolean[] = [false, false, false, false, false, false, false, false, false, false, false, false];
  fb: UntypedFormBuilder = this.injector.get(UntypedFormBuilder);
  disable = false;
  isPortalAdmin = false;

  vocabularyEntryForm: UntypedFormGroup;
  vocSuggestionsForm = {
    fundingBodyVocabularyEntryValueName: '',
    fundingProgramVocabularyEntryValueName: '',
    relatedPlatformsVocabularyEntryValueName: '',
    targetUsersVocabularyEntryValueName: '',
    accessTypesVocabularyEntryValueName: '',
    accessModesVocabularyEntryValueName: '',
    orderTypeVocabularyEntryValueName: '',
    phaseVocabularyEntryValueName: '',
    categoriesVocabularyEntryValueName: '',
    subCategoriesVocabularyEntryValueName: '',
    scientificDomainVocabularyEntryValueName: '',
    scientificSubDomainVocabularyEntryValueName: '',
    placesVocabularyEntryValueName: '',
    serviceCategoryVocabularyEntryValueName: '',
    geographicalVocabularyEntryValueName: '',
    languagesVocabularyEntryValueName: '',
    vocabulary: '',
    errorMessage: '',
    successMessage: ''
  };

  commentControl = new UntypedFormControl();

  noSuggestionsCall: boolean;
  suggestedResponse: any;
  emptySuggestionResponse: boolean;

  suggestedScientificSubDomains: string[] = [];
  suggestedSubCategories: string[] = [];
  suggestedTags: string[] = [];

  selectedSuggestionsForScientificSubDomains: string[] = [];
  selectedSuggestionsForSubCategories: string[] = [];
  selectedSuggestionsForTags: string[] = [];

  public filteredSubCategoriesVocabulary: Vocabulary[] = null;
  public filteredScientificSubDomainVocabulary: Vocabulary[] = null;

  providersPage: Paging<Provider>;
  requiredResources: any;
  providersAsVocs: any;
  resourcesAsVocs: any;
  territoriesVoc: any;
  vocabularies: Map<string, Vocabulary[]> = null;
  subVocabularies: Map<string, Vocabulary[]> = null;
  premiumSort = new PremiumSortPipe();
  resourceService: ResourceService = this.injector.get(ResourceService);

  navigator: NavigationService = this.injector.get(NavigationService);

  public fundingBodyVocabulary: Vocabulary[] = null;
  public fundingProgramVocabulary: Vocabulary[] = null;
  public relatedPlatformsVocabulary: Vocabulary[] = null;
  public targetUsersVocabulary: Vocabulary[] = null;
  public accessTypesVocabulary: Vocabulary[] = null;
  public accessModesVocabulary: Vocabulary[] = null;
  public orderTypeVocabulary: Vocabulary[] = null;
  public phaseVocabulary: Vocabulary[] = null;
  public trlVocabulary: Vocabulary[] = null;
  public serviceCategoryVocabulary: Vocabulary[] = null;
  public marketplaceLocationVocabulary: Vocabulary[] = null;
  public superCategoriesVocabulary: Vocabulary[] = null;
  public categoriesVocabulary: Vocabulary[] = null;
  public subCategoriesVocabulary: Vocabulary[] = null;
  public scientificDomainVocabulary: Vocabulary[] = null;
  public scientificSubDomainVocabulary: Vocabulary[] = null;
  public placesVocabulary: Vocabulary[] = [];
  public geographicalVocabulary: Vocabulary[] = null;
  public languagesVocabulary: Vocabulary[] = null;
  public nodeVocabulary: Vocabulary[] = null;

  constructor(protected injector: Injector,
              protected authenticationService: AuthenticationService,
              protected serviceProviderService: ServiceProviderService,
              protected recommendationsService: RecommendationsService,
              protected catalogueService: CatalogueService,
              protected route: ActivatedRoute,
              public pidHandler: pidHandler,
              public dynamicFormService: FormControlService,
              public router: Router,
              public config: ConfigService) {
    this.resourceService = this.injector.get(ResourceService);
    this.fb = this.injector.get(UntypedFormBuilder);
    this.navigator = this.injector.get(NavigationService);
    this.weights[0] = this.authenticationService.user.email.split('@')[0];
  }

  submitForm(value: any) {
    let serviceValue = value[0].value.Service;
    window.scrollTo(0, 0);

    if (!this.authenticationService.isLoggedIn()) {
      sessionStorage.setItem('service', JSON.stringify(this.serviceForm.value));
      this.authenticationService.login();
    }

    this.errorMessage = '';
    this.showLoader = true;

    this.cleanArrayProperty(serviceValue, 'multimedia');
    this.cleanArrayProperty(serviceValue, 'useCases');
    this.cleanArrayProperty(serviceValue, 'alternativeIdentifiers');
    this.cleanArrayProperty(serviceValue, 'scientificDomains');
    this.cleanArrayProperty(serviceValue, 'categories');

    if (this.submitMode === 'draft') {
      this.resourceService.temporarySaveService(serviceValue).subscribe(
        _service => {
          // console.log(_service);
          this.showLoader = false;
          // return this.navigator.dashboardDraftResources(this.providerId); // navigate to draft list
          return this.navigator.go('/provider/' + this.pidHandler.customEncodeURIComponent(_service.resourceOrganisation) + '/draft-resource/update/' + this.pidHandler.customEncodeURIComponent(_service.id)); // remain on form
        },
        err => {
          this.showLoader = false;
          window.scrollTo(0, 0);
          this.errorMessage = 'Something went bad, server responded: ' + JSON.stringify(err.error);
        }
      );
    } else if (this.pendingService) {
      this.resourceService.submitPendingService(serviceValue).subscribe(
        _service => {
          this.showLoader = false;
          if (!this.firstServiceForm || !this.editMode) return this.navigator.selectSubprofile(this.providerId, _service.id);  // navigate to select-subprofile
          if (this.editMode || this.firstServiceForm) return this.navigator.resourceDashboard(this.providerId, _service.id);  // navigate to resource-dashboard
        },
        err => {
          this.showLoader = false;
          window.scrollTo(0, 0);
          this.errorMessage = 'Something went bad, server responded: ' + err?.error?.message;
        }
      );
    } else {
      this.resourceService.submitService(serviceValue, this.editMode, this.commentControl.value).subscribe(
        _service => {
          this.showLoader = false;
          if (this.pendingService && !this.firstServiceForm) return this.navigator.selectSubprofile(this.providerId, _service.id);  // navigate to select-subprofile
          if (this.editMode || this.firstServiceForm) return this.navigator.resourceDashboard(this.providerId, _service.id);  // navigate to resource-dashboard
          if (!this.editMode) return this.navigator.selectSubprofile(this.providerId, _service.id);  // navigate to select-subprofile
          // return this.router.dashboardResources(this.providerId);                  // navigate to provider dashboard -> resource list
          // return window.location.href = this._marketplaceServicesURL + _service.id; // navigate to marketplace
        },
        err => {
          this.showLoader = false;
          window.scrollTo(0, 0);
          this.errorMessage = 'Something went bad, server responded: ' + err?.error?.message;
        }
      );
    }
  }

  ngOnInit() {
    this.catalogueName = this.config.getProperty('catalogueName');
    this.showLoader = true;
    if ( !this.router.url.includes('/update/') || this.router.url.includes('/draft-resource/update/')) {
      this.saveAsDraftAvailable = true;
    }
    zip(
      this.resourceService.getProvidersNames('approved'),
      this.resourceService.getAllVocabulariesByType(),
      this.resourceService.getProvidersAsVocs(this.catalogueId ? this.catalogueId : this.catalogueConfigId),
      this.resourceService.getResourcesAsVocs(this.catalogueId ? this.catalogueId : this.catalogueConfigId),
      this.resourceService.getTerritories(),
      this.serviceProviderService.getFormModelById('m-b-service')
    ).subscribe(suc => {
        this.providersPage = <Paging<Provider>>suc[0];
        this.vocabularies = <Map<string, Vocabulary[]>>suc[1];
        this.vocabulariesMap = suc[1];
        this.providersAsVocs = suc[2];
        this.resourcesAsVocs = suc[3];
        this.territoriesVoc = suc[4]; //combined COUNTRY and REGION vocs
        this.model = suc[5];
        // this.getLocations();

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
        this.premiumSort.transform(this.geographicalVocabulary, ['Europe', 'Worldwide']);
        this.premiumSort.transform(this.languagesVocabulary, ['English']);
        this.premiumSort.transform(this.serviceCategoryVocabulary, ['Compute', 'Data Source', 'Storage']);
        this.providersPage.results.sort((a, b) => 0 - (a.name > b.name ? -1 : 1));

        let voc: Vocabulary[] = this.vocabularies[Type.SUBCATEGORY].concat(this.vocabularies[Type.SCIENTIFIC_SUBDOMAIN]);
        this.subVocabularies = this.groupByKey(voc, 'parentId');

        this.providerId = this.route.snapshot.paramMap.get('providerId');
        // if (this.editMode && this.catalogueName === 'EOSC' && !(this.route.snapshot.paramMap.get('resourceId').startsWith(this.providerId+'.'))) {
        //   return this.router.go('/404');
        // }

        this.showProviderName(decodeURIComponent(this.providerId));
        if(this.catalogueId == this.catalogueConfigId) this.displayedCatalogueName = `| Catalogue: ${this.config.getProperty('catalogueName')}`;
        else if(this.catalogueId) this.showCatalogueName(this.catalogueId);

        if(!this.editMode){ //prefill field(s)
          this.payloadAnswer = {'answer': { Service:
                { 'resourceOrganisation': decodeURIComponent(this.providerId),
                  'catalogueId': this.catalogueConfigId}
          }};
        }
        this.showLoader = false;
      }
    );

    this.isPortalAdmin = this.authenticationService.isAdmin();
    this.vocabularyEntryForm = this.fb.group(this.vocSuggestionsForm);
  }

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
    if (this.editMode && !this.pendingService) {
      this.formDataToSubmit = formData;
      UIkit.modal('#commentModal').show();
    } else {
      this.submitForm(formData);
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

  showSuggestionsModal() {
    this.emptySuggestionResponse = false;
    UIkit.modal('#suggestionsModal').show();
    // this.getSuggestions();
  }
  /** <--Modals **/

  submitVocSuggestion(entryValueName, vocabulary, parent) {
    if (entryValueName.trim() !== '') {
      this.serviceProviderService.submitVocabularyEntry(entryValueName, vocabulary, parent, 'service', this.providerId, this.serviceId).subscribe(
        res => {
        },
        error => {
          console.log(error);
          this.vocabularyEntryForm.get('errorMessage').setValue(error.error.message);
        },
        () => {
          this.vocabularyEntryForm.reset();
          this.vocabularyEntryForm.get('successMessage').setValue('Suggestion submitted!');
        }
      );
    }
  }

  groupByKey(array, key) {
    return array.reduce((hash, obj) => {
      if (obj[key] === undefined) {
        return hash;
      }
      return Object.assign(hash, {[obj[key]]: (hash[obj[key]] || []).concat(obj)});
    }, {});
  }

  /**Display Provider and Catalogue Names--> **/
  showProviderName(providerId: string) {
    const provider = this.providersPage.results.find(provider => provider.id === providerId);
    this.displayedProviderName = (provider.name ? `| Provider: ${provider.name} ` : '');
  }

  showCatalogueName(catalogueId: string) {
    if (catalogueId!='undefined' && catalogueId!=undefined){
    this.catalogueService.getCatalogueById(catalogueId).subscribe(
      catalogue => this.displayedCatalogueName = `| Catalogue: ${catalogue.name}`,
      error => console.log(error)
    );}
  }
  /** <--Display Provider and Catalogue Names **/

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

}
