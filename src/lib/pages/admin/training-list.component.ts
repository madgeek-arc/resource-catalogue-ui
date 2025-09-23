import {Component, ElementRef, OnInit, QueryList, ViewChildren} from '@angular/core';
import {ResourceService} from '../../services/resource.service';
import {ServiceProviderService} from '../../services/service-provider.service';
import {resourceStatusChangeMap, statusList} from '../../domain/resource-status-list';
import {
  TrainingResourceBundle,
  ServiceBundle,
  LoggingInfo,
  Provider,
  ProviderBundle,
  Type,
  Vocabulary
} from '../../domain/eic-model';
import {ConfigService} from "../../services/config.service";
import {environment} from '../../../environments/environment';
import {mergeMap} from 'rxjs/operators';
import {AuthenticationService} from '../../services/authentication.service';
import {ActivatedRoute, Router} from '@angular/router';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {URLParameter} from '../../domain/url-parameter';
import {NavigationService} from '../../services/navigation.service';
import {PremiumSortFacetsPipe} from '../../shared/pipes/premium-sort.pipe';
import {statusChangeMap} from '../../domain/service-provider-status-list';
import {zip} from 'rxjs';
import {Paging} from '../../domain/paging';
import {ResourceExtrasService} from "../../services/resource-extras.service";
import {TrainingResourceService} from "../../services/training-resource.service";
import {pidHandler} from "../../shared/pid-handler/pid-handler.service";

declare var UIkit: any;

@Component({
  selector: 'app-training-list',
  templateUrl: './training-list.component.html'
})
export class TrainingListComponent implements OnInit {
  catalogueConfigId: string | null = null;
  url = environment.API_ENDPOINT;
  serviceORresource = environment.serviceORresource;
  protected readonly environment = environment;

  formPrepare = {
    query: '',
    sort: 'title',
    order: 'ASC',
    quantity: '10',
    from: '0',
    active: '',
    suspended: '',
    auditState: new UntypedFormArray([]),
    status: new UntypedFormArray([]),
    resource_organisation: new UntypedFormArray([]),
    catalogue_id: new UntypedFormArray([])
  };
  dataForm: UntypedFormGroup;

  extrasFormPrepare = {
    researchCategories: this.fb.array([this.fb.control('')]),
    eoscIFGuidelines: this.fb.array([
      this.fb.group({
        label: [''],
        pid: [''],
        semanticRelationship: [''],
        url: ['']
      })
    ])
  };
  extrasForm: UntypedFormGroup;

  urlParams: URLParameter[] = [];

  commentAuditControl = new UntypedFormControl();
  showSideAuditForm = false;
  showMainAuditForm = false;
  initLatestAuditInfo: LoggingInfo =  {date: '', userEmail: '', userFullName: '', userRole: '', type: '', comment: '', actionType: ''};

  errorMessage: string;
  loadingMessage = '';

  providers: ProviderBundle[] = [];
  selectedProvider: ProviderBundle;
  providersTotal: number;

  trainingResourceBundles: TrainingResourceBundle[] = [];
  trainingResourcesForAudit: TrainingResourceBundle[] = [];
  selectedTrainingResource: TrainingResourceBundle;
  facets: any;
  searchFacet = '';

  total: number;
  currentPage = 1;
  pageTotal: number;
  pages: number[] = [];
  offset = 2;

  pendingFirstServicePerProvider: any[] = [];
  serviceTemplatePerProvider: any[] = [];

  providersFormPrepare = {
    resourceOrganisation: ''
  };
  providersDropdownForm: UntypedFormGroup;
  providersPage: Paging<Provider>;
  commentMoveControl = new UntypedFormControl();

  statusList = statusList;
  adminActionsMap = resourceStatusChangeMap;

  public auditStates: Array<string> = ['Valid', 'Not audited', 'Invalid and updated', 'Invalid and not updated'];
  public auditLabels: Array<string> = ['Valid', 'Not audited', 'Invalid and updated', 'Invalid and not updated'];

  @ViewChildren("auditCheckboxes") auditCheckboxes: QueryList<ElementRef>;

