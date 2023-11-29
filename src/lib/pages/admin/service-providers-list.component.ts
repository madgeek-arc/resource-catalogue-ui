import {Component, ElementRef, OnInit, QueryList, ViewChildren} from '@angular/core';
import {ResourceService} from '../../services/resource.service';
import {ServiceProviderService} from '../../services/service-provider.service';
import {statusChangeMap, statusList} from '../../domain/service-provider-status-list';
import {LoggingInfo, Provider, ProviderBundle, Service, Type, Vocabulary} from '../../domain/eic-model';
import {environment} from '../../../environments/environment';
import {mergeMap} from 'rxjs/operators';
import {AuthenticationService} from '../../services/authentication.service';
import {ActivatedRoute, Router} from '@angular/router';
import {FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {URLParameter} from '../../domain/url-parameter';
import {Paging} from '../../domain/paging';
import {getLocaleDateFormat} from '@angular/common';
import {zip} from 'rxjs';
import {TrainingResourceService} from "../../services/training-resource.service";

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
    active: '',
    suspended: '',
    status: new FormArray([]),
    templateStatus: new FormArray([]),
    auditState: new FormArray([]),
    catalogue_id: new FormArray([])
  };

  dataForm: FormGroup;

  urlParams: URLParameter[] = [];

  commentControl = new FormControl();
  // auditingProviderId: string;
  showSideAuditForm = false;
  showMainAuditForm = false;
  initLatestAuditInfo: LoggingInfo =  {date: '', userEmail: '', userFullName: '', userRole: '', type: '', comment: '', actionType: ''};

  errorMessage: string;
  loadingMessage = '';

  providers: ProviderBundle[] = [];
  providersForAudit: ProviderBundle[] = [];
  selectedProvider: ProviderBundle;
  newStatus: string;
  pushedApprove: boolean;
  verify: boolean;

  total: number;
  // from = 0;
  // itemsPerPage = 10;
  currentPage = 1;
  pageTotal: number;
  pages: number[] = [];
  offset = 2;

  serviceTemplatePerProvider: any[] = [];

  statusList = statusList;
  adminActionsMap = statusChangeMap;

  facets: any;

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
  public geographicalVocabulary: Vocabulary[] = null;
  public languagesVocabulary: Vocabulary[] = null;
  public statusesVocabulary: Vocabulary[] = null;

  public auditStates: Array<string> = ['Valid', 'Not Audited', 'Invalid and updated', 'Invalid and not updated'];
  public auditLabels: Array<string> = ['Valid', 'Not Audited', 'Invalid and updated', 'Invalid and not updated'];
  @ViewChildren("auditCheckboxes") auditCheckboxes: QueryList<ElementRef>;

  public statuses: Array<string> = ['approved provider', 'pending provider', 'rejected provider'];
  public labels: Array<string> = ['Approved', 'Pending', 'Rejected'];
  @ViewChildren("checkboxes") checkboxes: QueryList<ElementRef>;

  public templateStatuses: Array<string> = ['approved template', 'pending template', 'rejected template', 'no template status'];
  public templateLabels: Array<string> = ['Approved', 'Pending', 'Rejected', 'No Status'];
  @ViewChildren("templateCheckboxes") templateCheckboxes: QueryList<ElementRef>;

  constructor(private resourceService: ResourceService,
              private trainingResourceService: TrainingResourceService,
              private serviceProviderService: ServiceProviderService,
              private authenticationService: AuthenticationService,
              private route: ActivatedRoute,
              private router: Router,
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

            let foundStatus = false;
            let foundTemplateStatus = false;
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
              } else if (i === 'templateStatus') {
                if (this.dataForm.get('templateStatus').value.length === 0) {
                  const formArrayNew: FormArray = this.dataForm.get('templateStatus') as FormArray;
                  // formArrayNew = this.fb.array([]);
                  for (const templateStatus of params[i].split(',')) {
                    if (templateStatus !== '') {
                      formArrayNew.push(new FormControl(templateStatus));
                    }
                  }
                }
                foundTemplateStatus = true;
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
              } else {
                this.dataForm.get(i).setValue(params[i]);
              }
            }

            // if no status in URL, check all statuses by default
            if (!foundStatus) {
              const formArray: FormArray = this.dataForm.get('status') as FormArray;
              this.statuses.forEach(status => {
                formArray.push(new FormControl(status));
              });
            }
            if (!foundTemplateStatus) {
              const formArray: FormArray = this.dataForm.get('templateStatus') as FormArray;
              this.templateStatuses.forEach(templateStatus => {
                formArray.push(new FormControl(templateStatus));
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
      },
      error => {
        this.errorMessage = 'Something went bad while getting the data for page initialization. ' + JSON.stringify(error.error.error);
      },
      () => {}
    );
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

  isStatusChecked(value: string) {
    return this.dataForm.get('status').value.includes(value);
  }

  isTemplateStatusChecked(value: string) {
    return this.dataForm.get('templateStatus').value.includes(value);
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
      this.dataForm.get('orderField').value, this.dataForm.get('order').value, this.dataForm.get('query').value, this.dataForm.get('active').value, this.dataForm.get('suspended').value,
      this.dataForm.get('status').value, this.dataForm.get('templateStatus').value, this.dataForm.get('auditState').value, this.dataForm.get('catalogue_id').value).subscribe(
      res => {
        this.providers = res['results'];
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
        this.providers.forEach(
          p => {
            // if ((p.templateStatus === 'pending template') || (p.templateStatus === 'rejected template')) {
            if (p.templateStatus === 'pending template') {
              this.resourceService.getResourceTemplateOfProvider(p.id).subscribe(
                res => {
                  if (res) {
                    this.serviceTemplatePerProvider.push({
                      providerId: p.id, serviceId: JSON.parse(JSON.stringify(res)).id,
                      service: JSON.parse(JSON.stringify(res)).service,
                      trainingResource: JSON.parse(JSON.stringify(res)).trainingResource
                    });
                  }
                }
              );
            }
          }
        );
      }
    );
  }

  getRandomProviders(quantity: string) {
    this.loadingMessage = 'Loading ' + quantity + ' random Providers...';
    this.providersForAudit = [];
    this.serviceProviderService.getRandomProviders(quantity).subscribe(
      res => {
        this.providersForAudit = res['results'];
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
        this.providersForAudit.forEach(
          p => {
            // if ((p.templateStatus === 'pending template') || (p.templateStatus === 'rejected template')) {
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

  /** for facets--> **/
  isCatalogueChecked(value: string) {
    return this.dataForm.get('catalogue_id').value.includes(value);
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

  approveStatusChange(provider: ProviderBundle) {
    this.selectedProvider = provider;
    UIkit.modal('#approveModal').show();
  }

  updateSelectedProvider() {
    if (this.selectedProvider && (this.selectedProvider.status !== 'approved provider')) {
      const i = this.statusList.indexOf(this.selectedProvider.status);
      let active = false;
      if (this.statusList[i + 1] === 'approved provider') {
        active = true;
      }
      const updatedFields = Object.assign({
        id: this.selectedProvider.id,
        status: this.statusList[i + 1],
        active: active
      });

      this.serviceProviderService.updateServiceProvider(updatedFields, null).pipe(
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

  showSuspensionModal(provider: ProviderBundle) {
    this.selectedProvider = provider;
    if (this.selectedProvider) {
      UIkit.modal('#suspensionModal').show();
    }
  }

  suspendProvider() {
    UIkit.modal('#spinnerModal').show();
    this.serviceProviderService.suspendProvider(this.selectedProvider.id, this.selectedProvider.provider.catalogueId, !this.selectedProvider.suspended)
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

  showActionModal(provider: ProviderBundle, newStatus: string, pushedApprove: boolean, verify: boolean) {
    this.selectedProvider = provider;
    this.newStatus = newStatus;
    this.pushedApprove = pushedApprove;
    this.verify = verify;
    if (this.selectedProvider) {
      UIkit.modal('#actionModal').show();
    }
  }

  statusChangeAction() {
    this.loadingMessage = '';
    const active = this.pushedApprove && (this.newStatus === 'approved provider');
    if(this.verify){ //use verify method
      this.serviceProviderService.verifyProvider(this.selectedProvider.id, active, this.adminActionsMap[this.newStatus].statusId)
        .subscribe(
          res => {
            /*this.providers = [];
            this.providers = res;*/
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
    } else { //use publish method
      this.serviceProviderService.publishProvider(this.selectedProvider.id, active)
        .subscribe(
          res => {
            /*this.providers = [];
            this.providers = res;*/
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
  }

  templateAction(id, active, status, resourceType) {
    this.loadingMessage = '';
    UIkit.modal('#spinnerModal').show();
    const templateId = this.serviceTemplatePerProvider.filter(x => x.providerId === id)[0].serviceId;
    if (resourceType === 'service') {
      this.resourceService.verifyResource(templateId, active, status).subscribe(
        res => this.getProviders(),
        err => UIkit.modal('#spinnerModal').hide(),
        () => {
          UIkit.modal('#spinnerModal').hide();
          location.reload();
        }
      );
    } else if (resourceType === 'trainingResource') {
      this.trainingResourceService.verifyTrainingResource(templateId, active, status).subscribe(
        res => this.getProviders(),
        err => UIkit.modal('#spinnerModal').hide(),
        () => {
          UIkit.modal('#spinnerModal').hide();
          location.reload();
        }
      );
    }

  }

  showAuditForm(view: string, provider: ProviderBundle) {
    this.commentControl.reset();
    this.selectedProvider = provider;
    if (view === 'side') {
      this.showSideAuditForm = true;
    } else if (view === 'main') {
      this.showMainAuditForm = true;
    }
  }

  resetAuditView() {
    this.showSideAuditForm = false;
    this.showMainAuditForm = false;
    this.commentControl.reset();
  }

  auditProviderAction(action: string) {
    this.serviceProviderService.auditProvider(this.selectedProvider.id, action, this.selectedProvider.provider.catalogueId, this.commentControl.value)
      .subscribe(
        res => {
          if (!this.showSideAuditForm) {
            this.getProviders();
          }
        },
        err => { console.log(err); },
        () => {
          this.providersForAudit.forEach(
            p => {
              if (p.id === this.selectedProvider.id) {
                p.latestAuditInfo = this.initLatestAuditInfo;
                p.latestAuditInfo.date = Date.now().toString();
                p.latestAuditInfo.actionType = action;
              }
            }
          );
          this.resetAuditView();
        }
      );
  }

  hasCreatedFirstService(providerId: string) {
    for (let i = 0; i < this.serviceTemplatePerProvider.length; i++) {
      if (this.serviceTemplatePerProvider[i].providerId == providerId) {
        if (this.serviceTemplatePerProvider[i].service) {
          return true;
        }
      }
    }
    return false;
  }

  hasCreatedFirstTrainingResource(providerId: string) {
    for (let i = 0; i < this.serviceTemplatePerProvider.length; i++) {
      if (this.serviceTemplatePerProvider[i].providerId == providerId) {
        if (this.serviceTemplatePerProvider[i].trainingResource) {
          return true;
        }
      }
    }
    return false;
  }

  getLinkToFirstService(id: string) {
    if (this.hasCreatedFirstService(id)) {
      return '/service/' + this.serviceTemplatePerProvider.filter(x => x.providerId === id)[0].serviceId;
    } else {
      return '/provider/' + id + '/add-first-service';
    }
  }

  getLinkToEditFirstService(id: string) {
    return '/provider/' + id + '/resource/update/' + this.serviceTemplatePerProvider.filter(x => x.providerId === id)[0].serviceId;
  }

  getLinkToEditFirstTrainingResource(id: string) {
    return '/provider/' + id + '/training-resource/update/' + this.serviceTemplatePerProvider.filter(x => x.providerId === id)[0].serviceId;
  }

  editProviderInNewTab(providerId) {
    window.open(`/provider/update/${providerId}`, '_blank');
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

  checkAll(check: boolean, name: string) {
    if (name === 'statuses') {
      const formArray: FormArray = this.dataForm.get('status') as FormArray;
      if (check) {
        formArray.controls.length = 0;
        for (let i = 0; i < this.statuses.length; i++) {
          formArray.push(new FormControl(this.statuses[i]));
        }
      } else {
        while (formArray.controls.length > 0 ) {
          formArray.removeAt(0);
        }
      }
    } else if (name === 'templateStatuses') {
      const formArray: FormArray = this.dataForm.get('templateStatus') as FormArray;
      if (check) {
        formArray.controls.length = 0;
        for (let i = 0; i < this.templateStatuses.length; i++) {
          formArray.push(new FormControl(this.templateStatuses[i]));
        }
      } else {
        while (formArray.controls.length > 0 ) {
          formArray.removeAt(0);
        }
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

  openPreviewModal(providerBundleId, resourceType) {
    if (resourceType === 'service' && this.hasCreatedFirstService(providerBundleId)) {
      const resourceId = this.serviceTemplatePerProvider.filter(x => x.providerId === providerBundleId)[0].serviceId;
      this.resourceService.getService(resourceId).subscribe(
        res => { this.resourceToPreview = res; },
        error => console.log(error),
        () => {
          UIkit.modal('#modal-preview').show();
        }
      );
    }
    //TODO: could add training
/*    if (resourceType === 'trainingResource' && this.hasCreatedFirstDatasource(providerBundleId)) {
      const resourceId = this.serviceTemplatePerProvider.filter(x => x.providerId === providerBundleId)[0].serviceId;
      this.trainingResourceService.getService(resourceId).subscribe(
        res => { this.resourceToPreview = res; },
        error => console.log(error),
        () => {
          UIkit.modal('#modal-preview').show();
        }
      );
    }*/
  }

}
