import {Component, ElementRef, OnInit, QueryList, ViewChildren} from '@angular/core';
import {ProviderBundle, Adapter, AdapterBundle, LoggingInfo} from '../../domain/eic-model';
import {environment} from '../../../environments/environment';
import {AuthenticationService} from '../../services/authentication.service';
import {ActivatedRoute, Router} from '@angular/router';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {URLParameter} from '../../domain/url-parameter';
import {NavigationService} from '../../services/navigation.service';
import {pidHandler} from "../../shared/pid-handler/pid-handler.service";
import {AdaptersService} from "../../services/adapters.service";

declare var UIkit: any;

@Component({
  selector: 'app-adapters-list',
  templateUrl: './adapters-list.component.html'
})
export class AdaptersListComponent implements OnInit {
  url = environment.API_ENDPOINT;
  serviceORresource = environment.serviceORresource;
  CATALOGUE = environment.CATALOGUE;

  formPrepare = {
    order: 'ASC',
    sort: 'name',
    quantity: '10',
    from: '0',
    query: '',
    active: '',
    suspended: '',
    auditState: new UntypedFormArray([]),
    catalogue_id: new UntypedFormArray([]),
    provider_id: new UntypedFormArray([]),
    status: ''
  };

  dataForm: UntypedFormGroup;

  urlParams: URLParameter[] = [];

  commentAuditControl = new UntypedFormControl();
  showMainAuditForm = false;
  initLatestAuditInfo: LoggingInfo =  {date: '', userEmail: '', userFullName: '', userRole: '', type: '', comment: '', actionType: ''};

  errorMessage: string;
  loadingMessage = '';

  providers: ProviderBundle[] = [];

  adapters: AdapterBundle[] = [];
  selectedAdapterId: string;
  selectedAdapter: AdapterBundle;
  adaptersForAudit: AdapterBundle[] = [];

  facets: any;

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

  constructor(private adaptersService: AdaptersService,
              private authenticationService: AuthenticationService,
              private route: ActivatedRoute,
              private router: Router,
              private navigator: NavigationService,
              private fb: UntypedFormBuilder,
              public pidHandler: pidHandler
  ) {
  }

  ngOnInit() {
    if (!this.authenticationService.getUserProperty('roles').some(x => x === 'ROLE_ADMIN' || x === 'ROLE_EPOT')) {
      this.router.navigateByUrl('/home');
    } else {
      this.dataForm = this.fb.group(this.formPrepare);

      this.urlParams = [];
      this.route.queryParams
        .subscribe(params => {

            for (const i in params) {
              if (i === 'provider_id') {
                if (this.dataForm.get('provider_id').value.length === 0) {
                  const formArrayNew: UntypedFormArray = this.dataForm.get('provider_id') as UntypedFormArray;
                  // formArrayNew = this.fb.array([]);
                  for (const provider_id of params[i].split(',')) {
                    if (provider_id !== '') {
                      formArrayNew.push(new UntypedFormControl(provider_id));
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

            for (const i in this.dataForm.controls) {
              if (this.dataForm.get(i).value) {
                const urlParam = new URLParameter();
                urlParam.key = i;
                urlParam.values = [this.dataForm.get(i).value];
                this.urlParams.push(urlParam);
              }
            }

            this.getAdapters();
            // this.handleChange();
          },
          error => this.errorMessage = <any>error
        );
    }
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
    this.router.navigate([`/adapters/all`], {queryParams: map});
  }

  handleChangeAndResetPage() {
    this.dataForm.get('from').setValue(0);
    this.handleChange();
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

  getAdapters() {
    this.loadingMessage = 'Loading adapters entries...';
    this.adapters = [];
    this.adaptersService.getAdapterBundles(this.dataForm.get('from').value, this.dataForm.get('quantity').value,
      this.dataForm.get('sort').value, this.dataForm.get('order').value, this.dataForm.get('query').value,
      this.dataForm.get('catalogue_id').value, this.dataForm.get('provider_id').value, this.dataForm.get('status').value,
      this.dataForm.get('active').value, this.dataForm.get('suspended').value, this.dataForm.get('auditState').value).subscribe(
      res => {
        this.adapters = res['results'];
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

  showDeletionModal(id: string) {
    this.selectedAdapterId = id;
    if (this.selectedAdapterId) {
      UIkit.modal('#deletionModal').show();
    }
  }

  deleteAdapter(id: string) {
    // UIkit.modal('#spinnerModal').show();
    this.adaptersService.deleteAdapterById(id).subscribe(
      res => {},
      error => {
        // console.log(error);
        // UIkit.modal('#spinnerModal').hide();
        this.errorMessage = 'Something went bad. ' + error.error ;
        this.getAdapters();
      },
      () => {
        this.getAdapters();
        // UIkit.modal('#spinnerModal').hide();
      }
    );
  }

  showSuspensionModal(bundle: AdapterBundle) {
    this.selectedAdapter = bundle;
    if (this.selectedAdapter) {
      UIkit.modal('#suspensionModal').show();
    }
  }

  suspendAdapter() {
    UIkit.modal('#spinnerModal').show();
    this.adaptersService.suspendAdapter(this.selectedAdapter.id, this.selectedAdapter.adapter.catalogueId, !this.selectedAdapter.suspended)
      .subscribe(
        res => {
          UIkit.modal('#suspensionModal').hide();
          location.reload();
          // this.getProviders();
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

  verifyAdapter(id: string, active: boolean, status: string){
    this.loadingMessage = '';
    UIkit.modal('#spinnerModal').show();
    this.adaptersService.verifyAdapter(id, active, status).subscribe(
      res => this.getAdapters(),
      err => UIkit.modal('#spinnerModal').hide(),
      () => {
        UIkit.modal('#spinnerModal').hide();
        location.reload();
      }
    );
  }

  publishAdapter(id: string, active: boolean){ // Activates/Deactivates
    this.loadingMessage = '';
    UIkit.modal('#spinnerModal').show();
    this.adaptersService.publishAdapter(id, active).subscribe(
      res => this.getAdapters(),
      err => UIkit.modal('#spinnerModal').hide(),
      () => {
        UIkit.modal('#spinnerModal').hide();
        location.reload();
      }
    );
  }

  /** Audit --> **/
  showAuditForm(bundle: AdapterBundle) {
    this.commentAuditControl.reset();
    this.selectedAdapter = bundle;
    this.showMainAuditForm = true;
  }

  resetAuditView() {
    this.showMainAuditForm = false;
    this.commentAuditControl.reset();
  }

  auditResourceAction(action: string, bundle: AdapterBundle) {
    this.adaptersService.auditAdapter(this.selectedAdapter.id, action, this.selectedAdapter.adapter.catalogueId, this.commentAuditControl.value)
      .subscribe(
        res => {this.getAdapters();},
        err => {console.log(err);},
        () => {
          this.adaptersForAudit.forEach(
            s => {
              if (s.id === this.selectedAdapter.id) {
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
  /** <--Audit **/

  /** for facets--> **/
  isCatalogueChecked(value: string) {
    return this.dataForm.get('catalogue_id').value.includes(value);
  }

  isProviderChecked(value: string) {
    return this.dataForm.get('provider_id').value.includes(value);
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

}
