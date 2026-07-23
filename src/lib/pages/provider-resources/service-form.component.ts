import {UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {Component, Injector, isDevMode, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {NavigationService} from '../../services/navigation.service';
import {ResourceService} from '../../services/resource.service';
import {Provider, Service, Type, Vocabulary} from '../../domain/eic-model';
import {Paging} from '../../domain/paging';
import {config, Observable, of, zip} from 'rxjs';
import {PremiumSortPipe} from '../../shared/pipes/premium-sort.pipe';
import {ConfigService} from '../../services/config.service';
import {environment} from '../../../environments/environment';
import {ActivatedRoute, Router} from '@angular/router';
import {ServiceProviderService} from '../../services/service-provider.service';
import {CatalogueService} from "../../services/catalogue.service";
import {pidHandler} from "../../shared/pid-handler/pid-handler.service";
import {FormControlService} from "../../../dynamic-catalogue/services/form-control.service";
import {SurveyComponent} from "../../../dynamic-catalogue/pages/dynamic-form/survey.component";
import {Model} from "../../../dynamic-catalogue/domain/dynamic-form-model";
import {SuggestionConfig, SuggestionService, SuggestionState} from "../../services/suggestion.service";

declare let UIkit: any;

@Component({
    selector: 'app-service-form',
    templateUrl: './service-form.component.html',
    providers: [FormControlService],
    standalone: false
})
export class ServiceFormComponent implements OnInit, OnDestroy {
  @ViewChild(SurveyComponent) child: SurveyComponent
  model: Model = null;
  vocabulariesMap: Map<string, object[]> = null;
  subVocabulariesMap: Map<string, object[]> = null
  payloadAnswer: object = null;
  formDataToSubmit: any = null;

  protected readonly isDevMode = isDevMode;
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
  viewOnlyMode = false;
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

  providersPage: Paging<Provider>;
  requiredResources: any;
  providersAsVocs: any;
  resourcesAsVocs: any;
  territoriesVoc: any;
  vocabularies: Map<string, Vocabulary[]> = null;
  subVocabularies: Map<string, Vocabulary[]> = null;
  premiumSort = new PremiumSortPipe();
  resourceService: ResourceService = this.injector.get(ResourceService);
  suggestionService: SuggestionService = this.injector.get(SuggestionService);
  navigator: NavigationService = this.injector.get(NavigationService);

  /** config for suggestions --> **/
  suggestionConfig: SuggestionConfig = {
    resourceType: 'service',
    formKey: 'service',
    fields: [
      {
        fieldName: 'scientific_domains',
        label: 'Scientific Subdomains',
        type: 'checkbox',
        vocabularyType: Type.SCIENTIFIC_SUBDOMAIN,
        isComposite: true,
        formArrayName: 'scientificDomains',
        parentLookupField: 'scientificDomain',
        childField: 'scientificSubdomain'
      },
      {
        fieldName: 'categories',
        label: 'Subcategories',
        type: 'checkbox',
        vocabularyType: Type.SUBCATEGORY,
        isComposite: true,
        formArrayName: 'categories',
        parentLookupField: 'category',
        childField: 'subcategory'
      },
      {
        fieldName: 'access_types',
        label: 'Access Types',
        type: 'radio',
        vocabularyType: Type.ACCESS_TYPE,
        formArrayName: 'accessTypes'
      },
      {
        fieldName: 'order_type',
        label: 'Order Type',
        type: 'radio',
        vocabularyType: Type.ORDER_TYPE,
        formArrayName: 'orderType'
      },
      {
        fieldName: 'tags',
        label: 'Tags',
        type: 'checkbox',
        vocabularyType: null,  // free text, no vocabulary lookup needed
        formArrayName: 'tags'
      }
    ]
  };

  // state — flat object, easy to inspect
  suggestionState: SuggestionState = this.suggestionService.getInitialState();
  // unique per component instance so two 'service' forms can never collide on the same modal id
  suggestionModalId: string = this.suggestionService.generateModalId(this.suggestionConfig.resourceType);
  /** <--config for suggestions **/

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
              protected catalogueService: CatalogueService,
              protected route: ActivatedRoute,
              public pidHandler: pidHandler,
              public dynamicFormService: FormControlService,
              public router: Router,
              public config: ConfigService) {
    this.resourceService = this.injector.get(ResourceService);
    this.fb = this.injector.get(UntypedFormBuilder);
    this.navigator = this.injector.get(NavigationService);
    this.weights[0] = this.authenticationService.getUserEmail().split('@')[0];
  }

  submitForm(formData: any) {
    let serviceValue = formData.value.service;
    window.scrollTo(0, 0);

    if (!this.authenticationService.isLoggedIn()) {
      sessionStorage.setItem('service', JSON.stringify(this.serviceForm.value));
      this.authenticationService.login();
    }

    this.errorMessage = '';
    this.showLoader = true;

    serviceValue = FormControlService.cleanObjectInPlace(serviceValue);

    if (this.submitMode === 'draft') {
      this.resourceService.temporarySaveService(serviceValue).subscribe(
        _service => {
          // console.log(_service);
          this.showLoader = false;
          // return this.navigator.dashboardDraftResources(this.providerId); // navigate to draft list
          return this.navigator.go('/provider/' + this.pidHandler.customEncodeURIComponent(_service.resourceOwner) + '/draft-resource/update/' + this.pidHandler.customEncodeURIComponent(_service.id)); // remain on form
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
          return this.navigator.resourceDashboard(this.providerId, _service.id);  // navigate to resource-dashboard
        },
        err => {
          this.showLoader = false;
          window.scrollTo(0, 0);
          this.errorMessage = 'Something went bad, server responded: ' + err?.error?.detail;
        }
      );
    } else {
      this.resourceService.submitService(serviceValue, this.editMode, this.commentControl.value).subscribe(
        _service => {
          this.showLoader = false;
          return this.navigator.resourceDashboard(this.providerId, _service.id);  // navigate to resource-dashboard
          // return this.router.dashboardResources(this.providerId);                  // navigate to provider dashboard -> resource list
          // return window.location.href = this._marketplaceServicesURL + _service.id; // navigate to marketplace
        },
        err => {
          this.showLoader = false;
          window.scrollTo(0, 0);
          this.errorMessage = 'Something went bad, server responded: ' + err?.error?.detail;
        }
      );
    }
  }

  ngOnInit() {
    const path = this.route.snapshot.routeConfig.path;
    if (path.includes('view/:resourceId')) {
      this.viewOnlyMode = true;
    }
    this.showLoader = true;
    if ( !this.router.url.includes('/update/') || this.router.url.includes('/draft-resource/update/')) {
      this.saveAsDraftAvailable = true;
    }
    zip(
      this.resourceService.getProvidersNames('approved'),
      this.resourceService.getAllVocabulariesByType(),
      // this.resourceService.getResourcesAsVocs(this.catalogueId ? this.catalogueId : this.catalogueConfigId, "provider"),
      // this.resourceService.getResourcesAsVocs(this.catalogueId ? this.catalogueId : this.catalogueConfigId, "service"),
      //TODO see if we need those and fix
      // this.resourceService.getResourcesAsVocs(this.catalogueId ? this.catalogueId : this.catalogueConfigId, "datasource"),
      // this.resourceService.getResourcesAsVocs(this.catalogueId ? this.catalogueId : this.catalogueConfigId, "training_resource"),
      this.resourceService.getTerritories(),
      this.serviceProviderService.getFormModelById('m-b-service')
    ).subscribe(suc => {
        this.providersPage = <Paging<Provider>>suc[0];
        this.vocabularies = <Map<string, Vocabulary[]>>suc[1];
        this.vocabulariesMap = suc[1];
        // this.providersAsVocs = suc[2];
        // this.resourcesAsVocs = suc[3];
        this.territoriesVoc = suc[2]; //combined COUNTRY and REGION vocs
        this.model = suc[3];
      },
      err => {
                this.errorMessage =
          (err?.status >= 500 && err?.status < 600)
            ? `Something went wrong. If the issue persists, please contact support and provide the following error code: ${err?.error?.traceId}`
            : `Something went bad while getting the data for page initialization: ${err?.error?.detail}`;
      },
      () => {
        this.premiumSort.transform(this.geographicalVocabulary, ['Europe', 'Worldwide']);
        this.premiumSort.transform(this.languagesVocabulary, ['English']);
        this.premiumSort.transform(this.serviceCategoryVocabulary, ['Compute', 'Data Source', 'Storage']);
        this.providersPage.results.sort((a, b) => 0 - (a.name > b.name ? -1 : 1));

        const voc: Vocabulary[] = this.vocabularies[Type.SUBCATEGORY].concat(this.vocabularies[Type.SCIENTIFIC_SUBDOMAIN]);
        this.subVocabularies = this.groupByKey(voc, 'parentId');

        this.providerId = this.route.snapshot.paramMap.get('providerId');
        // if (this.editMode && this.catalogueName === 'EOSC' && !(this.route.snapshot.paramMap.get('resourceId').startsWith(this.providerId+'.'))) {
        //   return this.router.go('/404');
        // }

        this.showProviderName(decodeURIComponent(this.providerId));
        // if(this.catalogueId == this.catalogueConfigId) this.displayedCatalogueName = `| Catalogue: ${this.config.getProperty('catalogueName')}`;
        // else if(this.catalogueId) this.showCatalogueName(this.catalogueId);

        if(!this.editMode){ //prefill field(s)
          this.payloadAnswer = {'answer': { service:
                {
                  'resourceOwner': decodeURIComponent(this.providerId),
                  'type': "Service",
                  'nodePID': (this.config.getProperty('nodePidFixed')) ? this.config.getProperty('nodePid') : null
                }
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
  /** <--Modals **/

  submitVocSuggestion(entryValueName, vocabulary, parent) {
    if (entryValueName.trim() !== '') {
      this.serviceProviderService.submitVocabularyEntry(entryValueName, vocabulary, parent, 'service', this.providerId, this.serviceId).subscribe(
        res => {
        },
        error => {
          console.log(error);
          this.vocabularyEntryForm.get('errorMessage').setValue(error.error.detail);
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

  /** <--Display Provider and Catalogue Names **/

  /** Suggestions(Recommendations) Autocomplete--> **/
  showSuggestionsModal() {
    this.suggestionService.fetchSuggestions(
      this.suggestionConfig,
      this.child.form,
      this.vocabularies,
      this.suggestionState,
      (newState) => {
        this.suggestionState = newState;
        UIkit.modal('#' + this.suggestionModalId).show(); // safe to call multiple times
      }
    );
  }

  ngOnDestroy() {
    // UIkit moves modal elements to <body> on init; destroying it here (rather than
    // waiting for Angular's async view teardown) prevents it from briefly lingering
    // in the DOM when navigating straight to another form of the same resource type.
    UIkit.modal('#' + this.suggestionModalId)?.$destroy(true);
  }

  onCheckboxChange(event: any, fieldName: string, type: 'checkbox' | 'radio') {
    this.suggestionState.selections = this.suggestionService.toggleSelection(
      this.suggestionState, fieldName, event.target.value, event.target.checked, type
    );
  }

  isSuggestionSelected(fieldName: string, itemId: string, type: 'checkbox' | 'radio'): boolean {
    return this.suggestionService.isSelected(this.suggestionState, fieldName, itemId, type);
  }

  autocomplete() {
    this.suggestionService.autocomplete(
      this.suggestionConfig,
      this.child.form,
      this.suggestionState,
      this.vocabularies,
      this.child,
      this.dynamicFormService,
      this.model
    );
  }
  /** <--Suggestions(Recommendations) Autocomplete **/
}
