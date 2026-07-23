import {Component, ElementRef, OnInit, QueryList, ViewChildren} from '@angular/core';
import {ResourceService} from '../../services/resource.service';
import {ServiceProviderService} from '../../services/service-provider.service';
import {resourceStatusChangeMap, statusList} from '../../domain/resource-status-list';
import {
  ServiceBundle,
  LoggingInfo,
  Provider,
  ProviderBundle,
  Vocabulary,
  Service
} from '../../domain/eic-model';
import {ConfigService} from "../../services/config.service";
import {environment} from '../../../environments/environment';
import {AuthenticationService} from '../../services/authentication.service';
import {ActivatedRoute, Router} from '@angular/router';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {URLParameter} from '../../domain/url-parameter';
import {NavigationService} from '../../services/navigation.service';
import {Paging} from '../../domain/paging';
import {ServiceExtensionsService} from '../../services/service-extensions.service';
import {pidHandler} from "../../shared/pid-handler/pid-handler.service";
import {DeduplicationService} from "../../services/deduplication.service";

declare let UIkit: any;

@Component({
    selector: 'app-resources-list',
    templateUrl: './resources-list.component.html',
    standalone: false
})
export class ResourcesListComponent implements OnInit {
  url = environment.API_ENDPOINT;
  serviceORresource = environment.serviceORresource;
  protected readonly environment = environment;

  sortUserSelected = false;
  readonly DEFAULT_SORT = 'name';

