import {Component, ElementRef, OnInit, QueryList, ViewChildren} from '@angular/core';
import {ResourceService} from '../../services/resource.service';
import {ServiceProviderService} from '../../services/service-provider.service';
import {statusChangeMap, statusList} from '../../domain/service-provider-status-list';
import {Provider, ProviderBundle, Service, Type, Vocabulary} from '../../domain/eic-model';
import {environment} from '../../../environments/environment';
import {mergeMap} from 'rxjs/operators';
import {AuthenticationService} from '../../services/authentication.service';
import {ActivatedRoute, Router} from '@angular/router';
import {FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {URLParameter} from '../../domain/url-parameter';
import {Paging} from '../../domain/paging';
import {zip} from 'rxjs/internal/observable/zip';

declare var UIkit: any;

@Component({
  selector: 'app-service-providers-list',
  templateUrl: './service-providers-list.component.html'
})
export class ServiceProvidersListComponent implements OnInit {
  url = environment.API_ENDPOINT;
  serviceORresource = environment.serviceORresource;
  projectName = environment.projectName;

  formPrepare = {
    query: '',
    orderField: 'name',
    order: 'ASC',
    quantity: '10',
    from: '0',
    status: new FormArray([]),
  };

  dataForm: FormGroup;

  urlParams: URLParameter[] = [];

  errorMessage: string;
  loadingMessage = '';

  providers: ProviderBundle[] = [];
  selectedProvider: ProviderBundle;
  newStatus: string;
  pushedApprove: boolean;

  total: number;
  // from = 0;
  // itemsPerPage = 10;
  currentPage = 1;
  pageTotal: number;
  pages: number[] = [];
  offset = 2;

  statusList = statusList;
  pendingFirstServicePerProvider: any[] = [];
  adminActionsMap = statusChangeMap;

  providersPage: Paging<Provider>;
  vocabularies: Map<string, Vocabulary[]> = null;
  resourceToPreview: Service;

  public fundingBodyVocabulary: Vocabulary[] = null;
  public fundingProgramVocabulary: Vocabulary[] = null;
  public targetUsersVocabulary: Vocabulary[] = null;
  public accessTypesVocabulary: Vocabulary[] = null;
  public accessModesVocabulary: Vocabulary[] = null;
  public orderTypeVocabulary: Vocabulary[] = null;
  public phaseVocabulary: Vocabulary[] = null;
  public trlVocabulary: Vocabulary[] = null;
  public superCategoriesVocabulary: Vocabulary[] = null;
  public categoriesVocabulary: Vocabulary[] = null;
  public subCategoriesVocabulary: Vocabulary[] = null;
  public scientificDomainVocabulary: Vocabulary[] = null;
  public scientificSubDomainVocabulary: Vocabulary[] = null;
  public placesVocabulary: Vocabulary[] = [];
  public placesVocIdArray: string[] = [];
  public geographicalVocabulary: Vocabulary[] = null;
  public languagesVocabulary: Vocabulary[] = null;
  public languagesVocIdArray: string[] = [];
  public statusesVocabulary: Vocabulary[] = null;

  public statuses: Array<string> = [
    'approved', 'pending initial approval', 'rejected',
    'pending template submission', 'pending template approval', 'rejected template'
  ];

  public labels: Array<string> = [
    `Approved Provider`, `Provider submitted application`,
    `Rejected Provider`, `Approved provider without ${this.serviceORresource}`,
    `Pending first ${this.serviceORresource} approval `, `Rejected ${this.serviceORresource}`
  ];

  @ViewChildren("checkboxes") checkboxes: QueryList<ElementRef>;

  constructor(private resourceService: ResourceService,
              private serviceProviderService: ServiceProviderService,
              private authenticationService: AuthenticationService,
              private route: ActivatedRoute,
              private router: Router,
              private fb: FormBuilder
  ) {
  }

  ngOnInit() {
    if (!this.authenticationService.getUserProperty('roles').some(x => x === 'ROLE_ADMIN')) {
      this.router.navigateByUrl('/home');
    } else {
      this.dataForm = this.fb.group(this.formPrepare);

      this.urlParams = [];
      this.route.queryParams
        .subscribe(params => {

            let foundStatus = false;
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

            this.getProviders();
            // this.handleChange();
          },
          error => this.errorMessage = <any>error
        );
    }

    zip(
      this.resourceService.getProvidersNames(),
      this.resourceService.getAllVocabulariesByType()
    ).subscribe(suc => {
        this.providersPage = <Paging<Provider>>suc[0];
        this.vocabularies = <Map<string, Vocabulary[]>>suc[1];
        this.targetUsersVocabulary = this.vocabularies[Type.TARGET_USER];
        this.accessTypesVocabulary = this.vocabularies[Type.ACCESS_TYPE];
        this.accessModesVocabulary = this.vocabularies[Type.ACCESS_MODE];
        this.orderTypeVocabulary = this.vocabularies[Type.ORDER_TYPE];
        this.phaseVocabulary = this.vocabularies[Type.LIFE_CYCLE_STATUS];
        this.trlVocabulary = this.vocabularies[Type.TRL];
        this.superCategoriesVocabulary = this.vocabularies[Type.SUPERCATEGORY];
        this.categoriesVocabulary = this.vocabularies[Type.CATEGORY];
        this.subCategoriesVocabulary = this.vocabularies[Type.SUBCATEGORY];
        this.scientificDomainVocabulary = this.vocabularies[Type.SCIENTIFIC_DOMAIN];
        this.scientificSubDomainVocabulary = this.vocabularies[Type.SCIENTIFIC_SUBDOMAIN];
        this.fundingBodyVocabulary = this.vocabularies[Type.FUNDING_BODY];
        this.fundingProgramVocabulary = this.vocabularies[Type.FUNDING_PROGRAM];
        // this.placesVocabulary = this.vocabularies[Type.COUNTRY];
        this.geographicalVocabulary = this.vocabularies[Type.COUNTRY];
        this.languagesVocabulary = this.vocabularies[Type.LANGUAGE];
        // this.placesVocIdArray = this.placesVocabulary.map(entry => entry.id);
        // this.languagesVocIdArray = this.languagesVocabulary.map(entry => entry.id);
      },
      error => {
        this.errorMessage = 'Something went bad while getting the data for page initialization. ' + JSON.stringify(error.error.error);
      },
      () => {}
    );
  }

  onStatusSelectionChange(event: any) {

    const formArray: FormArray = this.dataForm.get('status') as FormArray;

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

    this.router.navigate([`/provider/all`], {queryParams: map});
    // this.getProviders();
  }

  handleChangeAndResetPage() {
    this.dataForm.get('from').setValue(0);
    this.handleChange();
  }

  getProviders() {
    this.loadingMessage = 'Loading Providers...';
    this.providers = [];
    this.resourceService.getProviderBundles(this.dataForm.get('from').value, this.dataForm.get('quantity').value,
      this.dataForm.get('orderField').value, this.dataForm.get('order').value, this.dataForm.get('query').value,
      this.dataForm.get('status').value).subscribe(
      res => {
        this.providers = res['results'];
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
        this.providers.forEach(
          p => {
            if ((p.status === 'pending template approval') ||
              (p.status === 'rejected template')) {
              this.serviceProviderService.getPendingServicesOfProvider(p.id).subscribe(
                res => {
                  if (res && (res.length > 0)) {
                    this.pendingFirstServicePerProvider.push({providerId: p.id, serviceId: res[0].id});
                  }
                }
              );
            }
          }
        );
      }
    );
  }

  approveStatusChange(provider: ProviderBundle) {
    this.selectedProvider = provider;
    UIkit.modal('#approveModal').show();
  }

  updateSelectedProvider() {
    if (this.selectedProvider && (this.selectedProvider.status !== 'approved')) {
      const i = this.statusList.indexOf(this.selectedProvider.status);
      let active = false;
      if (this.statusList[i + 1] === 'approved') {
        active = true;
      }
      const updatedFields = Object.assign({
        id: this.selectedProvider.id,
        status: this.statusList[i + 1],
        active: active
      });

      this.serviceProviderService.updateServiceProvider(updatedFields).pipe(
        mergeMap(res => this.serviceProviderService.getServiceProviderById(res.id)))
        .subscribe(
          res => {
            const i = this.providers.findIndex(p => p.id === res.id);
            if (i > -1) {
              Object.assign(this.providers[i], res);
            }
          },
          err => console.log(err),
          () => {
            UIkit.modal('#approveModal').hide();
            this.selectedProvider = null;
          }
        );
    }

  }

  showDeletionModal(provider: ProviderBundle) {
    this.selectedProvider = provider;
    if (this.selectedProvider) {
      UIkit.modal('#deletionModal').show();
    }
  }

  deleteProvider(providerId) {
    this.serviceProviderService.deleteServiceProvider(providerId)
      .subscribe(
        res => {
          UIkit.modal('#deletionModal').hide();
          location.reload();
          // this.getProviders();
        },
        err => {
          UIkit.modal('#deletionModal').hide();
          this.loadingMessage = '';
          console.log(err);
        },
        () => {
          this.loadingMessage = '';
        }
      );
  }

  showActionModal(provider: ProviderBundle, newStatus: string, pushedApprove: boolean) {
    this.selectedProvider = provider;
    this.newStatus = newStatus;
    this.pushedApprove = pushedApprove;
    if (this.selectedProvider) {
      UIkit.modal('#actionModal').show();
    }
  }

  statusChangeAction() {
    this.loadingMessage = '';
    const active = this.pushedApprove && (this.newStatus === 'approved');
    this.serviceProviderService.verifyServiceProvider(this.selectedProvider.id, active, this.adminActionsMap[this.newStatus].statusId)
      .subscribe(
        res => {
          /*this.providers = [];
          this.providers = res;*/
          // console.log(res);
          UIkit.modal('#actionModal').hide();
          this.getProviders();
        },
        err => {
          UIkit.modal('#actionModal').hide();
          this.loadingMessage = '';
          console.log(err);
        },
        () => {
          this.loadingMessage = '';
        }
      );
  }

  hasCreatedFirstService(id: string) {
    return this.pendingFirstServicePerProvider.some(x => x.providerId === id);
  }

  getLinkToFirstService(id: string) {
    if (this.hasCreatedFirstService(id)) {
      return '/service/' + this.pendingFirstServicePerProvider.filter(x => x.providerId === id)[0].serviceId;
    } else {
      return '/provider/' + id + '/add-resource-template';
    }
  }

  getLinkToEditFirstService(id: string) {
    return '/provider/' + id + '/resource/update/' + this.pendingFirstServicePerProvider.filter(x => x.providerId === id)[0].serviceId;
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

  checkAll(check: boolean) {

    const formArray: FormArray = this.dataForm.get('status') as FormArray;
    if (check){
      formArray.controls.length = 0;
      for (let i = 0; i < this.statuses.length; i++) {
        formArray.push(new FormControl(this.statuses[i]));
      }
    } else {
      while (formArray.controls.length > 0 ) {
        formArray.removeAt(0);
      }
    }
    this.handleChangeAndResetPage();

  }

  DownloadProvidersCSV() {
    window.open(this.url + '/exportToCSV/providers', '_blank');
  }

  DownloadServicesCSV() {
    window.open(this.url + '/exportToCSV/services', '_blank');
  }

  openPreviewModal(providerBundleId) {
    if (this.hasCreatedFirstService(providerBundleId)) {
      const resourceId = this.pendingFirstServicePerProvider.filter(x => x.providerId === providerBundleId)[0].serviceId;
      this.resourceService.getService(resourceId).subscribe(
        res => { this.resourceToPreview = res; },
        error => console.log(error),
        () => {
          UIkit.modal('#modal-preview').show();
        }
      );
    }
  }
}
