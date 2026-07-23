import {Component, Injector, isDevMode, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {AuthenticationService} from '../../services/authentication.service';
import {ServiceProviderService} from '../../services/service-provider.service';
import {CatalogueService} from "../../services/catalogue.service";
import {ResourceService} from '../../services/resource.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfigService} from '../../services/config.service';
import {environment} from '../../../environments/environment';
import {Model} from "../../../dynamic-catalogue/domain/dynamic-form-model";
import {FormControlService} from "../../../dynamic-catalogue/services/form-control.service";
import {SurveyComponent} from "../../../dynamic-catalogue/pages/dynamic-form/survey.component";
import {pidHandler} from "../../shared/pid-handler/pid-handler.service";
import {DeduplicationService, SimilarResource} from "../../services/deduplication.service";
import {SuggestionConfig, SuggestionService, SuggestionState} from "../../services/suggestion.service";
import {Type, Vocabulary} from "../../domain/eic-model";

declare let UIkit: any;

@Component({
    selector: 'app-catalogue-form',
    templateUrl: './catalogue-form.component.html',
    providers: [FormControlService],
    standalone: false
})
export class CatalogueFormComponent implements OnInit, OnDestroy {
  @ViewChild(SurveyComponent) child: SurveyComponent
  model: Model = null;
  payloadAnswer: object = null;
  formDataToSubmit: any = null;

  protected readonly isDevMode = isDevMode;
  protected readonly environment = environment;
  serviceORresource = environment.serviceORresource;
  catalogueId: string = null;
  providerId: string = null;
  errorMessage = '';
  viewOnlyMode = false;
  editMode = false;
  hasChanges = false;
  pendingCatalogue = false;
  similarResources: SimilarResource[] = [];
  disable = false;
  showLoader = false;
  isPortalAdmin = false;

  vocabularyEntryForm: UntypedFormGroup;
  suggestionsForm = {
    domainsVocabularyEntryValueName: '',
    categoriesVocabularyEntryValueName: '',
    placesVocabularyEntryValueName: '',
    networksVocabularyEntryValueName: '',
    providerTypeVocabularyEntryValueName: '',
    vocabulary: '',
    errorMessage: '',
    successMessage: ''
  };

  commentControl = new UntypedFormControl();

  /** config for suggestions --> **/
  suggestionConfig: SuggestionConfig = {
    resourceType: 'catalogue',
    formKey: 'catalogue',
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
        fieldName: 'tags',
        label: 'Tags',
        type: 'checkbox',
        vocabularyType: null,
        formArrayName: 'tags'
      }
    ]
  };

  suggestionService: SuggestionService = this.injector.get(SuggestionService);
  suggestionState: SuggestionState = this.suggestionService.getInitialState();
  // unique per component instance so two 'catalogue' forms can never collide on the same modal id
  suggestionModalId: string = this.suggestionService.generateModalId(this.suggestionConfig.resourceType);

  vocabularies: Map<string, Vocabulary[]> = null;
  /** <--config for suggestions **/

  constructor(public fb: UntypedFormBuilder,
              public authService: AuthenticationService,
              public serviceProviderService: ServiceProviderService,
              public catalogueService: CatalogueService,
              public resourceService: ResourceService,
              public router: Router,
              public route: ActivatedRoute,
              public dynamicFormService: FormControlService,
              public config: ConfigService,
              public pidHandler: pidHandler,
              public deduplicationService: DeduplicationService,
              public injector: Injector) {
  }

  ngOnInit() {
    this.showLoader = true;
    this.providerId = this.route.snapshot.paramMap.get('providerId');

    this.resourceService.getAllVocabulariesByType().subscribe(vocabularies => {
      this.vocabularies = vocabularies as Map<string, Vocabulary[]>;
    });

    this.serviceProviderService.getFormModelById('m-b-catalogue').subscribe(
      res => this.model = res,
      err => {
        console.log(err);
        this.showLoader = false;
      },
      () =>  {
        if (!this.editMode) { //prefill field(s)
          this.payloadAnswer = {
            'answer': {
              catalogue: {
                'resourceOwner': decodeURIComponent(this.providerId),
                'type': "Catalogue",
                'nodePID': (this.config.getProperty('nodePidFixed')) ? this.config.getProperty('nodePid') : null
              }
            }
          };
        }
        this.showLoader = false;
      }
    )

    const path = this.route.snapshot.routeConfig.path;
    if (path.includes('add/:catalogueId')) {
      this.pendingCatalogue = true;
    }
    // if (path.includes('info/:catalogueId')) {
    //   this.pendingCatalogue = true;
    // }

    this.isPortalAdmin = this.authService.isAdmin();

    this.vocabularyEntryForm = this.fb.group(this.suggestionsForm);
  }

  submitForm(formData: any, tempSave: boolean) {
    let catalogueValue = formData.value.catalogue;
    window.scrollTo(0, 0);

    this.errorMessage = '';
    // this.trimFormWhiteSpaces();
    const path = this.route.snapshot.routeConfig.path;
    let method;
    if (path === 'add/:catalogueId') {
      method = 'updateAndActivatePendingProvider';
    } else {
      method = this.editMode ? 'updateCatalogue' : 'createNewCatalogue';
    }

    catalogueValue = FormControlService.cleanObjectInPlace(catalogueValue);

    if (tempSave) {//TODO
      this.showLoader = true;
      window.scrollTo(0, 0);
      this.serviceProviderService.temporarySaveProvider(catalogueValue, (path !== 'add/:catalogueId' && this.editMode))
        .subscribe(
          res => {
            this.showLoader = false;
            this.router.navigate([`/provider/add/${res.id}`]);
          },
          err => {
            this.showLoader = false;
            window.scrollTo(0, 0);
                    this.errorMessage =
          (err?.status >= 500 && err?.status < 600)
            ? `Something went wrong. If the issue persists, please contact support and provide the following error code: ${err?.error?.traceId}`
            : `Something went bad, server responded: ${err?.error?.detail}`;
          },
          () => {
            this.showLoader = false;
          }
        );
    } else {
      this.showLoader = true;
      window.scrollTo(0, 0);

      this.catalogueService[method](catalogueValue, this.commentControl.value).subscribe(
        res => {
          this.catalogueId = res.id;
        },
        err => {
          this.showLoader = false;
          window.scrollTo(0, 0);
                  this.errorMessage =
          (err?.status >= 500 && err?.status < 600)
            ? `Something went wrong. If the issue persists, please contact support and provide the following error code: ${err?.error?.traceId}`
            : `Something went bad, server responded: ${err?.error?.detail}`;
        },
        () => {
          this.showLoader = false;
          this.router.navigate(['/catalogue-dashboard/' + this.pidHandler.customEncodeURIComponent(this.catalogueId) +'/info']);
        }
      );
    }

  }

  unsavedChangesPrompt() {
    this.hasChanges = true;
  }

  timeOut(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /** Submit Comment Modal--> **/
  handleSubmit(formData: any) {
    if (this.editMode && !this.pendingCatalogue) {
      this.formDataToSubmit = formData;
      UIkit.modal('#commentModal').show();
    } else {
      this.checkDuplicatesAndProceed(formData);
    }
  }

  checkDuplicatesAndProceed(formData: any) {
    const value = FormControlService.cleanObjectInPlace({...formData.value?.catalogue ?? formData});
    this.deduplicationService.checkBeforeAdd('catalogue', value).subscribe({
      next: similar => {
        if (similar && similar.length > 0) {
          this.similarResources = similar;
          this.formDataToSubmit = formData;
          UIkit.modal('#dupWarningModal').show();
        } else {
          this.submitForm(formData, false);
        }
      },
      error: () => this.submitForm(formData, false)
    });
  }

  proceedDespiteSimilar() {
    UIkit.modal('#dupWarningModal').hide();
    this.submitForm(this.formDataToSubmit, false);
  }
  /** <--Submit Comment Modal **/

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

  copy = window.navigator.clipboard.writeText.bind(window.navigator.clipboard);
}
