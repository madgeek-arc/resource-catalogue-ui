import {Component, DestroyRef, OnInit} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {AdapterBundle, ProviderBundle} from '../../../../domain/eic-model';
import {ServiceProviderService} from '../../../../services/service-provider.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Paging} from '../../../../domain/paging';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {URLParameter} from '../../../../domain/url-parameter';
import {AdaptersService} from "../../../../services/adapters.service";
import {pidHandler} from "../../../../shared/pid-handler/pid-handler.service";
import {environment} from "../../../../../environments/environment";
import {ConfigService} from "../../../../services/config.service";

declare let UIkit: any;

@Component({
    selector: 'app-adapters',
    templateUrl: './adapters.component.html',
    standalone: false
})

export class AdaptersComponent implements OnInit {

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
  // toggleLoading = false;
  urlParams: URLParameter[] = [];
  providerId: string;
  catalogueId: string;
  providerBundle: ProviderBundle;
  adapters: Paging<AdapterBundle>;
  selectedAdapter: AdapterBundle = null;
  path: string;

  numberOfResultsOnView: number;

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
    private adaptersService: AdaptersService,
    public pidHandler: pidHandler,
    public config: ConfigService,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.providerId = this.route.parent.snapshot.paramMap.get('provider');
    this.catalogueId = this.route.parent.snapshot.paramMap.get('catalogueId');

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
          this.getAdapters();
        },
        error => this.errorMessage = <any>error
      );
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

  getAdapters() {
    this.adaptersService.getAdaptersOfProvider(this.providerId, this.dataForm.get('from').value, this.dataForm.get('quantity').value,
      this.dataForm.get('order').value, this.dataForm.get('sort').value, this.dataForm.get('query').value, this.dataForm.get('status').value)
      .subscribe(res => {
          this.adapters = res;
          this.total = res['total'];
          this.numberOfResultsOnView = res['to']-res['from'];
          this.paginationInit();
        },
        err => {
          this.errorMessage = 'An error occurred while retrieving the adapters of this provider. ' + err.error;
        },
        () => {}
      );
  }

  setSelectedAdapter(adapterBundle: AdapterBundle) {
    this.selectedAdapter = adapterBundle;
    UIkit.modal('#actionModal').show();
  }

  deleteAdapter(id: string) {
    UIkit.modal('#spinnerModal').show();
    this.adaptersService.deleteAdapterById(id).subscribe(
      res => {},
      err => {
        UIkit.modal('#spinnerModal').hide();
        this.errorMessage = (err?.status >= 500 && err?.status < 600)
            ? `Something went wrong. If the issue persists, please contact support and provide the following error code: ${err?.error?.traceId}`
            : `Something went bad, server responded: ${err?.error?.detail}`;
        this.getAdapters();
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
      if (this.dataForm.get(i).value !== '') {
        const urlParam = new URLParameter();
        urlParam.key = i;
        urlParam.values = [this.dataForm.get(i).value];
        this.urlParams.push(urlParam);
        map[i] = this.dataForm.get(i).value;
      }
    }

    this.router.navigate([`/dashboard`, this.providerId, `adapters`], {queryParams: map});
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

  protected readonly environment = environment;
}
