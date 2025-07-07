import {Component, Input, OnInit} from '@angular/core';
import {ServiceBundle, Provider, ProviderBundle, Service} from '../../../../domain/eic-model';
import {ServiceProviderService} from '../../../../services/service-provider.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ResourceService} from '../../../../services/resource.service';
import {Paging} from '../../../../domain/paging';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {URLParameter} from '../../../../domain/url-parameter';
import {environment} from '../../../../../environments/environment';
import {NavigationService} from "../../../../services/navigation.service";

declare var UIkit: any;

@Component({
  selector: 'app-rejected-services',
  templateUrl: './rejected-services.component.html',
})

export class RejectedServicesComponent implements OnInit {

  serviceORresource = environment.serviceORresource;

  formPrepare = {
    from: '0'
  };

  dataForm: UntypedFormGroup;

  errorMessage = '';
  urlParams: URLParameter[] = [];
  providerId: string;
  catalogueId: string;
  providerBundle: ProviderBundle;
  providerServices: Paging<ServiceBundle>;
  selectedService: ServiceBundle = null;
  path: string;

  total: number;
  itemsPerPage = 10;
  currentPage = 1;
  pageTotal: number;
  pages: number[] = [];


  constructor(
    private fb: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private navigator: NavigationService,
    private providerService: ServiceProviderService,
    private service: ResourceService
  ) {}

  ngOnInit(): void {
    this.path = window.location.pathname;
    this.providerId = this.route.snapshot.paramMap.get('providerId');
    this.catalogueId = this.route.parent.snapshot.paramMap.get('catalogueId');

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
          this.getRejectedResources();
        },
        error => this.errorMessage = <any>error
      );
    // this.getPendingServices();
  }

  navigate(id: string) {
    this.router.navigate([`/provider/` + this.providerId + `/resource/update/`, id]);
  }

  getProvider() {
    this.providerService.getServiceProviderBundleById(this.providerId, this.catalogueId).subscribe(
      providerBundle => {
        this.providerBundle = providerBundle;
      }, error => {
        console.log(error);
      }
    );
  }

  getRejectedResources() {
    this.providerService.getRejectedResourcesOfProvider(this.providerId, this.dataForm.get('from').value,
      this.itemsPerPage + '', 'ASC', 'name', 'service')
      .subscribe(res => {
          this.providerServices = res;
          this.total = res['total'];
          this.paginationInit();
        },
        err => {
          this.errorMessage = 'An error occurred while retrieving the services of this provider. ' + err.error;
        },
        () => {
        // console.log(this.providerServices)
      }
      );
  }

  setSelectedService(service: ServiceBundle) {
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
        this.getRejectedResources();
      },
      () => {
        this.getRejectedResources();
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

    if (this.path.includes('/provider/rejected-resources')) {
      this.router.navigate([`/provider/rejected-resources/` + this.providerId], {queryParams: map});
    }
    // else {
    //   this.router.navigate([`/dashboard/` + this.providerId + `/rejected-resources`], {queryParams: map});
    // }
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