  public statuses: Array<string> = ['approved resource', 'pending resource', 'rejected resource'];
  public labels: Array<string> = [`Approved`, `Pending`, `Rejected`];

  @ViewChildren("checkboxes") checkboxes: QueryList<ElementRef>;

  researchCategoriesVoc: Vocabulary[] = null;
  semanticRelationshipVoc: Vocabulary[] = null;

  constructor(private resourceService: ResourceService,
              private trainingResourceService: TrainingResourceService,
              private serviceProviderService: ServiceProviderService,
              private resourceExtrasService: ResourceExtrasService,
              private authenticationService: AuthenticationService,
              private route: ActivatedRoute,
              private router: Router,
              private navigator: NavigationService,
              private fb: UntypedFormBuilder,
              public pidHandler: pidHandler,
              public config: ConfigService
  ) {
  }

  ngOnInit() {
    this.catalogueConfigId = this.config.getProperty('catalogueId');
    if (!this.authenticationService.getUserProperty('roles').some(x => x === 'ROLE_ADMIN' || x === 'ROLE_EPOT')) {
      this.router.navigateByUrl('/home');
    } else {
      this.dataForm = this.fb.group(this.formPrepare);
      this.providersDropdownForm = this.fb.group(this.providersFormPrepare);
      this.extrasForm = this.fb.group(this.extrasFormPrepare);

      this.urlParams = [];
      this.route.queryParams
        .subscribe(params => {

            let foundStatus = false;
            let foundState = false;

            for (const i in params) {
              if (i === 'status') {

                if (this.dataForm.get('status').value.length === 0) {
                  const formArrayNew: UntypedFormArray = this.dataForm.get('status') as UntypedFormArray;
                  // formArrayNew = this.fb.array([]);
                  for (const status of params[i].split(',')) {
                    if (status !== '') {
                      formArrayNew.push(new UntypedFormControl(status));
                    }
                  }
                }

                foundStatus = true;
              } else if (i === 'resource_organisation') {

                if (this.dataForm.get('resource_organisation').value.length === 0) {
                  const formArrayNew: UntypedFormArray = this.dataForm.get('resource_organisation') as UntypedFormArray;
                  // formArrayNew = this.fb.array([]);
                  for (const resource_organisation of params[i].split(',')) {
                    if (resource_organisation !== '') {
                      formArrayNew.push(new UntypedFormControl(resource_organisation));
                    }
                  }
                }

              } else if (i === 'catalogue_id') {

                if (this.dataForm.get('catalogue_id').value.length === 0) {
                  const formArrayNew: UntypedFormArray = this.dataForm.get('catalogue_id') as UntypedFormArray;
                  // formArrayNew = this.fb.array([]);
                  for (const catalogue_id of params[i].split(',')) {
                    if (catalogue_id !== '') {
                      formArrayNew.push(new UntypedFormControl(catalogue_id));
                    }
                  }
                }

              } else if (i === 'auditState') {

                if (this.dataForm.get('auditState').value.length === 0) {
                  const formArrayNew: UntypedFormArray = this.dataForm.get('auditState') as UntypedFormArray;
                  // formArrayNew = this.fb.array([]);
                  for (const auditState of params[i].split(',')) {
                    if (auditState !== '') {
                      formArrayNew.push(new UntypedFormControl(auditState));
                    }
                  }
                }

                foundState = true;
              } else {
                this.dataForm.get(i).setValue(params[i]);
              }
            }

            // if no status in URL, check all statuses by default
            if (!foundStatus) {
              const formArray: UntypedFormArray = this.dataForm.get('status') as UntypedFormArray;
              // formArray = this.fb.array([]);

              this.statuses.forEach(status => {
                formArray.push(new UntypedFormControl(status));
              });
            }

            for (const i in this.dataForm.controls) {
              if (this.dataForm.get(i).value) {
                const urlParam = new URLParameter();
                urlParam.key = i;
                urlParam.values = [this.dataForm.get(i).value];
                this.urlParams.push(urlParam);
              }
            }

            this.getResources();
            this.getProviders();
            // this.handleChange();
          },
          error => this.errorMessage = <any>error
        );

      this.resourceService.getProvidersNames('approved').subscribe(suc => {
          this.providersPage = <Paging<Provider>>suc;
        },
        error => {
          this.errorMessage = 'Something went bad while getting the data for page initialization. ' + JSON.stringify(error.error.message);
        },
        () => {
          this.providersPage.results.sort((a, b) => 0 - (a.name > b.name ? -1 : 1));
          // console.log(this.providersPage.results);
        }
      );

      this.getResearchCategoriesVoc();
      this.getSemanticRelationshipVoc();
    }
  }

