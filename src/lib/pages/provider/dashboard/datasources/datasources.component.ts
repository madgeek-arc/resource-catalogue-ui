import {Component, OnInit} from '@angular/core';
import {InfraService, ProviderBundle, Service} from '../../../../domain/eic-model';
import {ServiceProviderService} from '../../../../services/service-provider.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ResourceService} from '../../../../services/resource.service';
import {Paging} from '../../../../domain/paging';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {URLParameter} from '../../../../domain/url-parameter';
import {environment} from '../../../../../environments/environment';

declare var UIkit: any;

@Component({
  selector: 'app-services',
  templateUrl: './datasources.component.html',
  styleUrls: ['../services/service.component.css']
})

export class DatasourcesComponent implements OnInit {

  serviceORresource = environment.serviceORresource;

  formPrepare = {
    from: '0',
    quantity: '10',
    order: 'ASC',
    orderField: 'name',
    query: '',
    active: 'statusAll',
    status: ''
  };

  dataForm: FormGroup;

  errorMessage = '';
  // toggleLoading = false;
  urlParams: URLParameter[] = [];
  providerId: string;
  catalogueId: string;
  providerBundle: ProviderBundle;
  providerServices: Paging<InfraService>;
  selectedService: InfraService = null;
  path: string;

  total: number;
  // itemsPerPage = 10;
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
    this.providerId = this.route.parent.snapshot.paramMap.get('provider');
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
          this.getDatasources();
        },
        error => this.errorMessage = <any>error
      );
  }

  navigate(id: string) {
    this.router.navigate([`/dashboard/${this.catalogueId}/${this.providerId}/resource-dashboard/`, id]);
  }

  useAsTemplate(id: string) {
    this.router.navigate([`/provider/${this.providerId}/resource/add/use-template`, id]);
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

  toggleService(providerService: InfraService) {
    if (providerService.status === 'pending resource' || providerService.status === 'rejected resource') {
      this.errorMessage = `You cannot activate a ${providerService.status}.`;
      window.scrollTo(0, 0);
      return;
    }
    UIkit.modal('#spinnerModal').show();
    this.providerService.publishService(providerService.id, providerService.service.version, !providerService.active).subscribe(
      res => {},
      error => {
        this.errorMessage = 'Something went bad. ' + error.error ;
        this.getDatasources();
        UIkit.modal('#spinnerModal').hide();
        // console.log(error);
      },
      () => {
        UIkit.modal('#spinnerModal').hide();
        location.reload();
      }
    );
  }

  getDatasources() {
    this.providerService.getDatasourcesOfProvider(this.providerId, this.dataForm.get('from').value, this.dataForm.get('quantity').value,
      this.dataForm.get('order').value, this.dataForm.get('orderField').value,
      this.dataForm.get('active').value, this.dataForm.get('status').value, this.dataForm.get('query').value)
      .subscribe(res => {
          this.providerServices = res;
          this.total = res['total'];
          this.paginationInit();
        },
        err => {
          this.errorMessage = 'An error occurred while retrieving the datasources of this provider. ' + err.error;
        }
      );
  }

  setSelectedService(service: InfraService) {
    this.selectedService = service;
    UIkit.modal('#actionModal').show();
  }

  deleteDatasource(id: string) {
    UIkit.modal('#spinnerModal').show();
    this.service.deleteService(id).subscribe(
      res => {},
      error => {
        UIkit.modal('#spinnerModal').hide();
        this.errorMessage = 'Something went bad. ' + error.error ;
        this.getDatasources();
      },
      () => {
        UIkit.modal('#spinnerModal').hide();
        location.reload();
      }
    );
  }

  handleChangeAndResetPage() {
    this.dataForm.get('from').setValue(0);
    this.handleChange();
  }

  handleChange() {
    this.urlParams = [];
    const map: { [name: string]: string; } = {};
    for (const i in this.dataForm.controls) {
      if (this.dataForm.get(i).value !== '' && this.dataForm.get(i).value !== 'statusAll') {
        const urlParam = new URLParameter();
        urlParam.key = i;
        urlParam.values = [this.dataForm.get(i).value];
        this.urlParams.push(urlParam);
        map[i] = this.dataForm.get(i).value;
      }
    }

    this.router.navigate([`/dashboard`, this.catalogueId, this.providerId, `resources`], {queryParams: map});
  }

  paginationInit() {
    this.pages = [];
    this.currentPage = (this.dataForm.get('from').value / (this.dataForm.get('quantity').value)) + 1;
    this.pageTotal = Math.ceil(this.total / (this.dataForm.get('quantity').value));
    for (let i = 0; i < this.pageTotal; i++) {
      this.pages.push(i + 1);
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.dataForm.get('from').setValue((this.currentPage - 1) * (this.dataForm.get('quantity').value));
    this.handleChange();
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.dataForm.get('from').setValue(+this.dataForm.get('from').value - +(this.dataForm.get('quantity').value));
      this.handleChange();
    }
  }

  nextPage() {
    if (this.currentPage < this.pageTotal) {
      this.currentPage++;
      this.dataForm.get('from').setValue(+this.dataForm.get('from').value + +(this.dataForm.get('quantity').value));
      this.handleChange();
    }
  }

}
