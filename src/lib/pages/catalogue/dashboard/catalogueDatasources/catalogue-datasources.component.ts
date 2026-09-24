import {Component, DestroyRef, OnInit} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {CatalogueBundle, DatasourceBundle} from '../../../../domain/eic-model';
import {ServiceProviderService} from '../../../../services/service-provider.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Paging} from '../../../../domain/paging';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {URLParameter} from '../../../../domain/url-parameter';
import {CatalogueService} from "../../../../services/catalogue.service";
import {DatasourceService} from "../../../../services/datasource.service";

declare let UIkit: any;

@Component({
    selector: 'app-catalogue-datasources',
    templateUrl: './catalogue-datasources.component.html',
    standalone: false
})

export class CatalogueDatasourcesComponent implements OnInit {

  formPrepare = {
    order: 'ASC',
    sort: 'name',
    from: '0',
    quantity: '10',
    active: '',
    query: '',
    status: '',
    // status: new FormArray([]),
    catalogue_id: new UntypedFormArray([])
  };

  dataForm: UntypedFormGroup;

  errorMessage = '';
  toggleLoading = false;
  urlParams: URLParameter[] = [];
  catalogueId;
  catalogueBundle: CatalogueBundle;
  // datasources: Paging<DatasourceBundle>;
  datasources: DatasourceBundle[] = new Array<DatasourceBundle>();
  selectedDatasource: DatasourceBundle = null; //TODO: change to Datasource
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
    private datasourceService: DatasourceService,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.catalogueId = this.route.parent.snapshot.paramMap.get('catalogue');

    this.getCatalogue();

    this.dataForm = this.fb.group(this.formPrepare);
    (this.dataForm.get('catalogue_id') as UntypedFormArray).push(new UntypedFormControl(this.catalogueId));
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
          this.getDatasources();
        },
        error => this.errorMessage = <any>error
      );
  }

  // navigate(serviceId: string) {
  //   this.router.navigate([`/dashboard/${this.catalogueId}/${serviceId.split('.')[0]}/resource-dashboard/`, serviceId]);
  // }

  getCatalogue() {
    this.catalogueService.getCatalogueBundleById(this.catalogueId).subscribe(
      catalogueBundle => {
        this.catalogueBundle = catalogueBundle;
      }, error => {
        console.log(error);
      }
    );
  }

  toggleDatasource(bundle: DatasourceBundle) {
    if (bundle.status === 'pending' || bundle.status === 'rejected') {
      this.errorMessage = `You cannot activate a ${bundle.status}.`;
      window.scrollTo(0, 0);
      return;
    }
    this.toggleLoading = true;
    this.providerService.activateDatasource(bundle.id, bundle.datasource.version, !bundle.active).subscribe(
      res => {},
      err => {
        this.errorMessage = (err?.status >= 500 && err?.status < 600)
            ? `Something went wrong. If the issue persists, please contact support and provide the following error code: ${err?.error?.traceId}`
            : `Something went bad, server responded: ${err?.error?.details}`;
        this.getDatasources();
        this.toggleLoading = false;
        // console.log(error);
      },
      () => {
        this.getDatasources();
        this.toggleLoading = false;
      }
    );
  }

  getDatasources() {
    this.toggleLoading = true;
    this.datasourceService.getDatasourceBundles(this.dataForm.get('from').value, this.dataForm.get('quantity').value,
      this.dataForm.get('sort').value, this.dataForm.get('order').value, this.dataForm.get('query').value,
      null, null, this.dataForm.get('status').value, [], [], this.catalogueId ? [this.catalogueId] : []).subscribe(
        res => {
          this.toggleLoading = false;
          this.datasources = res['results'];
          // this.facets = res['facets'];
          this.total = res['total'];
          // this.numberOfServicesOnView = res['to']-res['from'];
          this.paginationInit();
        },
        err => {
          this.toggleLoading = false;
          this.errorMessage = 'An error occurred while retrieving the datasources of this provider. ' + err.error;
        }
      );
  }

  setSelectedDatasource(bundle: DatasourceBundle) {
    this.selectedDatasource = bundle;
    UIkit.modal('#actionModal').show();
  }

  deleteDatasource(bundle: DatasourceBundle) {
    // UIkit.modal('#spinnerModal').show();
    this.datasourceService.deleteDatasource(bundle.id).subscribe(
      res => {},
      err => {
        // console.log(error);
        // UIkit.modal('#spinnerModal').hide();
        this.errorMessage = (err?.status >= 500 && err?.status < 600)
            ? `Something went wrong. If the issue persists, please contact support and provide the following error code: ${err?.error?.traceId}`
            : `Something went bad, server responded: ${err?.error?.details}`;
        this.getDatasources();
      },
      () => {
        this.getDatasources();
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

    this.router.navigate([`/catalogue-dashboard/` + this.catalogueId + `/datasources`], {queryParams: map});
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
