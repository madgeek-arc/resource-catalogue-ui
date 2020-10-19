import {Component, Input, OnInit} from '@angular/core';
import {InfraService, Provider, ProviderBundle, Service} from '../../../../domain/eic-model';
import {ServiceProviderService} from '../../../../services/service-provider.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ResourceService} from '../../../../services/resource.service';
import {Paging} from '../../../../domain/paging';
import {FormBuilder, FormGroup} from '@angular/forms';
import {URLParameter} from '../../../../domain/url-parameter';
import {environment} from '../../../../../environments/environment';

declare var UIkit: any;

@Component({
  selector: 'app-pending-services',
  templateUrl: './pending-services.component.html',
})

export class PendingServicesComponent implements OnInit {

  serviceORresource = environment.serviceORresource;

  formPrepare = {
    from: '0'
  };

  dataForm: FormGroup;

  errorMessage = '';
  urlParams: URLParameter[] = [];
  providerId;
  providerBundle: ProviderBundle;
  providerServices: Paging<InfraService>;
  selectedService: InfraService = null;
  path: string;

  total: number;
  itemsPerPage = 10;
  currentPage = 1;
  pageTotal: number;
  pages: number[] = [];


  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private providerService: ServiceProviderService,
    private service: ResourceService
  ) {}

  ngOnInit(): void {
    // this.path = this.route.snapshot.routeConfig.path;
    this.path = window.location.pathname;
    // console.log('this.path --> ', this.path);
    // console.log('window.location.pathname --> ', window.location.pathname);

    if (this.path.includes('dashboard')) {
      this.providerId = this.route.parent.snapshot.paramMap.get('provider');
    } else {
      this.providerId = this.route.snapshot.paramMap.get('providerId');
    }
    // console.log('this.path: ', this.path);
    // this.providerId = this.route.parent.snapshot.paramMap.get('provider');
    // console.log('this.providerId: ', this.providerId);

    this.getProvider();

    this.dataForm = this.fb.group(this.formPrepare);
    this.urlParams = [];
    this.route.queryParams
      .subscribe(params => {
          for (const i in params) {
            this.dataForm.get(i).setValue(params[i]);
          }
          for (const i in this.dataForm.controls) {
            if (this.dataForm.get(i).value) {
              const urlParam = new URLParameter();
              urlParam.key = i;
              urlParam.values = [this.dataForm.get(i).value];
              this.urlParams.push(urlParam);
            }
          }

          // this.handleChange();
          this.getPendingServices();
        },
        error => this.errorMessage = <any>error
      );
    // this.getPendingServices();
  }

  navigate(id: string) {
    this.router.navigate([`/provider/` + this.providerId + `/draft-resource/update/`, id]);
  }

  getProvider() {
    this.providerService.getServiceProviderBundleById(this.providerId).subscribe(
      providerBundle => {
        this.providerBundle = providerBundle;
      }, error => {
        console.log(error);
      }
    );
  }

  getPendingServices() {
    this.providerService.getPendingServicesByProvider(this.providerId, this.dataForm.get('from').value,
      this.itemsPerPage + '', 'ASC', 'name')
      .subscribe(res => {
          this.providerServices = res;
          this.total = res['total'];
          this.paginationInit();
        },
        err => {
          this.errorMessage = 'An error occurred while retrieving the services of this provider. ' + err.error;
        }
      );
  }

  setSelectedService(service: InfraService) {
    this.selectedService = service;
    UIkit.modal('#actionModal').show();
  }

  deleteService(id: string) {
    // UIkit.modal('#spinnerModal').show();
    this.service.deletePendingService(id).subscribe(
      res => {},
      error => {
        // console.log(error);
        // UIkit.modal('#spinnerModal').hide();
        this.errorMessage = 'Something went bad. ' + error.error ;
        this.getPendingServices();
      },
      () => {
        this.getPendingServices();
        // UIkit.modal('#spinnerModal').hide();
      }
    );
  }

  handleChange() {
    this.urlParams = [];
    const map: { [name: string]: string; } = {};
    for (const i in this.dataForm.controls) {
      if (this.dataForm.get(i).value !== '') {
        const urlParam = new URLParameter();
        urlParam.key = i;
        urlParam.values = [this.dataForm.get(i).value];
        this.urlParams.push(urlParam);
        map[i] = this.dataForm.get(i).value;
      }
    }

    if (this.path.includes('/provider/draft-resources')) {
      this.router.navigate([`/provider/draft-resources/` + this.providerId], {queryParams: map});
    } else {
      this.router.navigate([`/dashboard/` + this.providerId + `/draft-resources`], {queryParams: map});
    }
    // this.getPendingServices();
  }

  paginationInit() {
    this.pages = [];
    for (let i = 0; i < Math.ceil(this.total / this.itemsPerPage); i++) {
      this.pages.push(i + 1);
    }
    this.currentPage = (this.dataForm.get('from').value / this.itemsPerPage) + 1;
    this.pageTotal = Math.ceil(this.total / this.itemsPerPage);
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.dataForm.get('from').setValue((this.currentPage - 1) * this.itemsPerPage);
    this.handleChange();
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.dataForm.get('from').setValue(+this.dataForm.get('from').value - +this.itemsPerPage);
      this.handleChange();
    }
  }

  nextPage() {
    if (this.currentPage < this.pageTotal - 1) {
      this.currentPage++;
      this.dataForm.get('from').setValue(+this.dataForm.get('from').value + +this.itemsPerPage);
      this.handleChange();
    }
  }

}
