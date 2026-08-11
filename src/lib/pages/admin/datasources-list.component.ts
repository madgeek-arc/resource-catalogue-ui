import {Component, ElementRef, OnInit, QueryList, ViewChildren} from '@angular/core';
import {ResourceService} from '../../services/resource.service';
import {ServiceProviderService} from '../../services/service-provider.service';
import {
  DatasourceBundle, LoggingInfo,
  Provider,
  ProviderBundle,
  Service,
  ServiceBundle,
  TrainingResourceBundle
} from '../../domain/eic-model';
import {ConfigService} from "../../services/config.service";
import {environment} from '../../../environments/environment';
import {AuthenticationService} from '../../services/authentication.service';
import {ActivatedRoute, Router} from '@angular/router';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {URLParameter} from '../../domain/url-parameter';
import {NavigationService} from '../../services/navigation.service';
import {DatasourceService} from "../../services/datasource.service";
import {pidHandler} from "../../shared/pid-handler/pid-handler.service";
import {Paging} from "../../domain/paging";
import {DeduplicationService, SimilarResource} from '../../services/deduplication.service';

declare let UIkit: any;

@Component({
    selector: 'app-datasources-list',
    templateUrl: './datasources-list.component.html',
    standalone: false
})

export class DatasourcesListComponent implements OnInit {
  url = environment.API_ENDPOINT;
  serviceORresource = environment.serviceORresource;

  sortUserSelected = false;
  readonly DEFAULT_SORT = 'name';

  formPrepare = {
    order: 'ASC',
    sort: this.DEFAULT_SORT,
    quantity: '10',
    from: '0',
    query: '',
    active: '',
    suspended: '',
    auditState: new UntypedFormArray([]),
    catalogue_id: new UntypedFormArray([]),
    service_id: new UntypedFormArray([]), //facets
    status: new UntypedFormArray([])
  };

  dataForm: UntypedFormGroup;

  urlParams: URLParameter[] = [];

  commentAuditControl = new UntypedFormControl();
  showSideAuditForm = false;
  showMainAuditForm = false;
  initLatestAuditInfo: LoggingInfo =  {date: '', userEmail: '', userFullName: '', userRole: '', type: '', comment: '', actionType: ''};
  datasourcesForAudit: DatasourceBundle[] = [];

  errorMessage: string;
  loadingMessage = '';

  providers: ProviderBundle[] = [];

  datasources: DatasourceBundle[] = [];
  selectedDatasourceId: string;
  selectedDatasource: DatasourceBundle;

  allDuplicateResults: SimilarResource[] = [];
  duplicateResults: SimilarResource[] = [];
  selectedDatasourceForDedup: DatasourceBundle = null;
  selectedDuplicate: SimilarResource = null;
  readonly duplicatesPageSize = 10;
  duplicatePage = 1;
  duplicatePageTotal = 0;
  duplicatePages: number[] = [];

  // serviceIdsOnView = [];
  servicesOnView = [];
  enrichedDatasources: DatasourceBundle[] = []; //ds bundles enriched with logo and name from service

  facets: any;
  searchFacet = '';

  total: number;
  // from = 0;
  // itemsPerPage = 10;
  currentPage = 1;
  pageTotal: number;
  pages: number[] = [];
  offset = 2;

  public auditStates: Array<string> = ['Valid', 'Not audited', 'Invalid and updated', 'Invalid and not updated'];
  public auditLabels: Array<string> = ['Valid', 'Not audited', 'Invalid and updated', 'Invalid and not updated'];
  @ViewChildren('auditCheckboxes') auditCheckboxes: QueryList<ElementRef>;

  public statuses: Array<string> = ['approved', 'pending', 'rejected'];
  public labels: Array<string> = [`Approved`, `Pending`, `Rejected`];
  providersPage: Paging<Provider>;

  @ViewChildren("checkboxes") checkboxes: QueryList<ElementRef>;

  constructor(private resourceService: ResourceService,
              private serviceProviderService: ServiceProviderService,
              private datasourceService: DatasourceService,
              private authenticationService: AuthenticationService,
              private route: ActivatedRoute,
              private router: Router,
              private navigator: NavigationService,
              private fb: UntypedFormBuilder,
              public pidHandler: pidHandler,
              public config: ConfigService,
              private deduplicationService: DeduplicationService,
  ) {
  }

