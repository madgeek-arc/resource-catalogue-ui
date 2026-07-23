import {Component, Injector, isDevMode, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {NavigationService} from '../../services/navigation.service';
import {ResourceService} from '../../services/resource.service';
import {ServiceExtensionsService} from '../../services/service-extensions.service';
import {Provider, Service, Datasource, Type, Vocabulary} from '../../domain/eic-model';
import {Paging} from '../../domain/paging';
import {environment} from '../../../environments/environment';
import {ActivatedRoute, Router} from '@angular/router';
import {DatasourceService} from "../../services/datasource.service";
import {SurveyComponent} from "../../../dynamic-catalogue/pages/dynamic-form/survey.component";
import {Model} from "../../../dynamic-catalogue/domain/dynamic-form-model";
import {FormControlService} from "../../../dynamic-catalogue/services/form-control.service";
import {ConfigService} from "../../services/config.service";
import {pidHandler} from "../../shared/pid-handler/pid-handler.service";
import {SuggestionConfig, SuggestionService, SuggestionState} from "../../services/suggestion.service";

declare let UIkit: any;

@Component({
    selector: 'app-datasource-form',
    templateUrl: './datasource-form.component.html',
    standalone: false
})
export class DatasourceFormComponent implements OnInit, OnDestroy {
  @ViewChild(SurveyComponent) child: SurveyComponent
  model: Model = null;
  payloadAnswer: object = null;

  serviceORresource = environment.serviceORresource;
  serviceName = '';
  firstServiceForm = false;
  showLoader = false;
  pendingResource = false;
  saveAsDraftAvailable = false;
  addOpenAIRE = false; //on addOpenAIRE path
  openaireId: string = null; //datasource OA id
  providerId: string;
  catalogueId: string;
  viewOnlyMode = false;
  submitMode: 'draft' | 'submit' = 'submit';
  editMode = false;
  hasChanges = false;
  provider: Provider;
  service: Service;
  datasource: Datasource;
  errorMessage = '';
  successMessage: string = null;
  weights: string[] = [];
  tabs: boolean[] = [false];
  isPortalAdmin = false;

  serviceId: string = null; //filled for all types (service, datasource, training)
  resourceType = '';
  //only one of these 3 ids will be filled from URL
  resourceId: string = null;
  datasourceId: string = null;
  trainingResourceId: string = null;

  providersPage: Paging<Provider>;
  resourceService: ResourceService = this.injector.get(ResourceService);
  serviceExtensionsService: ServiceExtensionsService = this.injector.get(ServiceExtensionsService);
  navigator: NavigationService = this.injector.get(NavigationService);

  /** config for suggestions --> **/
  suggestionConfig: SuggestionConfig = {
    resourceType: 'datasource',
    formKey: 'datasource',
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
        fieldName: 'order_type',
        label: 'Order Type',
        type: 'radio',
        vocabularyType: Type.ORDER_TYPE,
        formArrayName: 'orderType'
      },
      {
        fieldName: 'datasource_classification',
        label: 'Datasource Classification',
        type: 'radio',
        vocabularyType: Type.DS_CLASSIFICATION,
        formArrayName: 'datasourceClassification'
      },
      {
        fieldName: 'jurisdiction',
        label: 'Jurisdiction',
        type: 'radio',
        vocabularyType: Type.DS_JURISDICTION,
        formArrayName: 'jurisdiction'
      },
      {
        fieldName: 'research_entity_types',
        label: 'Research Entity Types',
        type: 'checkbox',
        vocabularyType: Type.DS_RESEARCH_ENTITY_TYPE,
        formArrayName: 'researchProductTypes'
      },
      {
        fieldName: 'trl',
        label: 'Technology Readiness Level',
        type: 'radio',
        vocabularyType: Type.TRL,
        formArrayName: 'trl'
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
  // unique per component instance so two 'datasource' forms can never collide on the same modal id
  suggestionModalId: string = this.suggestionService.generateModalId(this.suggestionConfig.resourceType);

  vocabularies: Map<string, Vocabulary[]> = null;
  /** <--config for suggestions **/

  constructor(protected injector: Injector,
              protected authenticationService: AuthenticationService,
              protected datasourceService: DatasourceService,
              protected route: ActivatedRoute,
              protected router: Router,
              public dynamicFormService: FormControlService,
              public config: ConfigService,
              public pidHandler: pidHandler
  ) {
    this.resourceService = this.injector.get(ResourceService);
    this.navigator = this.injector.get(NavigationService);
    this.weights[0] = this.authenticationService.getUserEmail().split('@')[0];
  }

  submitForm(formData: any, tempSave: boolean, pendingResource: boolean) {
    let datasourceValue = formData.value.datasource;
    window.scrollTo(0, 0);
    this.errorMessage = '';
    this.showLoader = true;

    datasourceValue = FormControlService.cleanObjectInPlace(datasourceValue);

    if (this.submitMode === 'draft') {
      this.datasourceService.temporarySaveDatasource(datasourceValue, this.openaireId).subscribe(
        _ds => {
          // console.log(_ds);
          this.showLoader = false;
          // return this.navigator.dashboardDraftResources(this.providerId); // navigate to draft list
          return this.navigator.go('/provider/' + this.pidHandler.customEncodeURIComponent(_ds.resourceOwner) + '/draft-datasource/update/' + this.pidHandler.customEncodeURIComponent(_ds.id)); // remain on form
        },
        err => {
          this.showLoader = false;
          window.scrollTo(0, 0);
          this.errorMessage = 'Something went bad, server responded: ' + JSON.stringify(err.error);
        }
      );
    } else if (this.pendingResource) {
      this.datasourceService.submitDraftDatasource(datasourceValue).subscribe(
        _ds => {
          this.showLoader = false;
          return this.navigator.datasourceDashboard(this.providerId, _ds.id);  // navigate to resource-dashboard
        },
        err => {
          this.showLoader = false;
          window.scrollTo(0, 0);
          this.errorMessage = 'Something went bad, server responded: ' + err?.error?.detail;
        }
      );
    } else {
      this.datasourceService.submitDatasource(datasourceValue, this.editMode, this.openaireId).subscribe(
        _ds => {
          this.showLoader = false;
          // if (this.addOpenAIRE) return this.navigator.datasourceSubmitted(_ds.id);
            this.datasourceId = _ds['id'];
          return this.navigator.datasourceDashboard(this.providerId, this.datasourceId);
        },
        err => {
          this.showLoader = false;
          window.scrollTo(0, 0);
          this.errorMessage =
            (err?.status >= 500 && err?.status < 600)
              ? `Something went wrong. If the issue persists, please contact support and provide the following error code: ${err?.error?.traceId}`
              : `Something went bad, server responded: ${err?.error?.detail}`;
        }
      );
    }
}

  ngOnInit() {
    this.showLoader = true;
    const path = this.route.snapshot.routeConfig.path;

    this.resourceService.getAllVocabulariesByType().subscribe(vocabularies => {
      this.vocabularies = vocabularies as Map<string, Vocabulary[]>;
    });

    if (path.includes('view/:datasourceId')) {
      this.viewOnlyMode = true;
    }
    if ( !this.router.url.includes('/update/') || this.router.url.includes('/draft-datasource/update/')) {
      this.saveAsDraftAvailable = true;
    }
    this.addOpenAIRE = window.location.pathname.includes('addOpenAIRE');
    this.openaireId = this.route.snapshot.paramMap.get('openaireId');
    this.providerId = this.route.snapshot.paramMap.get('providerId');
    this.resourceId = this.route.snapshot.paramMap.get('resourceId');
    this.resourceService.getFormModelById('m-b-datasource').subscribe(
      suc => {
        this.model = suc; // Since you're only dealing with the getFormModelById response now
      },
      err => {
                this.errorMessage =
          (err?.status >= 500 && err?.status < 600)
            ? `Something went wrong. If the issue persists, please contact support and provide the following error code: ${err?.error?.traceId}`
            : `Something went bad while getting the data for page initialization: ${err?.error?.detail}`;
      },
      () => {
        if (!this.editMode) { //prefill field(s)
          this.payloadAnswer = {
            'answer': {
              datasource: {
                'type': "DataSource",
                'serviceId': decodeURIComponent(this.resourceId),
                'catalogueId': null,
                'resourceOwner': decodeURIComponent(this.providerId),
                'nodePID': (this.config.getProperty('nodePidFixed')) ? this.config.getProperty('nodePid') : null
              }
            }
          };
        }
        this.showLoader = false;
      }
    );

    if (this.route.snapshot.paramMap.get('datasourceId')) {
      this.datasourceId = this.route.snapshot.paramMap.get('datasourceId');
      this.resourceType = 'datasource';
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
    this.datasourceService.deleteDatasource(this.datasource.catalogueId).subscribe( // old deleteDatasourceWithoutAdminRights
      res => {},
      err => {
        this.showLoader = false;
        this.errorMessage = (err?.status >= 500 && err?.status < 600)
            ? `Something went wrong. If the issue persists, please contact support and provide the following error code: ${err?.error?.traceId}`
            : `Something went bad, server responded: ${err?.error?.detail}`;
        // return this.navigator.resourceDashboard(this.providerId, this.datasource.serviceId); // fixme: Datasource providerId -2test
      },
      () => {
        this.showLoader = false;
        // return this.navigator.resourceDashboard(this.providerId, this.datasource.serviceId); // fixme: Datasource providerId -2test
      }
    );
  }

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

  protected readonly environment = environment;
  protected readonly isDevMode = isDevMode;
}