  isStatusChecked(value: string) {
    return this.dataForm.get('status').value.includes(value);
  }

  handleChange() {
    this.urlParams = [];
    // const map: { [name: string]: string; } = {};
    for (const i in this.dataForm.controls) {
      // console.log('this.dataForm.get(i).value: ', this.dataForm.get(i).value);
      // if ((this.dataForm.get(i).value !== '') && (this.dataForm.get(i).value.length > 0)) {
      if ((this.dataForm.get(i).value !== '')) {
        const urlParam = new URLParameter();
        urlParam.key = i;
        urlParam.values = [this.dataForm.get(i).value];
        this.urlParams.push(urlParam);
        // map[i] = this.dataForm.get(i).value;
      }
    }

    const map: { [name: string]: string; } = { };
    for (const urlParameter of this.urlParams) {
      let concatValue = '';
      let counter = 0;
      for (const value of urlParameter.values) {
        if (counter !== 0) {
          concatValue += ',';
        }
        concatValue += value;
        counter++;
      }

      map[urlParameter.key] = concatValue;
    }

    // console.log('map', map);
    this.router.navigate([`/provider/training/all`], {queryParams: map});
    // this.getServices();
  }

  onSelectionChange(event: any, formControlName: string) {

    const formArray: UntypedFormArray = this.dataForm.get(formControlName) as UntypedFormArray;

    if (event.target.checked) {
      // Add a new control in the arrayForm
      formArray.push(new UntypedFormControl(event.target.value));
    } else {
      // find the unselected element
      let i = 0;
      formArray.controls.forEach((ctrl: UntypedFormControl) => {
        if (ctrl.value === event.target.value) {
          // Remove the unselected element from the arrayForm
          formArray.removeAt(i);
          return;
        }

        i++;
      });
    }

    this.handleChangeAndResetPage();
  }

  isAuditStateChecked(value: string) {
    return this.dataForm.get('auditState').value.includes(value);
  }

  handleChangeAndResetPage() {
    this.dataForm.get('from').setValue(0);
    this.handleChange();
  }

  getProviders() {
    this.providers = [];
    this.resourceService.getProviderBundles('0', '1000', 'name', 'ASC', '', null, null, [], [], [], []).subscribe(
      res => {
        this.providers = res['results'];
        this.providersTotal = res['total'];
      },
      err => {
        console.log(err);
        this.errorMessage = 'The list could not be retrieved';
      },
      () => {
        this.providers.forEach(
          p => {
            if (p.templateStatus === 'pending template') {
              this.resourceService.getResourceTemplateOfProvider(p.id).subscribe(
                res => {
                  if (res) {
                    this.serviceTemplatePerProvider.push({providerId: p.id, serviceId: JSON.parse(JSON.stringify(res)).id});
                  }
                }
              );
            }
          }
        );
      }
    );
  }

  getResources() {
    this.loadingMessage = 'Loading training resources';
    this.trainingResourceBundles = [];
    this.trainingResourceService.getResourceBundles(this.dataForm.get('from').value, this.dataForm.get('quantity').value,
      this.dataForm.get('sort').value, this.dataForm.get('order').value, this.dataForm.get('query').value,
      this.dataForm.get('active').value, this.dataForm.get('suspended').value, this.dataForm.get('resource_organisation').value,
      this.dataForm.get('status').value, this.dataForm.get('auditState').value, this.dataForm.get('catalogue_id').value).subscribe(
      res => {
        this.trainingResourceBundles = res['results'];
        this.facets = res['facets'];
        this.total = res['total'];
        this.paginationInit();
      },
      err => {
        console.log(err);
        this.errorMessage = 'The list could not be retrieved';
        this.loadingMessage = '';
      },
      () => {
        this.loadingMessage = '';
      }
    );
  }

