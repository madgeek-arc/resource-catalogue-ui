import {Component, DestroyRef, Input, OnInit} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import { Provider, ProviderBundle, Datasource, DatasourceBundle} from '../../../../domain/eic-model';
import {ServiceProviderService} from '../../../../services/service-provider.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ResourceService} from '../../../../services/resource.service';
import {Paging} from '../../../../domain/paging';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {URLParameter} from '../../../../domain/url-parameter';
import {environment} from '../../../../../environments/environment';
import {NavigationService} from "../../../../services/navigation.service";
import {DatasourceService} from "../../../../services/datasource.service";

declare let UIkit: any;

@Component({
    selector: 'app-draft-datasources',
    templateUrl: './draft-datasources.component.html',
    standalone: false
})

export class DraftDatasourcesComponent implements OnInit {

  formPrepare = {
    from: '0'
  };

  dataForm: UntypedFormGroup;

  errorMessage = '';
  urlParams: URLParameter[] = [];
  providerId: string;
  catalogueId: string;
  providerBundle: ProviderBundle;
  providerDatasources: Paging<DatasourceBundle>;
  selectedDatasource: DatasourceBundle = null;
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
    private datasourceService: DatasourceService,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    // this.path = this.route.snapshot.routeConfig.path;
    this.path = window.location.pathname;
    // console.log('this.path --> ', this.path);
    // console.log('window.location.pathname --> ', window.location.pathname);

    if (this.path.includes('dashboard')) {
      this.providerId = this.route.parent.snapshot.paramMap.get('provider');
      this.catalogueId = this.route.parent.snapshot.paramMap.get('catalogueId');
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
          this.getDraftDatasources();
        },
        error => this.errorMessage = <any>error
      );
  }

  navigate(bundle: DatasourceBundle) {
    this.router.navigate([`/provider/` + this.providerId + `/draft-datasource/update/`, bundle.id]);
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

  getDraftDatasources() {
    this.datasourceService.getDraftDatasourcesByProvider(this.providerId, this.dataForm.get('from').value,
      this.itemsPerPage + '', 'ASC', 'name')
      .subscribe(res => {
          this.providerDatasources = res;
          this.total = res['total'];
          this.paginationInit();
        },
        err => {
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
    this.datasourceService.deleteDraftDatasource(bundle.id).subscribe(
      res => {window.location.reload()},
      err => {
        // UIkit.modal('#spinnerModal').hide();
        this.errorMessage = (err?.status >= 500 && err?.status < 600)
            ? `Something went wrong. If the issue persists, please contact support and provide the following error code: ${err?.error?.traceId}`
            : `Something went bad, server responded: ${err?.error?.detail}`;
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

    if (this.path.includes('/provider/draft-datasources')) {
      this.router.navigate([`/provider/draft-datasources/` + this.providerId], {queryParams: map});
    } else {
      this.router.navigate([`/dashboard/` + this.providerId + `/draft-datasources`], {queryParams: map});
    }
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
