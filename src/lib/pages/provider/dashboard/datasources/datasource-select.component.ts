import {Component, OnInit} from '@angular/core';
import {Datasource, InfraService, ProviderBundle, Service} from '../../../../domain/eic-model';
import {ServiceProviderService} from '../../../../services/service-provider.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ResourceService} from '../../../../services/resource.service';
import {Paging} from '../../../../domain/paging';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {URLParameter} from '../../../../domain/url-parameter';
import {environment} from '../../../../../environments/environment';
import {DatasourceService} from "../../../../services/datasource.service";

declare var UIkit: any;

@Component({
  selector: 'app-services',
  templateUrl: './datasource-select.component.html',
  styleUrls: ['../services/service.component.css']
})

export class DatasourceSelectComponent implements OnInit {

  serviceORresource = environment.serviceORresource;

  formPrepare = {
    from: '0',
    quantity: '10',
    order: 'ASC',
    orderField: 'name',
    query: '',
  };

  dataForm: FormGroup;

  errorMessage = '';
  // toggleLoading = false;
  urlParams: URLParameter[] = [];
  providerId: string;
  catalogueId: string;
  providerBundle: ProviderBundle;
  datasources: Paging<Datasource>;
  selectedDatasource: Datasource = null;
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
    private service: ResourceService,
    private datasourceService: DatasourceService
  ) {}

  ngOnInit(): void {
    this.providerId = this.route.snapshot.paramMap.get('providerId');

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
          this.getOpenAIREDatasources();
        },
        error => this.errorMessage = <any>error
      );
  }

  navigate(id: string) {
    // this.router.navigate([`/dashboard/${this.catalogueId}/${this.providerId}/resource-dashboard/`, id]);
  }

  getProvider() {
    this.providerService.getServiceProviderBundleById(this.providerId, this.catalogueId).subscribe(
      providerBundle => this.providerBundle = providerBundle,
      error => console.log(error)
    );
  }

  getOpenAIREDatasources() {
    UIkit.modal('#spinnerModal').show();
    this.datasourceService.getOpenAIREDatasources(this.dataForm.get('from').value, this.dataForm.get('quantity').value,
      this.dataForm.get('orderField').value, this.dataForm.get('order').value, this.dataForm.get('query').value)
      .subscribe(res => {
          this.datasources = res;
          this.total = res['total'];
          this.paginationInit();
        },
        err => {
          UIkit.modal('#spinnerModal').hide();
          this.errorMessage = 'An error occurred while retrieving the datasources of this provider. ' + err.error;
        },
        () => UIkit.modal('#spinnerModal').hide()
      );
  }

  handleSelectedDatasource(datasource: Datasource) {
    this.selectedDatasource = datasource;

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

    this.router.navigate([`/provider/${this.providerId}/datasource/select`], {queryParams: map});
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