  getRandomResources(quantity: string) {
    this.loadingMessage = 'Loading ' + quantity + ' random Training Resources';
    this.trainingResourcesForAudit = [];
    this.resourceService.getRandomResources(quantity).subscribe(
      res => {
        this.trainingResourcesForAudit = res['results'];
        // this.services = res['results'];
        // this.facets = res['facets'];
        // this.total = res['total'];
        // this.total = +quantity;
        // this.paginationInit();
      },
      err => {
        console.log(err);
        this.errorMessage = 'The list could not be retrieved';
        this.loadingMessage = '';
      },
      () => {
        this.loadingMessage = '';
      }
    );
  }

  isProviderActive(id: string) {
    let active = false;
    for (let i = 0; this.providers[i]; i++ ) {
      if (id === this.providers[i].id) {
        active = this.providers[i].active;
        break;
      }
    }
    return active;
  }

  /** for facets--> **/
  // isCatalogueChecked(value: string) {
  //   return this.dataForm.get('catalogue_id').value.includes(value);
  // }

  isChecked(value: string, category) {
    return this.dataForm.get(category).value.includes(value);
  }

  onSelection(e, category: string, value: string) {
    const formArrayNew: UntypedFormArray = this.dataForm.get(category) as UntypedFormArray;
    if (e.target.checked) {
      this.addParameterToURL(category, value);
      formArrayNew.push(new UntypedFormControl(value));
    } else {
      let categoryIndex = 0;
      for (const urlParameter of this.urlParams) {
        if (urlParameter.key === category) {
          const valueIndex = urlParameter.values.indexOf(value, 0);
          if (valueIndex > -1) {
            urlParameter.values.splice(valueIndex, 1);
            if (urlParameter.values.length === 0) {
              this.urlParams.splice(categoryIndex, 1);
            }
          }
          const formArrayIndex = formArrayNew.value.indexOf(value, 0);
          if (formArrayIndex > -1 ) {
            formArrayNew.removeAt(formArrayIndex);
          }
        }
        categoryIndex++;
      }
    }
    // this.getResources();
    return this.navigateUsingParameters();
  }

  private addParameterToURL(category: string, value: string) {
    let foundCategory = false;
    for (const urlParameter of this.urlParams) {
      if (urlParameter.key === category) {
        foundCategory = true;
        const valueIndex = urlParameter.values.indexOf(value, 0);
        if (valueIndex < 0) {
          urlParameter.values.push(value);
          this.updatePagingURLParameters(0);
        }
      }
    }
    if (!foundCategory) {
      this.updatePagingURLParameters(0);
      const newParameter: URLParameter = {
        key: category,
        values: [value]
      };
      this.urlParams.push(newParameter);
    }
  }

  navigateUsingParameters() {
    const map: { [name: string]: string; } = {};
    for (const urlParameter of this.urlParams) {
      map[urlParameter.key] = urlParameter.values.join(',');
    }
    this.handleChange();
    // return this.navigator.resourcesList(map);  // problematic semi-colon in url
  }

  updatePagingURLParameters(from: number) {
    let foundFromCategory = false;
    for (const urlParameter of this.urlParams) {
      if (urlParameter.key === 'from') {
        foundFromCategory = true;
        urlParameter.values = [];
        urlParameter.values.push(from + '');
        break;
      }
    }
    if (!foundFromCategory) {
      const newFromParameter: URLParameter = {
        key: 'from',
        values: [from + '']
      };
      this.urlParams.push(newFromParameter);
    }
  }
  /** <--for facets **/


  showDeletionModal(trBundle: TrainingResourceBundle) {
    this.selectedTrainingResource = trBundle;
    if (this.selectedTrainingResource) {
      UIkit.modal('#deletionModal').show();
    }
  }

  showSuspensionModal(trBundle: TrainingResourceBundle) {
    this.selectedTrainingResource = trBundle;
    if (this.selectedTrainingResource) {
      UIkit.modal('#suspensionModal').show();
    }
  }

