import {Component, OnInit} from '@angular/core';
import {ResourceService} from '../../services/resource.service';
import {ServiceProviderService} from '../../services/service-provider.service';
import {statusChangeMap, statusList} from '../../domain/service-provider-status-list';
import {ProviderBundle} from '../../domain/eic-model';
import {environment} from '../../../environments/environment';
import {mergeMap} from 'rxjs/operators';
import {AuthenticationService} from '../../services/authentication.service';
import {ActivatedRoute, Router} from '@angular/router';
import {FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {URLParameter} from '../../domain/url-parameter';

declare var UIkit: any;

@Component({
  selector: 'app-service-providers-list',
  templateUrl: './service-providers-list.component.html'
})
export class ServiceProvidersListComponent implements OnInit {
  url = environment.API_ENDPOINT;
  serviceORresource = environment.serviceORresource;

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
  // itemsPerPage = 15;
  currentPage = 1;
  pageTotal: number;
  pages: number[] = [];

  statusList = statusList;
  pendingFirstServicePerProvider: any[] = [];
  adminActionsMap = statusChangeMap;

  public statuses: Array<string> = [
    'approved', 'pending initial approval', 'pending template submission',
    'pending template approval', 'rejected template', 'rejected'
  ];

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
  }

  onStatusSelectionChange(event: any) {

    const formArray: FormArray = this.dataForm.get('status') as FormArray;

    if (event.target.checked) {
      // Add a new control in the arrayForm
      console.log('Add a new control in the arrayForm');
      formArray.push(new FormControl(event.target.value));
    } else {
      // find the unselected element
      let i = 0;

      formArray.controls.forEach((ctrl: FormControl) => {
        if (ctrl.value === event.target.value) {
          console.log('Remove the unselected element from the arrayForm');
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
      },
      () => {
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
    this.loadingMessage = ' ';
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
    return '/service/' + this.pendingFirstServicePerProvider.filter(x => x.providerId === id)[0].serviceId;
  }

  getLinkToEditFirstService(id: string) {
    return '/edit/' + this.pendingFirstServicePerProvider.filter(x => x.providerId === id)[0].serviceId;
  }

  paginationInit() {
    this.pages = [];
    for (let i = 0; i < Math.ceil(this.total / (this.dataForm.get('quantity').value)); i++) {
      this.pages.push(i + 1);
    }
    this.currentPage = (this.dataForm.get('from').value / (this.dataForm.get('quantity').value)) + 1;
    this.pageTotal = Math.ceil(this.total / (this.dataForm.get('quantity').value));
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
    if (this.currentPage < this.pageTotal - 1) {
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
}