  ngOnInit() {
    if (!this.authenticationService.isAdmin()) {
      this.router.navigateByUrl('/home');
    } else {
      this.dataForm = this.fb.group(this.formPrepare);

      this.dataForm.get('query').valueChanges.subscribe(val => {
        if (val && val !== '') {
          if (!this.sortUserSelected) {
            this.dataForm.get('sort').setValue('', { emitEvent: false }); // matches the Relevance option value
          }
        } else {
          this.sortUserSelected = false; // back to default behavior
          this.dataForm.get('sort').setValue(this.DEFAULT_SORT, { emitEvent: false }); // reset to default sort option
        }
      });

      this.urlParams = [];
      this.route.queryParams
        .subscribe(params => {

            let foundStatus = false;

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

              } else if (i === 'service_id') {
                if (this.dataForm.get('service_id').value.length === 0) {
                  const formArrayNew: UntypedFormArray = this.dataForm.get('service_id') as UntypedFormArray;
                  // formArrayNew = this.fb.array([]);
                  for (const service_id of params[i].split(',')) {
                    if (service_id !== '') {
                      formArrayNew.push(new UntypedFormControl(service_id));
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

            this.getDatasources();
            // this.handleChange();
          },
          error => this.errorMessage = <any>error
        );
    }

    this.getProviderNames();

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

  handleSortChange() {
    const sortValue = this.dataForm.get('sort').value;
    if (sortValue === '') {
      // User explicitly picked "Relevance"
      this.sortUserSelected = false;
      this.dataForm.get('sort').setValue('', { emitEvent: false });
    } else {
      this.sortUserSelected = true;
    }
    this.handleChangeAndResetPage();
  }

  isSearchActive(): boolean {
    const query = this.dataForm?.get('query')?.value;
    return query && query !== '';
  }

  getDatasources() {
    this.loadingMessage = 'Loading datasource entries...';
    this.datasources = [];

    // Send sort only if: no query, OR user explicitly picked a sort
    const query = this.dataForm.get('query').value;
    const hasQuery = query && query !== '';
    const shouldApplySort = !hasQuery || this.sortUserSelected;
    const sort = shouldApplySort ? this.dataForm.get('sort').value : null;
    const order = shouldApplySort ? this.dataForm.get('order').value : null;

    this.datasourceService.getDatasourceBundles(this.dataForm.get('from').value, this.dataForm.get('quantity').value,
      sort, order, query,
      this.dataForm.get('active').value, this.dataForm.get('suspended').value,
      this.dataForm.get('status').value, this.dataForm.get('catalogue_id').value, this.dataForm.get('service_id').value,
      this.dataForm.get('auditState').value).subscribe(
      res => {
        this.datasources = res['results'];
        this.facets = res['facets'];
        this.total = res['total'];
        this.paginationInit();
        this.enrichedDatasources = [];
        this.loadingMessage = '';
      },
      err => {
        console.log(err);
        this.errorMessage = 'The list could not be retrieved';
        this.loadingMessage = '';
      }
    );
  }

  showDeletionModal(id: string) {
    this.selectedDatasourceId = id;
    if (this.selectedDatasourceId) {
      UIkit.modal('#deletionModal').show();
    }
  }

  deleteDatasource(id: string) {
    // UIkit.modal('#spinnerModal').show();
    this.datasourceService.deleteDatasource(id).subscribe(
      res => {},
      err => {
        // UIkit.modal('#spinnerModal').hide();
        this.errorMessage = (err?.status >= 500 && err?.status < 600)
            ? `Something went wrong. If the issue persists, please contact support and provide the following error code: ${err?.error?.traceId}`
            : `Something went bad, server responded: ${err?.error?.detail}`;
        this.getDatasources();
      },
      () => {
        this.getDatasources();
        // UIkit.modal('#spinnerModal').hide();
      }
    );
  }

  suspendDatasource() {
    UIkit.modal('#spinnerModal').show();
    this.datasourceService.suspendDatasource(this.selectedDatasource.id, this.selectedDatasource.catalogueId, !this.selectedDatasource.suspended)
      .subscribe(
        res => {
          UIkit.modal('#suspensionModal').hide();
          location.reload();
        },
        err => {
          UIkit.modal('#suspensionModal').hide();
          UIkit.modal('#spinnerModal').hide();
          this.loadingMessage = '';
          this.errorMessage =
            (err?.status >= 500 && err?.status < 600)
              ? `Something went wrong. If the issue persists, please contact support and provide the following error code: ${err?.error?.traceId}`
              : `Something went bad, server responded: ${err?.error?.detail}`;
          window.scroll(0,0);
        },
        () => {
          UIkit.modal('#spinnerModal').hide();
          this.loadingMessage = '';
        }
      );
  }

  showSuspensionModal(bundle: DatasourceBundle) {
    this.selectedDatasource = bundle;
    if (this.selectedDatasource) {
      UIkit.modal('#suspensionModal').show();
    }
  }

  verifyDatasource(id: string, active: boolean, status: string){
    this.loadingMessage = '';
    UIkit.modal('#spinnerModal').show();
    this.datasourceService.verifyDatasource(id, active, status).subscribe(
      res => this.getDatasources(),
      err => UIkit.modal('#spinnerModal').hide(),
      () => {
        UIkit.modal('#spinnerModal').hide();
        location.reload();
      }
    );
  }

  /** for facets--> **/
  // isCatalogueChecked(value: string) {
  //   return this.dataForm.get('catalogue_id').value.includes(value);
  // }
  //
  // isServiceChecked(value: string) {
  //   return this.dataForm.get('service_id').value.includes(value);
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
    // this.getServices();
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
    // return this.navigator.resourcesList(map);  // problematic semicolon in url
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

  /** Pagination --> **/
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
  /** <--Pagination **/

  getProviderNames(){
    this.resourceService.getProvidersNames('approved').subscribe(suc => {
        this.providersPage = <Paging<Provider>>suc;
      },
      err => {
        this.errorMessage =
          (err?.status >= 500 && err?.status < 600)
            ? `Something went wrong. If the issue persists, please contact support and provide the following error code: ${err?.error?.traceId}`
            : `Something went bad while getting the data for page initialization: ${err?.error?.detail}`;
      },
      () => {
        this.providersPage.results.sort((a, b) => 0 - (a.name > b.name ? -1 : 1));
        // console.log(this.providersPage.results);
      }
    );
  }

  getProviderNameWithId(id: string) {
    return this.providersPage.results.find( x => x.id === id )?.name;
  }

  /** Audit --> **/
  showAuditForm(view: string, dsBundle: DatasourceBundle) {
    this.commentAuditControl.reset();
    this.selectedDatasource = dsBundle;
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
    this.datasourceService.auditDatasource(this.selectedDatasource.id, action, this.selectedDatasource.catalogueId, this.commentAuditControl.value)
      .subscribe(
        res => {
          if (!this.showSideAuditForm) {
            this.getDatasources();
          }
        },
        err => {
          this.errorMessage =
            (err?.status >= 500 && err?.status < 600)
              ? `Something went wrong. If the issue persists, please contact support and provide the following error code: ${err?.error?.traceId}`
              : `Something went bad, server responded: ${err?.error?.detail}`;
          window.scroll(0,0);
        },
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
  /** <-- Audit **/

  searchForDuplicates(bundle: DatasourceBundle) {
    if (!bundle?.id) {
      return;
    }
    this.errorMessage = '';
    this.allDuplicateResults = [];
    this.duplicateResults = [];
    this.selectedDuplicate = null;
    this.duplicatePage = 1;
    this.selectedDatasourceForDedup = bundle;

    UIkit.notification({
      message: 'Searching for duplicates...',
      status: 'primary',
      pos: 'top-center',
      timeout: 3000
    });

    this.deduplicationService.findDuplicates('datasource', bundle.id).subscribe({
      next: (similar) => {
        this.loadingMessage = '';
        const list = Array.isArray(similar) ? similar : [];
        if (list.length > 0) {
          this.allDuplicateResults = list;
          this.applyDuplicatePage(1);
          setTimeout(() => {
            UIkit.modal('#datasourceDuplicatesModal').show();
          }, 0);
        } else {
          UIkit.notification({
            message: 'No duplicate records found for this datasource.',
            status: 'success',
            pos: 'top-center',
            timeout: 4000
          });
        }
      },
      error: (err) => {
        this.loadingMessage = '';
        this.errorMessage = 'Something went bad. Server responded: ' + (err?.error?.detail || err?.message || 'unknown error');
        window.scroll(0, 0);
      }
    });
  }

  applyDuplicatePage(page: number) {
    const total = this.allDuplicateResults.length;
    this.duplicatePageTotal = Math.max(1, Math.ceil(total / this.duplicatesPageSize));
    this.duplicatePage = Math.min(Math.max(page, 1), this.duplicatePageTotal);
    const start = (this.duplicatePage - 1) * this.duplicatesPageSize;
    this.duplicateResults = this.allDuplicateResults.slice(start, start + this.duplicatesPageSize);
    this.duplicatePages = this.buildDuplicatePages();
  }

  buildDuplicatePages(): number[] {
    const pages: number[] = [];
    const total = this.duplicatePageTotal;
    const current = this.duplicatePage;
    const offset = 2;
    for (let i = Math.max(1, current - offset); i <= Math.min(total, current + offset); i++) {
      pages.push(i);
    }
    return pages;
  }

  goToDuplicatePage(page: number) {
    if (page < 1 || page > this.duplicatePageTotal || page === this.duplicatePage) {
      return;
    }
    this.applyDuplicatePage(page);
  }

  previousDuplicatePage() {
    this.goToDuplicatePage(this.duplicatePage - 1);
  }

  nextDuplicatePage() {
    this.goToDuplicatePage(this.duplicatePage + 1);
  }

  getDuplicateRangeLabel(): string {
    const total = this.allDuplicateResults.length;
    if (!total) {
      return '';
    }
    const from = (this.duplicatePage - 1) * this.duplicatesPageSize + 1;
    const to = Math.min(this.duplicatePage * this.duplicatesPageSize, total);
    return `Showing ${from}–${to} of ${total} match${total === 1 ? '' : 'es'}.`;
  }

  getDuplicateResource(item: SimilarResource): any {
    if (!item?.result) {
      return {};
    }
    return item.result.datasource || item.result;
  }

  getSimilarityPercent(score: number): number {
    if (score == null || isNaN(score)) {
      return 0;
    }
    return score <= 1 ? score * 100 : score;
  }

  getSimilarityLabelClass(score: number): string {
    const pct = this.getSimilarityPercent(score);
    if (pct >= 95) {
      return 'uk-label-danger';
    }
    if (pct >= 86) {
      return 'uk-label-warning';
    }
    if (pct >= 51) {
      return 'uk-label-primary';
    }
    return 'uk-label-success';
  }

  formatDuplicateValue(value: any): string {
    if (value == null || value === '') {
      return '';
    }
    if (Array.isArray(value)) {
      return value
        .map(v => {
          if (v == null) {
            return '';
          }
          if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
            return String(v);
          }
          if (v.researchProductLicenseName || v.researchProductLicenseURL) {
            return v.researchProductLicenseName || v.researchProductLicenseURL;
          }
          if (v.persistentIdentityEntityType) {
            return v.persistentIdentityEntityType;
          }
          if (v.value) {
            return String(v.value);
          }
          return JSON.stringify(v);
        })
        .filter(Boolean)
        .join(', ');
    }
    if (typeof value === 'object') {
      if (value.researchProductMetadataLicenseName || value.researchProductMetadataLicenseURL) {
        return value.researchProductMetadataLicenseName || value.researchProductMetadataLicenseURL;
      }
      return JSON.stringify(value);
    }
    return String(value);
  }

  openDuplicateDetail(item: SimilarResource) {
    this.selectedDuplicate = item;
    setTimeout(() => {
      UIkit.modal('#datasourceDuplicateDetailModal').show();
    }, 0);
  }

}