  showSendMailModal(trBundle: TrainingResourceBundle) {
    this.selectedTrainingResource = trBundle;
    if (this.selectedTrainingResource) {
      UIkit.modal('#sendMailModal').show();
    }
  }

  showMoveResourceModal(trBundle: TrainingResourceBundle) {
    this.commentMoveControl.reset();
    this.selectedTrainingResource = trBundle;
    if (this.selectedTrainingResource) {
      UIkit.modal('#moveResourceModal').show();
    }
  }

  deleteTrainingResource(id: string) {
    // UIkit.modal('#spinnerModal').show();
    this.trainingResourceService.deleteTrainingResource(id).subscribe(
      res => {},
      error => {
        // console.log(error);
        // UIkit.modal('#spinnerModal').hide();
        this.errorMessage = 'Something went bad. ' + error.error ;
        this.getResources();
      },
      () => {
        this.getResources();
        // UIkit.modal('#spinnerModal').hide();
      }
    );
  }

  suspendTrainingResource() {
    UIkit.modal('#spinnerModal').show();
    this.trainingResourceService.suspendTrainingResource(this.selectedTrainingResource.id, this.selectedTrainingResource.trainingResource.catalogueId, !this.selectedTrainingResource.suspended)
      .subscribe(
        res => {
          UIkit.modal('#suspensionModal').hide();
          location.reload();
          // this.getResources();
        },
        err => {
          UIkit.modal('#suspensionModal').hide();
          UIkit.modal('#spinnerModal').hide();
          this.loadingMessage = '';
          this.errorMessage = err.error.error;
          window.scroll(0,0);
        },
        () => {
          UIkit.modal('#spinnerModal').hide();
          this.loadingMessage = '';
        }
      );
  }

  /** resourceExtras--> **/
  /*toggleHorizontalService(trBundle: TrainingResourceBundle) {
    UIkit.modal('#spinnerModal').show();
    this.resourceExtrasService.updateHorizontalService(trBundle.id, 'training_resource', trBundle.trainingResource.catalogueId, !trBundle?.resourceExtras?.horizontalService).subscribe(
      res => {},
      err => {
        UIkit.modal('#spinnerModal').hide();
        console.log(err)
      },
      () => {
        UIkit.modal('#spinnerModal').hide();
        location.reload();
      }
    );
  }

  showResourceCategories(trBundle: TrainingResourceBundle) {
    this.selectedTrainingResource = trBundle;
    if (this.selectedTrainingResource) {
      this.extrasFormPrep(this.selectedTrainingResource);
      this.extrasForm.patchValue(this.selectedTrainingResource.resourceExtras);
      UIkit.modal('#researchCategoriesModal').show();
    }
  }

  showEoscIFGuidelines(trBundle: TrainingResourceBundle) {
    this.selectedTrainingResource = trBundle;
    if (this.selectedTrainingResource) {
      this.extrasFormPrep(this.selectedTrainingResource);
      this.extrasForm.patchValue(this.selectedTrainingResource.resourceExtras);
      UIkit.modal('#eoscIFGuidelinesModal').show();
    }
  }

  updateResearchCategories(trBundle: TrainingResourceBundle) {
    UIkit.modal('#spinnerModal').show();
    this.resourceExtrasService.updateResearchCategories(trBundle.id, 'training_resource', trBundle.trainingResource.catalogueId, this.extrasForm.value.researchCategories).subscribe(
      res => {},
      err => {
        UIkit.modal('#spinnerModal').hide();
        console.log(err);
      },
      () => {
        UIkit.modal('#spinnerModal').hide();
        location.reload();
      }
    );
  }

  updateEoscIFGuidelines(trBundle: TrainingResourceBundle) {
    UIkit.modal('#spinnerModal').show();
    this.resourceExtrasService.updateEoscIFGuidelines(trBundle.id, 'training_resource', trBundle.trainingResource.catalogueId, this.extrasForm.value.eoscIFGuidelines).subscribe(
      res => {},
      err => {
        UIkit.modal('#spinnerModal').hide();
        console.log(err);
      },
      () => {
        UIkit.modal('#spinnerModal').hide();
        location.reload();
      }
    );
  }

  extrasFormPrep(trBundle: TrainingResourceBundle){
    //resets the 2 parts of the form and then fills them
    this.extrasForm.setControl('researchCategories', this.fb.array([this.fb.control('')]));
    this.extrasForm.setControl('eoscIFGuidelines',
      this.fb.array([this.fb.group({
        label: [''],
        pid: [''],
        semanticRelationship: [''],
        url: ['']
      })
      ]));
    if ( trBundle?.resourceExtras?.researchCategories ) {
      for (let i = 0; i < trBundle.resourceExtras.researchCategories.length - 1; i++) {
        this.push('researchCategories');
      }
    }
    if ( trBundle?.resourceExtras?.eoscIFGuidelines ) {
      for (let i = 0; i < trBundle.resourceExtras.eoscIFGuidelines.length - 1; i++) {
        this.pushEoscIFGuidelines();
      }
    }
  }*/
  /** <--resourceExtras **/

