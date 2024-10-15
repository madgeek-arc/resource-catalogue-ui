import {Component, OnInit} from '@angular/core';
import {CatalogueBundle, ServiceBundle, ProviderBundle, Service} from '../../../../domain/eic-model';
import {ServiceProviderService} from '../../../../services/service-provider.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ResourceService} from '../../../../services/resource.service';
import {Paging} from '../../../../domain/paging';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {URLParameter} from '../../../../domain/url-parameter';
import {environment} from '../../../../../environments/environment';
import {CatalogueService} from "../../../../services/catalogue.service";

declare var UIkit: any;

@Component({
  selector: 'app-catalogue-providers',
  templateUrl: './catalogue-providers.component.html',
  styleUrls: ['../../../provider/dashboard/services/service.component.css']
})

export class CatalogueProvidersComponent implements OnInit {

  serviceORresource = environment.serviceORresource;

  formPrepare = {
    from: '0',
    quantity: '10',
    order: 'ASC',
    sort: 'name',
    query: '',
    // active: 'statusAll',
    status: ''
  };

  dataForm: FormGroup;

  errorMessage = '';
  toggleLoading = false;
  urlParams: URLParameter[] = [];
  catalogueId;
  catalogueBundle: CatalogueBundle;
  catalogueProviders: Paging<ProviderBundle>; // change to providerBundle
  // providerCoverage: string[];
  // providerServicesGroupedByPlace: any;
  selectedProvider: ProviderBundle = null;
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
    private catalogueService: CatalogueService,
    private service: ResourceService
  ) {}

  ngOnInit(): void {
    this.catalogueId = this.route.parent.snapshot.paramMap.get('catalogue');

    this.getCatalogue();

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
          this.getProviders();
        },
        error => this.errorMessage = <any>error
      );
  }

  navigate(id: string) {
    this.router.navigate([`/dashboard/${this.catalogueId}/${id}`]);
  }

  getCatalogue() {
    this.catalogueService.getCatalogueBundleById(this.catalogueId).subscribe(
      catalogueBundle => {
        this.catalogueBundle = catalogueBundle;
      }, error => {
        console.log(error);
      }
    );
  }

  getProviders() {
    this.toggleLoading = true;
    this.catalogueService.getProvidersOfCatalogue(this.catalogueId, this.dataForm.get('from').value, this.dataForm.get('quantity').value,
      this.dataForm.get('order').value, this.dataForm.get('sort').value,
      this.dataForm.get('status').value, this.dataForm.get('query').value)
      .subscribe(res => {
          this.toggleLoading = false;
          this.catalogueProviders = res;
          this.total = res['total'];
          this.paginationInit();
        },
        err => {
          this.toggleLoading = false;
          this.errorMessage = 'An error occurred while retrieving the services of this provider. ' + err.error;
        }
      );
  }

  setSelectedProvider(provider: ProviderBundle) {
    this.selectedProvider = provider;
    UIkit.modal('#actionModal').show();
  }

  deleteProvider(id: string) {
    // UIkit.modal('#spinnerModal').show();
    this.providerService.deleteServiceProvider(id).subscribe(
      res => {},
      error => {
        // console.log(error);
        // UIkit.modal('#spinnerModal').hide();
        this.errorMessage = 'Something went bad. ' + error.error ;
        this.getProviders();
      },
      () => {
        this.getProviders();
        // UIkit.modal('#spinnerModal').hide();
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

    this.router.navigate([`/catalogue-dashboard/` + this.catalogueId + `/providers`], {queryParams: map});
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
