import {Component, ElementRef, OnInit, QueryList, ViewChildren} from '@angular/core';
import {ProviderBundle, InteroperabilityRecord, InteroperabilityRecordBundle, LoggingInfo} from '../../domain/eic-model';
import {environment} from '../../../environments/environment';
import {AuthenticationService} from '../../services/authentication.service';
import {ActivatedRoute, Router} from '@angular/router';
import {FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {URLParameter} from '../../domain/url-parameter';
import {NavigationService} from '../../services/navigation.service';
import {GuidelinesService} from "../../services/guidelines.service";

declare var UIkit: any;

@Component({
  selector: 'app-guidelines-list',
  templateUrl: './guidelines-list.component.html'
})
export class GuidelinesListComponent implements OnInit {
  url = environment.API_ENDPOINT;
  serviceORresource = environment.serviceORresource;

  formPrepare = {
    order: 'ASC',
    orderField: 'title',
    quantity: '10',
    from: '0',
    query: '',
    active: '',
    suspended: '',
    auditState: new FormArray([]),
    catalogue_id: new FormArray([]),
    provider_id: new FormArray([]),
    status: ''
  };

  dataForm: FormGroup;

  urlParams: URLParameter[] = [];

  commentAuditControl = new FormControl();
  showMainAuditForm = false;
  initLatestAuditInfo: LoggingInfo =  {date: '', userEmail: '', userFullName: '', userRole: '', type: '', comment: '', actionType: ''};

  errorMessage: string;
  loadingMessage = '';

  providers: ProviderBundle[] = [];

  guidelines: InteroperabilityRecordBundle[] = [];
  selectedGuidelineId: string;
  selectedGuideline: InteroperabilityRecordBundle;
  guidelinesForAudit: InteroperabilityRecordBundle[] = [];

  facets: any;

  total: number;
  // from = 0;
  // itemsPerPage = 10;
  currentPage = 1;
  pageTotal: number;
  pages: number[] = [];
  offset = 2;

  public auditStates: Array<string> = ['Valid', 'Not Audited', 'Invalid and updated', 'Invalid and not updated'];
  public auditLabels: Array<string> = ['Valid', 'Not Audited', 'Invalid and updated', 'Invalid and not updated'];

  @ViewChildren('auditCheckboxes') auditCheckboxes: QueryList<ElementRef>;

  constructor(private guidelinesService: GuidelinesService,
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

      this.urlParams = [];
      this.route.queryParams
        .subscribe(params => {

          for (const i in params) {
            if (i === 'provider_id') {
              if (this.dataForm.get('provider_id').value.length === 0) {
                const formArrayNew: FormArray = this.dataForm.get('provider_id') as FormArray;
                // formArrayNew = this.fb.array([]);
                for (const provider_id of params[i].split(',')) {
                  if (provider_id !== '') {
                    formArrayNew.push(new FormControl(provider_id));
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

          this.getGuidelines();
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
    this.router.navigate([`/guidelines/all`], {queryParams: map});
  }

  handleChangeAndResetPage() {
    this.dataForm.get('from').setValue(0);
    this.handleChange();
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

  getGuidelines() {
    this.loadingMessage = 'Loading guidelines entries...';
    this.guidelines = [];
    this.guidelinesService.getInteroperabilityRecordBundles(this.dataForm.get('from').value, this.dataForm.get('quantity').value,
      this.dataForm.get('orderField').value, this.dataForm.get('order').value, this.dataForm.get('query').value,
      this.dataForm.get('catalogue_id').value, this.dataForm.get('provider_id').value, this.dataForm.get('status').value,
      this.dataForm.get('active').value, this.dataForm.get('suspended').value, this.dataForm.get('auditState').value).subscribe(
      res => {
        this.guidelines = res['results'];
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
    this.selectedGuidelineId = id;
    if (this.selectedGuidelineId) {
      UIkit.modal('#deletionModal').show();
    }
  }

  deleteGuideline(id: string) {
    // UIkit.modal('#spinnerModal').show();
    this.guidelinesService.deleteInteroperabilityRecordById(id).subscribe(
      res => {},
      error => {
        // console.log(error);
        // UIkit.modal('#spinnerModal').hide();
        this.errorMessage = 'Something went bad. ' + error.error ;
        this.getGuidelines();
      },
      () => {
        this.getGuidelines();
        // UIkit.modal('#spinnerModal').hide();
      }
    );
  }

  showSuspensionModal(guidelineBundle: InteroperabilityRecordBundle) {
    this.selectedGuideline = guidelineBundle;
    if (this.selectedGuideline) {
      UIkit.modal('#suspensionModal').show();
    }
  }

  suspendInteroperabilityRecord() {
    UIkit.modal('#spinnerModal').show();
    this.guidelinesService.suspendInteroperabilityRecord(this.selectedGuideline.id, this.selectedGuideline.interoperabilityRecord.catalogueId, !this.selectedGuideline.suspended)
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

  verifyGuideline(id: string, active: boolean, status: string){
    this.loadingMessage = '';
    UIkit.modal('#spinnerModal').show();
    this.guidelinesService.verifyInteroperabilityRecord(id, active, status).subscribe(
      res => this.getGuidelines(),
      err => UIkit.modal('#spinnerModal').hide(),
      () => {
        UIkit.modal('#spinnerModal').hide();
        location.reload();
      }
    );
  }

  /** Audit --> **/
  showAuditForm(irBundle: InteroperabilityRecordBundle) {
    this.commentAuditControl.reset();
    this.selectedGuideline = irBundle;
    this.showMainAuditForm = true;
  }

  resetAuditView() {
    this.showMainAuditForm = false;
    this.commentAuditControl.reset();
  }

  auditResourceAction(action: string, bundle: InteroperabilityRecordBundle) {
    this.guidelinesService.auditGuideline(this.selectedGuideline.id, action, this.selectedGuideline.interoperabilityRecord.catalogueId, this.commentAuditControl.value)
      .subscribe(
        res => {this.getGuidelines();},
        err => {console.log(err);},
        () => {
          this.guidelinesForAudit.forEach(
            s => {
              if (s.id === this.selectedGuideline.id) {
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
