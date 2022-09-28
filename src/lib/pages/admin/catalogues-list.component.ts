import {Component, ElementRef, OnInit, QueryList, ViewChildren} from '@angular/core';
import {ResourceService} from '../../services/resource.service';
import {ServiceProviderService} from '../../services/service-provider.service';
import {CatalogueService} from "../../services/catalogue.service";
// import {statusChangeMap, statusList} from '../../domain/catalogue-status-list';
import {LoggingInfo, Provider, CatalogueBundle, Service, Type, Vocabulary} from '../../domain/eic-model';
import {environment} from '../../../environments/environment';
import {mergeMap} from 'rxjs/operators';
import {AuthenticationService} from '../../services/authentication.service';
import {ActivatedRoute, Router} from '@angular/router';
import {FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {URLParameter} from '../../domain/url-parameter';
import {Paging} from '../../domain/paging';
import {getLocaleDateFormat} from '@angular/common';
import {zip} from 'rxjs';

declare var UIkit: any;

@Component({
  selector: 'app-catalogues-list',
  templateUrl: './catalogues-list.component.html'
})
export class CataloguesListComponent implements OnInit {
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
    templateStatus: new FormArray([]),
    auditState: new FormArray([])
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

  catalogues: CatalogueBundle[] = [];
  cataloguesForAudit: CatalogueBundle[] = [];
  selectedCatalogue: CatalogueBundle;
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

  // statusList = statusList;
  // adminActionsMap = statusChangeMap;

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

  public auditStates: Array<string> = ['Valid', 'Not Audited', 'Invalid and updated', 'Invalid and not updated'];
  public auditLabels: Array<string> = ['Valid', 'Not Audited', 'Invalid and updated', 'Invalid and not updated'];
  @ViewChildren("auditCheckboxes") auditCheckboxes: QueryList<ElementRef>;

  // public statuses: Array<string> = ['approved provider', 'pending provider', 'rejected provider'];
  public statuses: Array<string> = ['approved catalogue', 'pending catalogue', 'rejected catalogue'];
  public labels: Array<string> = ['Approved', 'Pending', 'Rejected'];
  @ViewChildren("checkboxes") checkboxes: QueryList<ElementRef>;

  public templateStatuses: Array<string> = ['approved template', 'pending template', 'rejected template', 'no template status'];
  public templateLabels: Array<string> = ['Approved', 'Pending', 'Rejected', 'No Status'];
  @ViewChildren("templateCheckboxes") templateCheckboxes: QueryList<ElementRef>;

  constructor(private resourceService: ResourceService,
              private serviceProviderService: ServiceProviderService,
              private catalogueService: CatalogueService,
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

            this.getCatalogues();
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

  // isAuditStateChecked(value: string) {
  //   return this.dataForm.get('auditState').value.includes(value);
  // }

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

    this.router.navigate([`/catalogue/all`], {queryParams: map});
    // this.getCatalogues();
  }

  handleChangeAndResetPage() {
    this.dataForm.get('from').setValue(0);
    this.handleChange();
  }

  getCatalogues() {
    this.loadingMessage = 'Loading Providers...';
    this.catalogues = [];
    this.catalogueService.getCatalogueBundles(this.dataForm.get('from').value, this.dataForm.get('quantity').value,
      this.dataForm.get('orderField').value, this.dataForm.get('order').value, this.dataForm.get('query').value,
      this.dataForm.get('status').value, this.dataForm.get('templateStatus').value, this.dataForm.get('auditState').value).subscribe(
      res => {
        this.catalogues = res['results'];
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
        this.catalogues.forEach(
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

  // getRandomProviders(quantity: string) {
  //   this.loadingMessage = 'Loading ' + quantity + ' random Providers...';
  //   this.cataloguesForAudit = [];
  //   this.serviceProviderService.getRandomProviders(quantity).subscribe(
  //     res => {
  //       this.cataloguesForAudit = res['results'];
  //       // this.total = res['total'];
  //       // this.total = +quantity;
  //       // this.paginationInit();
  //     },
  //     err => {
  //       console.log(err);
  //       this.errorMessage = 'The list could not be retrieved';
  //       this.loadingMessage = '';
  //     },
  //     () => {
  //       this.loadingMessage = '';
  //       this.cataloguesForAudit.forEach(
  //         p => {
  //           // if ((p.templateStatus === 'pending template') || (p.templateStatus === 'rejected template')) {
  //           if (p.templateStatus === 'pending template') {
  //             this.resourceService.getServiceTemplate(p.id).subscribe(
  //               res => {
  //                 if (res) {
  //                   this.serviceTemplatePerProvider.push({providerId: p.id, serviceId: JSON.parse(JSON.stringify(res)).id});
  //                 }
  //               }
  //             );
  //           }
  //         }
  //       );
  //     }
  //   );
  // }

  approveStatusChange(catalogue: CatalogueBundle) {
    this.selectedCatalogue = catalogue;
    UIkit.modal('#approveModal').show();
  }

  showDeletionModal(catalogue: CatalogueBundle) {
    this.selectedCatalogue = catalogue;
    if (this.selectedCatalogue) {
      UIkit.modal('#deletionModal').show();
    }
  }

  deleteCatalogue(catalogueId) {
    this.catalogueService.deleteCatalogue(catalogueId)
      .subscribe(
        res => {
          UIkit.modal('#deletionModal').hide();
          location.reload();
          // this.getCatalogues();
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

  showActionModal(catalogue: CatalogueBundle, newStatus: string) {
    this.selectedCatalogue = catalogue;
    this.newStatus = newStatus;
    if (this.selectedCatalogue) {
      UIkit.modal('#actionModal').show();
    }
  }

  // showActionModal(catalogue: CatalogueBundle, newStatus: string, pushedApprove: boolean, verify: boolean) {
  //   this.selectedCatalogue = catalogue;
  //   this.newStatus = newStatus;
  //   this.pushedApprove = pushedApprove;
  //   this.verify = verify;
  //   if (this.selectedCatalogue) {
  //     UIkit.modal('#actionModal').show();
  //   }
  // }

  statusChangeActionCatalogue(){
      const active = this.newStatus === 'approved catalogue';
      this.catalogueService.verifyCatalogue(this.selectedCatalogue.id, active, this.newStatus)
      .subscribe(
        res => {
          UIkit.modal('#actionModal').hide();
          this.getCatalogues();
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

  // statusChangeAction() {
  //   this.loadingMessage = '';
  //   const active = this.pushedApprove && (this.newStatus === 'approved provider');
  //   if(this.verify){ //use verify method
  //     this.serviceProviderService.verifyServiceProvider(this.selectedCatalogue.id, active, this.adminActionsMap[this.newStatus].statusId)
  //       .subscribe(
  //         res => {
  //           /*this.providers = [];
  //           this.providers = res;*/
  //           UIkit.modal('#actionModal').hide();
  //           this.getCatalogues();
  //         },
  //         err => {
  //           UIkit.modal('#actionModal').hide();
  //           this.loadingMessage = '';
  //           console.log(err);
  //         },
  //         () => {
  //           this.loadingMessage = '';
  //         }
  //       );
  //   } else { //use publish method
  //     this.serviceProviderService.publishProvider(this.selectedCatalogue.id, active)
  //       .subscribe(
  //         res => {
  //           /*this.providers = [];
  //           this.providers = res;*/
  //           UIkit.modal('#actionModal').hide();
  //           this.getCatalogues();
  //         },
  //         err => {
  //           UIkit.modal('#actionModal').hide();
  //           this.loadingMessage = '';
  //           console.log(err);
  //         },
  //         () => {
  //           this.loadingMessage = '';
  //         }
  //       );
  //   }
  // }

  // templateAction(id, active, status) {
  //   this.loadingMessage = '';
  //   UIkit.modal('#spinnerModal').show();
  //   const templateId = this.serviceTemplatePerProvider.filter(x => x.providerId === id)[0].serviceId;
  //   this.resourceService.verifyResource(templateId, active, status).subscribe(
  //     res => {
  //       this.getCatalogues();
  //     },
  //     err => {
  //       UIkit.modal('#spinnerModal').hide();
  //       console.log(err);
  //     },
  //     () => {
  //       UIkit.modal('#spinnerModal').hide();
  //     }
  //   );
  // }

  /* Audit */

  // showAuditForm(view: string, catalogue: CatalogueBundle) {
  //   this.commentControl.reset();
  //   this.selectedCatalogue = catalogue;
  //   if (view === 'side') {
  //     this.showSideAuditForm = true;
  //   } else if (view === 'main') {
  //     this.showMainAuditForm = true;
  //   }
  // }
  //
  // resetAuditView() {
  //   this.showSideAuditForm = false;
  //   this.showMainAuditForm = false;
  //   this.commentControl.reset();
  // }
  //
  // auditProviderAction(action: string) {
  //   this.serviceProviderService.auditProvider(this.selectedCatalogue.id, action, this.commentControl.value)
  //     .subscribe(
  //       res => {
  //         if (!this.showSideAuditForm) {
  //           this.getCatalogues();
  //         }
  //       },
  //       err => { console.log(err); },
  //       () => {
  //         this.cataloguesForAudit.forEach(
  //           p => {
  //             if (p.id === this.selectedCatalogue.id) {
  //               p.latestAuditInfo = this.initLatestAuditInfo;
  //               p.latestAuditInfo.date = Date.now().toString();
  //               p.latestAuditInfo.actionType = action;
  //             }
  //           }
  //         );
  //         this.resetAuditView();
  //       }
  //     );
  // }

  hasCreatedFirstService(id: string) {
    return this.serviceTemplatePerProvider.some(x => x.providerId === id);
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
      console.log('in');
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

  openPreviewModal(providerBundleId) {
    if (this.hasCreatedFirstService(providerBundleId)) {
      const resourceId = this.serviceTemplatePerProvider.filter(x => x.providerId === providerBundleId)[0].serviceId;
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