  formPrepare = {
    query: '',
    sort: this.DEFAULT_SORT,
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

  urlParams: URLParameter[] = [];

  commentAuditControl = new UntypedFormControl();
  showSideAuditForm = false;
  showMainAuditForm = false;
  initLatestAuditInfo: LoggingInfo =  {date: '', userEmail: '', userFullName: '', userRole: '', type: '', comment: '', actionType: ''};

  errorMessage: string;
  loadingMessage = '';
  offCanvasMessage = '';

  providers: ProviderBundle[] = [];
  selectedProvider: ProviderBundle;
  providersTotal: number;

  services: ServiceBundle[] = new Array<ServiceBundle>();
  servicesForAudit: ServiceBundle[] = [];
  selectedService: ServiceBundle;
  facets: any;
  searchFacet = '';

  numberOfServicesOnView: number;
  statusesOnView: {serviceId: string, status: string}[];

  total: number;
  currentPage = 1;
  pageTotal: number;
  pages: number[] = [];
  offset = 2;

  pendingFirstServicePerProvider: any[] = [];
  serviceTemplatePerProvider: any[] = [];

  providersFormPrepare = {
    resourceOwner: ''
  };
  providersDropdownForm: UntypedFormGroup;
  providersPage: Paging<Provider>;
  commentMoveControl = new UntypedFormControl();

  statusList = statusList;
  adminActionsMap = resourceStatusChangeMap;

  public auditStates: Array<string> = ['Valid', 'Not audited', 'Invalid and updated', 'Invalid and not updated'];
  public auditLabels: Array<string> = ['Valid', 'Not audited', 'Invalid and updated', 'Invalid and not updated'];
  @ViewChildren('auditCheckboxes') auditCheckboxes: QueryList<ElementRef>;

  public statuses: Array<string> = ['approved', 'pending', 'rejected'];
  public labels: Array<string> = [`Approved`, `Pending`, `Rejected`];

  @ViewChildren('checkboxes') checkboxes: QueryList<ElementRef>;

  constructor(private resourceService: ResourceService,
              private providerService: ServiceProviderService,
              private authenticationService: AuthenticationService,
              private route: ActivatedRoute,
              private router: Router,
              private navigator: NavigationService,
              private fb: UntypedFormBuilder,
              private serviceExtensionsService: ServiceExtensionsService,
              public pidHandler: pidHandler,
              public config: ConfigService,
              public deduplicationService: DeduplicationService
  ) {
  }

  ngOnInit() {
    if (!this.authenticationService.isAdmin()) {
      this.router.navigateByUrl('/home');
    } else {
      this.dataForm = this.fb.group(this.formPrepare);
      this.providersDropdownForm = this.fb.group(this.providersFormPrepare);

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
    this.router.navigate([`/provider/resource/all`], {queryParams: map});
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
                    console.log(res);
                    this.serviceTemplatePerProvider.push({providerId: p.id, serviceId: JSON.parse(JSON.stringify(res)).id});
                    console.log(this.serviceTemplatePerProvider)
                  }
                }
              );
            }
          }
        );
      }
    );
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

  getResources() {
    this.loadingMessage = 'Loading ' + this.serviceORresource + 's...';
    this.services = [];

    // Send sort only if: no query, OR user explicitly picked a sort
    const query = this.dataForm.get('query').value;
    const hasQuery = query && query !== '';
    const shouldApplySort = !hasQuery || this.sortUserSelected;
    const sort = shouldApplySort ? this.dataForm.get('sort').value : null;
    const order = shouldApplySort ? this.dataForm.get('order').value : null;

    this.resourceService.getResourceBundles(
      this.dataForm.get('from').value,
      this.dataForm.get('quantity').value,
      sort,
      order,
      query,
      this.dataForm.get('active').value,
      this.dataForm.get('suspended').value,
      this.dataForm.get('resource_organisation').value,
      this.dataForm.get('status').value,
      this.dataForm.get('auditState').value,
      this.dataForm.get('catalogue_id').value).subscribe(
      res => {
        this.services = res['results'];
        this.facets = res['facets'];
        this.total = res['total'];
        this.numberOfServicesOnView = res['to']-res['from'];
        this.paginationInit();
      },
      err => {
        console.log(err);
        this.errorMessage = 'The list could not be retrieved';
        this.loadingMessage = '';
      },
      () => {
        this.loadingMessage = '';
        this.statusesOnView = [];
        for(let i = 0; i < this.numberOfServicesOnView; i++) {
          this.statusesOnView.push({serviceId: '', status: ''});
        }
        for (let i = 0; i < this.numberOfServicesOnView; i++) {
          this.serviceExtensionsService.getMonitoringStatus(this.services[i].id).subscribe(
            monitoringStatus => {
              this.statusesOnView[i].serviceId = this.services[i].id;
              if(monitoringStatus) { this.statusesOnView[i].status = monitoringStatus[0].value }
              else {  this.statusesOnView[i].status = 'NA' } //no response hence Not Available status (NA)
              },
            err => { this.errorMessage = 'An error occurred while retrieving data for a service. ' + err.error; }
          );
        }
      }
    );
  }

  getRandomResources(quantity: string) {
    this.offCanvasMessage = '';
    this.loadingMessage = 'Loading ' + quantity + ' random ' + this.serviceORresource + 's...';
    this.servicesForAudit = [];
    this.resourceService.getRandomResources(quantity).subscribe(
      res => {
        this.servicesForAudit = res['results'];
        // this.services = res['results'];
        // this.facets = res['facets'];
        // this.total = res['total'];
        // this.total = +quantity;
        // this.paginationInit();
      },
      err => {
        console.log(err);
        this.loadingMessage = '';
        this.offCanvasMessage = 'The list could not be retrieved';
      },
      () => {
        this.loadingMessage = '';
        if (this.servicesForAudit.length === 0) {
          this.offCanvasMessage = 'No resources found.';
        }
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


  showDeletionModal(bundle: ServiceBundle) {
    this.selectedService = bundle;
    if (this.selectedService) {
      UIkit.modal('#deletionModal').show();
    }
  }

  showSuspensionModal(bundle: ServiceBundle) {
    this.selectedService = bundle;
    if (this.selectedService) {
      UIkit.modal('#suspensionModal').show();
    }
  }

  showSendMailModal(bundle: ServiceBundle) {
    this.selectedService = bundle;
    if (this.selectedService) {
      UIkit.modal('#sendMailModal').show();
    }
  }

  showMoveResourceModal(bundle: ServiceBundle) {
    this.commentMoveControl.reset();
    this.selectedService = bundle;
    if (this.selectedService) {
      UIkit.modal('#moveResourceModal').show();
    }
  }

  deleteService(bundle: ServiceBundle) {
    // UIkit.modal('#spinnerModal').show();
    this.resourceService.deleteService(bundle.id).subscribe(
      res => {},
      err => {
        // UIkit.modal('#spinnerModal').hide();
        this.errorMessage = (err?.status >= 500 && err?.status < 600)
            ? `Something went wrong. If the issue persists, please contact support and provide the following error code: ${err?.error?.traceId}`
            : `Something went bad, server responded: ${err?.error?.detail}`;
        this.getResources();
      },
      () => {
        this.getResources();
        // UIkit.modal('#spinnerModal').hide();
      }
    );
  }

  suspendService() {
    UIkit.modal('#spinnerModal').show();
    this.resourceService.suspendService(this.selectedService.id, this.selectedService.catalogueId, !this.selectedService.suspended)
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

  toggleService(bundle: ServiceBundle) {
    if (bundle.status === 'pending' || bundle.status === 'rejected') {
      this.errorMessage = `You cannot activate a ${bundle.status}.`;
      window.scrollTo(0, 0);
      return;
    }
    UIkit.modal('#spinnerModal').show();
    this.providerService.activateService(bundle.id, bundle.service.version, !bundle.active).subscribe(
      res => {},
      error => {
        UIkit.modal('#spinnerModal').hide();
        this.errorMessage = 'Something went bad. ' + error.error.detail ;
      },
      () => {
        UIkit.modal('#spinnerModal').hide();
        this.getResources();
      }
    );
  }

  templateAction(serviceBundle, active, status) {
    this.loadingMessage = '';
    UIkit.modal('#spinnerModal').show();
    console.log(serviceBundle.service.resourceOwner);
    const providerId = serviceBundle.service.resourceOwner;
    const templateId = this.serviceTemplatePerProvider.filter(x => x.providerId === providerId)[0].serviceId;
    this.resourceService.verifyResource(templateId, active, status).subscribe(
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

  moveResourceToProvider(serviceBundle, providerId) {
    UIkit.modal('#spinnerModal').show();
    this.resourceService.moveResourceToProvider(serviceBundle.id, providerId, this.commentMoveControl.value).subscribe(
      res => {
      },
      error => {
        // console.log(error);
        UIkit.modal('#spinnerModal').hide();
        this.errorMessage = 'Something went bad. ' + error.error;
        this.getResources();
      },
      () => {
        UIkit.modal('#spinnerModal').hide();
        window.location.reload();
      }
    );
  }

  showAuditForm(view: string, resource: ServiceBundle) {
    this.commentAuditControl.reset();
    this.selectedService = resource;
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

  auditResourceAction(action: string, bundle: ServiceBundle) {
    this.resourceService.auditService(this.selectedService.id, action, this.selectedService.catalogueId, this.commentAuditControl.value)
      .subscribe(
        res => {
          if (!this.showSideAuditForm) {
            this.getResources();
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
          this.servicesForAudit.forEach(
            s => {
              if (s.id === this.selectedService.id) {
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

  sendMailForUpdate(serviceBundle) {
    this.resourceService.sendEmailForOutdatedResource(serviceBundle.id).subscribe(
      res => {}, err => { console.log(err); }
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

  editResourceInNewTab(providerId, resourceId) {
    window.open(`/provider/${providerId}/resource/update/${resourceId}`, '_blank');
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
    const namesArray = [];
    if (idsArray) {
      for (let i=0; i<idsArray.length; i++) {
        namesArray.push(this.providersPage.results.find( x => x.id == idsArray[i] )?.name);
      }
    }
    return namesArray;
  }

  // getServiceMonitoringStatusWithId(id: string) {
  //   return this.providersPage.results.find( x => x.id === id )?.legalStatus;
  // }

  // getCurrentMonitoringStatus(serviceId: string, i: number){
  //   this.serviceExtensionsService.getMonitoringStatus(serviceId).subscribe(
  //     monitoringStatus => { this.currentMonitoringStatus = monitoringStatus[0].value },
  //     err => { this.errorMessage = 'An error occurred while retrieving data for this service. ' + err.error; },
  //     // () => {console.log(this.currentMonitoringStatus)}
  //   );
  // }

  searchForDuplicates(id: string) {
    this.loadingMessage = 'Searching...';
    this.deduplicationService.findDuplicates('service', id).subscribe(
      res => {
        //if duplicates exist show them on a uikit modal (similar to this #dupWarningModal)
        //else if there are no duplicates display a uikit notification
        this.loadingMessage = '';
      },
      err => {
        this.loadingMessage = '';
        this.errorMessage = 'Something went bad. Server responded: ' + err.error.detail;
      }
    )
  }
}