  /** eoscIFGuidelines--> **/
  /*newEoscIFGuidelines(): FormGroup {
    return this.fb.group({
      label: [''],
      pid: [''],
      semanticRelationship: [''],
      url: ['']
    });
  }

  get eoscIFGuidelinesArray() {
    return this.extrasForm.get('eoscIFGuidelines') as FormArray;
  }

  pushEoscIFGuidelines() {
    this.eoscIFGuidelinesArray.push(this.newEoscIFGuidelines());
  }

  removeEoscIFGuidelines(index: number) {
    this.eoscIFGuidelinesArray.removeAt(index);
  }
*/
  /** <--eoscIFGuidelines **/

  /** manage form arrays--> **/
  getFieldAsFormArray(field: string) {
    return this.extrasForm.get(field) as UntypedFormArray;
  }

  push(field: string) {
    this.getFieldAsFormArray(field).push(this.fb.control(''));
  }

  remove(field: string, i: number) {
    this.getFieldAsFormArray(field).removeAt(i);
  }

  /** <--manage form arrays **/

  toggleService(trBundle: TrainingResourceBundle) {
    UIkit.modal('#spinnerModal').show();
    this.trainingResourceService.publishTrainingResource(trBundle.id, !trBundle.active).subscribe(
      res => {},
      error => {
        this.errorMessage = 'Something went bad. ' + error.error ;
        this.getResources();
        UIkit.modal('#spinnerModal').hide();
        // console.log(error);
      },
      () => {
        this.getResources();
        UIkit.modal('#spinnerModal').hide();
      }
    );
  }

  templateAction(id, active, status) {
    this.loadingMessage = '';
    UIkit.modal('#spinnerModal').show();
    this.trainingResourceService.verifyTrainingResource(id, active, status).subscribe(
      res => {
        this.getProviders();
      },
      err => {
        UIkit.modal('#spinnerModal').hide();
        console.log(err);
      },
      () => {
        UIkit.modal('#spinnerModal').hide();
        location.reload();
      }
    );
  }

  moveResourceToProvider(trainingResourceId, providerId) {
    UIkit.modal('#spinnerModal').show();
    this.trainingResourceService.moveTrainingResourceToProvider(trainingResourceId, providerId, this.commentMoveControl.value).subscribe(
      res => {},
      error => {
        // console.log(error);
        UIkit.modal('#spinnerModal').hide();
        this.errorMessage = 'Something went bad. ' + error.error ;
        this.getResources();
      },
      () => {
        // this.getResources();
        UIkit.modal('#spinnerModal').hide();
        window.location.reload();
      }
    );
  }

  showAuditForm(view: string, trBundle: TrainingResourceBundle) {
    this.commentAuditControl.reset();
    this.selectedTrainingResource = trBundle;
    if (view === 'side') {
      this.showSideAuditForm = true;
    } else if (view === 'main') {
      this.showMainAuditForm = true;
    }
  }

  resetAuditView() {
    this.showSideAuditForm = false;
    this.showMainAuditForm = false;
    this.commentAuditControl.reset();
  }

