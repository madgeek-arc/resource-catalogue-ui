import {Component, ElementRef, OnInit, QueryList, ViewChildren} from '@angular/core';
import {ResourceService} from '../../services/resource.service';
import {ServiceProviderService} from '../../services/service-provider.service';
import {resourceStatusChangeMap, statusList} from '../../domain/resource-status-list';
import {
  DatasourceBundle,
  ServiceBundle,
  LoggingInfo,
  Provider,
  ProviderBundle,
  ResourceExtras,
  Type,
  Vocabulary
} from '../../domain/eic-model';
import {environment} from '../../../environments/environment';
import {mergeMap} from 'rxjs/operators';
import {AuthenticationService} from '../../services/authentication.service';
import {ActivatedRoute, Router} from '@angular/router';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {URLParameter} from '../../domain/url-parameter';
import {NavigationService} from '../../services/navigation.service';
import {PremiumSortFacetsPipe} from '../../shared/pipes/premium-sort.pipe';
import {statusChangeMap} from '../../domain/service-provider-status-list';
import {zip} from 'rxjs';
import {Paging} from '../../domain/paging';
import {ResourceExtrasService} from "../../services/resource-extras.service";
import {DatasourceService} from "../../services/datasource.service";

declare var UIkit: any;

@Component({
  selector: 'app-datasources-list',
  templateUrl: './datasources-list.component.html'
})
export class DatasourcesListComponent implements OnInit {
  url = environment.API_ENDPOINT;
  serviceORresource = environment.serviceORresource;

  formPrepare = {
    query: '',
    orderField: 'name',
    order: 'ASC',
    quantity: '10',
    from: '0',
    active: '',
    auditState: new FormArray([]),
    status: new FormArray([]),
    resource_organisation: new FormArray([]),
    catalogue_id: new FormArray([])
  };
  dataForm: FormGroup;

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
  extrasForm: FormGroup;

  urlParams: URLParameter[] = [];

  commentAuditControl = new FormControl();
  showSideAuditForm = false;
  showMainAuditForm = false;
  initLatestAuditInfo: LoggingInfo =  {date: '', userEmail: '', userFullName: '', userRole: '', type: '', comment: '', actionType: ''};

  errorMessage: string;
  loadingMessage = '';

  providers: ProviderBundle[] = [];
  selectedProvider: ProviderBundle;
  providersTotal: number;

  datasources: DatasourceBundle[] = [];
  datasourcesForAudit: DatasourceBundle[] = [];
  selectedDatasource: DatasourceBundle;
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
  providersDropdownForm: FormGroup;
  providersPage: Paging<Provider>;
  commentMoveControl = new FormControl();

  statusList = statusList;
  adminActionsMap = resourceStatusChangeMap;

  public auditStates: Array<string> = [
    'Valid', 'Not Audited', 'Invalid and updated', 'Invalid and not updated'
  ];

  public auditLabels: Array<string> = [
    'Valid', 'Not Audited', 'Invalid and updated', 'Invalid and not updated'
  ];

  @ViewChildren("auditCheckboxes") auditCheckboxes: QueryList<ElementRef>;

  public statuses: Array<string> = [
    'approved resource', 'pending resource', 'rejected resource'
  ];

  public labels: Array<string> = [
    `Approved`, `Pending`, `Rejected`
  ];

  @ViewChildren("checkboxes") checkboxes: QueryList<ElementRef>;

  researchCategoriesVoc: Vocabulary[] = null;
  semanticRelationshipVoc: Vocabulary[] = null;

  constructor(private resourceService: ResourceService,
              private datasourceService: DatasourceService,
              private serviceProviderService: ServiceProviderService,
              private resourceExtrasService: ResourceExtrasService,
              private authenticationService: AuthenticationService,
              private route: ActivatedRoute,
              private router: Router,
              private navigator: NavigationService,
              private fb: FormBuilder
  ) {
  }

  ngOnInit() {
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
                  const formArrayNew: FormArray = this.dataForm.get('status') as FormArray;
                  // formArrayNew = this.fb.array([]);
                  for (const status of params[i].split(',')) {
                    if (status !== '') {
                      formArrayNew.push(new FormControl(status));
                    }
                  }
                }

