import {Component, DestroyRef, OnInit} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {CatalogueBundle, ServiceBundle, ProviderBundle, Service} from '../../../../domain/eic-model';
import {ServiceProviderService} from '../../../../services/service-provider.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ResourceService} from '../../../../services/resource.service';
import {Paging} from '../../../../domain/paging';
import {FormArray, UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {URLParameter} from '../../../../domain/url-parameter';
import {ConfigService} from "../../../../services/config.service";
import {environment} from '../../../../../environments/environment';
import {CatalogueService} from "../../../../services/catalogue.service";

declare let UIkit: any;

@Component({
    selector: 'app-catalogue-providers',
    templateUrl: './catalogue-providers.component.html',
    standalone: false
})

export class CatalogueProvidersComponent implements OnInit {
  protected readonly environment = environment;
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

  dataForm: UntypedFormGroup;

  errorMessage = '';
  toggleLoading = false;
  urlParams: URLParameter[] = [];
  catalogueId;
  catalogueBundle: CatalogueBundle;
  catalogueProviders: any; //Paging<ProviderBundle>;
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
    private fb: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private providerService: ServiceProviderService,
    private catalogueService: CatalogueService,
    private resourceService: ResourceService,
    private service: ResourceService,
    private config: ConfigService,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.catalogueId = this.route.parent.snapshot.paramMap.get('catalogue');

    this.getCatalogue();

    this.dataForm = this.fb.group(this.formPrepare);
    this.urlParams = [];
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
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
    console.log(this.catalogueId);
    this.toggleLoading = true;
    this.resourceService.getProviderBundles(this.dataForm.get('from').value, this.dataForm.get('quantity').value,
      this.dataForm.get('sort').value, this.dataForm.get('order').value, this.dataForm.get('query').value,
      null, null, this.dataForm.get('status').value, [], [], this.catalogueId ? [this.catalogueId] : [])
      .subscribe(res => {
          this.toggleLoading = false;
          this.catalogueProviders = res;
          console.log(this.catalogueProviders)
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
      err => {
        // UIkit.modal('#spinnerModal').hide();
        this.errorMessage = (err?.status >= 500 && err?.status < 600)
            ? `Something went wrong. If the issue persists, please contact support and provide the following error code: ${err?.error?.traceId}`
            : `Something went bad, server responded: ${err?.error?.detail}`;
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