  auditResourceAction(action: string) {
    this.trainingResourceService.auditTrainingResource(this.selectedTrainingResource.id, action, this.selectedTrainingResource.trainingResource.catalogueId, this.commentAuditControl.value)
      .subscribe(
        res => {
          if (!this.showSideAuditForm) {
            this.getResources();
          }
        },
        err => { console.log(err); },
        () => {
          this.trainingResourcesForAudit.forEach(
            s => {
              if (s.id === this.selectedTrainingResource.id) {
                s.latestAuditInfo = this.initLatestAuditInfo;
                s.latestAuditInfo.date = Date.now().toString();
                s.latestAuditInfo.actionType = action;
              }
            }
          );
          this.resetAuditView();
        }
      );
  }

  sendMailForUpdate(id: string) {
    this.trainingResourceService.sendEmailForOutdatedTrainingResource(id).subscribe(
      res => {},
      err => { console.log(err); }
    );
  }

  hasCreatedFirstService(id: string) {
    return this.pendingFirstServicePerProvider.some(x => x.providerId === id);
  }

  getLinkToFirstService(id: string) {
    if (this.hasCreatedFirstService(id)) {
      return '/service/' + this.pendingFirstServicePerProvider.filter(x => x.providerId === id)[0].serviceId;
    } else {
      return '/provider/' + id + '/add-first-service';
    }
  }

  getLinkToEditFirstService(id: string) {
    return '/edit/' + this.pendingFirstServicePerProvider.filter(x => x.providerId === id)[0].serviceId;
  }

  editResourceInNewTab(providerId, trainingResourceId) {
    window.open(`/provider/${providerId}/training-resource/update/${trainingResourceId}`, '_blank');
  }

  paginationInit() {
    let addToEndCounter = 0;
    let addToStartCounter = 0;
    this.pages = [];
    this.currentPage = (this.dataForm.get('from').value / (this.dataForm.get('quantity').value)) + 1;
    this.pageTotal = Math.ceil(this.total / (this.dataForm.get('quantity').value));
    for ( let i = (+this.currentPage - this.offset); i < (+this.currentPage + 1 + this.offset); ++i ) {
      if ( i < 1 ) { addToEndCounter++; }
      if ( i > this.pageTotal ) { addToStartCounter++; }
      if ((i >= 1) && (i <= this.pageTotal)) {
        this.pages.push(i);
      }
    }
    for ( let i = 0; i < addToEndCounter; ++i ) {
      if (this.pages.length < this.pageTotal) {
        this.pages.push(this.pages.length + 1);
      }
    }
    for ( let i = 0; i < addToStartCounter; ++i ) {
      if (this.pages[0] > 1) {
        this.pages.unshift(this.pages[0] - 1 );
      }
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.dataForm.get('from').setValue((this.currentPage - 1) * (+this.dataForm.get('quantity').value));
    this.handleChange();
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.dataForm.get('from').setValue(+this.dataForm.get('from').value - +this.dataForm.get('quantity').value);
      this.handleChange();
    }
  }

  nextPage() {
    if (this.currentPage < this.pageTotal) {
      this.currentPage++;
      this.dataForm.get('from').setValue(+this.dataForm.get('from').value + +this.dataForm.get('quantity').value);
      this.handleChange();
    }
  }

  DownloadProvidersCSV() {
    window.open(this.url + '/exportToCSV/providers', '_blank');
  }

  DownloadServicesCSV() {
    window.open(this.url + '/exportToCSV/services', '_blank');
  }

  getProviderNameWithId(id: string) {
    return this.providersPage.results.find( x => x.id === id )?.name;
  }

  getProviderNamesWithIds(idsArray: string[]) {
    let namesArray = [];
    if (idsArray) {
      for (let i=0; i<idsArray.length; i++) {
        namesArray.push(this.providersPage.results.find( x => x.id == idsArray[i] )?.name);
      }
    }
    return namesArray;
  }

  getResearchCategoriesVoc() {
    this.resourceService.getVocabularyByType('RESEARCH_CATEGORY').subscribe(
      suc => this.researchCategoriesVoc = suc
    );
  }

  getSemanticRelationshipVoc() {
    this.resourceService.getVocabularyByType('SEMANTIC_RELATIONSHIP').subscribe(
      suc => this.semanticRelationshipVoc = suc
    );
  }

}