                foundStatus = true;
              } else if (i === 'resource_organisation') {

                if (this.dataForm.get('resource_organisation').value.length === 0) {
                  const formArrayNew: FormArray = this.dataForm.get('resource_organisation') as FormArray;
                  // formArrayNew = this.fb.array([]);
                  for (const resource_organisation of params[i].split(',')) {
                    if (resource_organisation !== '') {
                      formArrayNew.push(new FormControl(resource_organisation));
                    }
                  }
                }

              } else if (i === 'catalogue_id') {

                if (this.dataForm.get('catalogue_id').value.length === 0) {
                  const formArrayNew: FormArray = this.dataForm.get('catalogue_id') as FormArray;
                  // formArrayNew = this.fb.array([]);
                  for (const catalogue_id of params[i].split(',')) {
                    if (catalogue_id !== '') {
                      formArrayNew.push(new FormControl(catalogue_id));
                    }
                  }
                }

              } else if (i === 'auditState') {

                if (this.dataForm.get('auditState').value.length === 0) {
                  const formArrayNew: FormArray = this.dataForm.get('auditState') as FormArray;
                  // formArrayNew = this.fb.array([]);
                  for (const auditState of params[i].split(',')) {
                    if (auditState !== '') {
                      formArrayNew.push(new FormControl(auditState));
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
              const formArray: FormArray = this.dataForm.get('status') as FormArray;
              // formArray = this.fb.array([]);

              this.statuses.forEach(status => {
                formArray.push(new FormControl(status));
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

            this.getDatasources();
            this.getProviders();
            // this.handleChange();
          },
          error => this.errorMessage = <any>error
        );

      this.resourceService.getProvidersNames('approved').subscribe(suc => {
          this.providersPage = <Paging<Provider>>suc;
        },
        error => {
          this.errorMessage = 'Something went bad while getting the data for page initialization. ' + JSON.stringify(error.error.error);
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
    this.router.navigate([`/provider/datasource/all`], {queryParams: map});
    // this.getServices();
  }

  onSelectionChange(event: any, formControlName: string) {

    const formArray: FormArray = this.dataForm.get(formControlName) as FormArray;

    if (event.target.checked) {
      // Add a new control in the arrayForm
      formArray.push(new FormControl(event.target.value));
    } else {
      // find the unselected element
      let i = 0;
      formArray.controls.forEach((ctrl: FormControl) => {
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
    this.resourceService.getProviderBundles('0', '1000', 'name', 'ASC', '', null, null,[], [], [], []).subscribe(
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

  getDatasources() {
    this.loadingMessage = 'Loading Datasources';
    this.datasources = [];
    this.datasourceService.getDatasourceBundles(this.dataForm.get('from').value, this.dataForm.get('quantity').value,
      this.dataForm.get('orderField').value, this.dataForm.get('order').value, this.dataForm.get('query').value,
      this.dataForm.get('active').value, this.dataForm.get('resource_organisation').value,
      this.dataForm.get('status').value, this.dataForm.get('auditState').value, this.dataForm.get('catalogue_id').value).subscribe(
      res => {
        this.datasources = res['results'];
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
    this.loadingMessage = 'Loading ' + quantity + ' random Datasources';
    this.datasourcesForAudit = [];
    this.resourceService.getRandomResources(quantity).subscribe(
      res => {
        this.datasourcesForAudit = res['results'];
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
    const formArrayNew: FormArray = this.dataForm.get(category) as FormArray;
    if (e.target.checked) {
      this.addParameterToURL(category, value);
      formArrayNew.push(new FormControl(value));
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
    // this.getDatasources();
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


  showDeletionModal(datasource: DatasourceBundle) {
    this.selectedDatasource = datasource;
    if (this.selectedDatasource) {
      UIkit.modal('#deletionModal').show();
    }
  }

  showSendMailModal(datasource: DatasourceBundle) {
    this.selectedDatasource = datasource;
    if (this.selectedDatasource) {
      UIkit.modal('#sendMailModal').show();
    }
  }

  showMoveResourceModal(datasource: DatasourceBundle) {
    this.commentMoveControl.reset();
    this.selectedDatasource = datasource;
    if (this.selectedDatasource) {
      UIkit.modal('#moveResourceModal').show();
    }
  }

  deleteDatasource(id: string) {
    // UIkit.modal('#spinnerModal').show();
    this.datasourceService.deleteDatasource(id).subscribe(
      res => {},
      error => {
        // console.log(error);
        // UIkit.modal('#spinnerModal').hide();
        this.errorMessage = 'Something went bad. ' + error.error ;
        this.getDatasources();
      },
      () => {
        this.getDatasources();
        // UIkit.modal('#spinnerModal').hide();
      }
    );
  }

  /** resourceExtras--> **/
  toggleHorizontalService(datasource: DatasourceBundle) {
    UIkit.modal('#spinnerModal').show();
    this.resourceExtrasService.updateHorizontalService(datasource.id, 'datasource', datasource.datasource.catalogueId, !datasource?.resourceExtras?.horizontalService).subscribe(
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

  showResourceCategories(datasource: DatasourceBundle) {
    this.selectedDatasource = datasource;
    if (this.selectedDatasource) {
      this.extrasFormPrep(this.selectedDatasource);
      this.extrasForm.patchValue(this.selectedDatasource.resourceExtras);
      UIkit.modal('#researchCategoriesModal').show();
    }
  }

  showEoscIFGuidelines(datasource: DatasourceBundle) {
    this.selectedDatasource = datasource;
    if (this.selectedDatasource) {
      this.extrasFormPrep(this.selectedDatasource);
      this.extrasForm.patchValue(this.selectedDatasource.resourceExtras);
      UIkit.modal('#eoscIFGuidelinesModal').show();
    }
  }

  updateResearchCategories(datasource: DatasourceBundle) {
    UIkit.modal('#spinnerModal').show();
    this.resourceExtrasService.updateResearchCategories(datasource.id, 'datasource', datasource.datasource.catalogueId, this.extrasForm.value.researchCategories).subscribe(
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

  updateEoscIFGuidelines(datasource: DatasourceBundle) {
    UIkit.modal('#spinnerModal').show();
    this.resourceExtrasService.updateEoscIFGuidelines(datasource.id, 'datasource', datasource.datasource.catalogueId, this.extrasForm.value.eoscIFGuidelines).subscribe(
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

  extrasFormPrep(datasource: DatasourceBundle){
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
    if ( datasource?.resourceExtras?.researchCategories ) {
      for (let i = 0; i < datasource.resourceExtras.researchCategories.length - 1; i++) {
        this.push('researchCategories');
      }
    }
    if ( datasource?.resourceExtras?.eoscIFGuidelines ) {
      for (let i = 0; i < datasource.resourceExtras.eoscIFGuidelines.length - 1; i++) {
        this.pushEoscIFGuidelines();
      }
    }
  }
  /** <--resourceExtras **/

  /** eoscIFGuidelines--> **/
  newEoscIFGuidelines(): FormGroup {
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

  /** <--eoscIFGuidelines **/

  /** manage form arrays--> **/
  getFieldAsFormArray(field: string) {
    return this.extrasForm.get(field) as FormArray;
  }

  push(field: string) {
    this.getFieldAsFormArray(field).push(this.fb.control(''));
  }

  remove(field: string, i: number) {
    this.getFieldAsFormArray(field).removeAt(i);
  }

  /** <--manage form arrays **/

  toggleService(datasourceBundle: DatasourceBundle) {
    UIkit.modal('#spinnerModal').show();
    this.datasourceService.publishDatasource(datasourceBundle.id, datasourceBundle.datasource.version, !datasourceBundle.active).subscribe(
      res => {},
      error => {
        this.errorMessage = 'Something went bad. ' + error.error ;
        this.getDatasources();
        UIkit.modal('#spinnerModal').hide();
        // console.log(error);
      },
      () => {
        this.getDatasources();
        UIkit.modal('#spinnerModal').hide();
      }
    );
  }

  templateAction(id, active, status) {
    this.loadingMessage = '';
    UIkit.modal('#spinnerModal').show();
    const templateId = this.serviceTemplatePerProvider.filter(x => x.providerId === id)[0].serviceId;
    this.datasourceService.verifyDatasource(templateId, active, status).subscribe(
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

  moveResourceToProvider(datasourceId, providerId) {
    UIkit.modal('#spinnerModal').show();
    this.datasourceService.moveDatasourceToProvider(datasourceId, providerId, this.commentMoveControl.value).subscribe(
      res => {},
      error => {
        // console.log(error);
        UIkit.modal('#spinnerModal').hide();
        this.errorMessage = 'Something went bad. ' + error.error ;
        this.getDatasources();
      },
      () => {
        // this.getDatasources();
        UIkit.modal('#spinnerModal').hide();
        window.location.reload();
      }
    );
  }

  showAuditForm(view: string, datasource: DatasourceBundle) {
    this.commentAuditControl.reset();
    this.selectedDatasource = datasource;
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
    this.datasourceService.auditDatasource(this.selectedDatasource.id, action, this.commentAuditControl.value)
      .subscribe(
        res => {
          if (!this.showSideAuditForm) {
            this.getDatasources();
          }
        },
        err => { console.log(err); },
        () => {
          this.datasourcesForAudit.forEach(
            s => {
              if (s.id === this.selectedDatasource.id) {
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
    this.datasourceService.sendEmailForOutdatedDatasource(id).subscribe(
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

  editResourceInNewTab(providerId, datasourceId) {
    window.open(`/provider/${providerId}/datasource/update/${datasourceId}`, '_blank');
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
