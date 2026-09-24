import {Component, DestroyRef, OnInit} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {CatalogueBundle, ProviderBundle} from '../../../../domain/eic-model';
import {ServiceProviderService} from '../../../../services/service-provider.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Paging} from '../../../../domain/paging';
import {FormArray, UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {URLParameter} from '../../../../domain/url-parameter';
import {ConfigService} from "../../../../services/config.service";
import {environment} from '../../../../../environments/environment';
import {ServiceExtensionsService} from "../../../../services/service-extensions.service";
import {pidHandler} from "../../../../shared/pid-handler/pid-handler.service";
import {CatalogueService} from "../../../../services/catalogue.service";

declare let UIkit: any;

@Component({
    selector: 'app-catalogues',
    templateUrl: './catalogues.component.html',
    standalone: false
})

export class CataloguesComponent implements OnInit {

  protected readonly environment = environment;
  serviceORresource = environment.serviceORresource;

  formPrepare = {
    from: '0',
    quantity: '10',
    order: 'ASC',
    sort: 'name',
    query: '',
    active: 'statusAll',
    status: ''
  };

  dataForm: UntypedFormGroup;

  errorMessage = '';
  // toggleLoading = false;
  urlParams: URLParameter[] = [];
  providerId: string;
  catalogueId: string;
  providerBundle: ProviderBundle;
  catalogues: Paging<CatalogueBundle>;
  // providerCoverage: string[];
  // providerServicesGroupedByPlace: any;
  seletectedCatalogue: CatalogueBundle = null;
  path: string;

  numberOfServicesOnView: number;
  statusesOnView = [];

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
    private serviceExtensionsService: ServiceExtensionsService,
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
          this.getCatalogues();
        },
        error => this.errorMessage = <any>error
      );
  }

  useAsTemplate(id: string) {
    this.router.navigate([`/provider/${this.providerId}/catalogue/add/use-template`, id]);
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

  toggleCatalogue(bundle: CatalogueBundle) {
    if (bundle.status === 'pending' || bundle.status === 'rejected') {
      this.errorMessage = `You cannot activate a ${bundle.status} catalogue.`;
      window.scrollTo(0, 0);
      return;
    }
    UIkit.modal('#spinnerModal').show();
    this.catalogueService.activateCatalogue(bundle.id, !bundle.active).subscribe(
      res => {},
      err => {
        this.errorMessage = (err?.status >= 500 && err?.status < 600)
            ? `Something went wrong. If the issue persists, please contact support and provide the following error code: ${err?.error?.traceId}`
            : `Something went bad, server responded: ${err?.error?.detail}`;
        this.getCatalogues();
        UIkit.modal('#spinnerModal').hide();
        // console.log(error);
      },
      () => {
        UIkit.modal('#spinnerModal').hide();
        location.reload();
      }
    );
  }

  getCatalogues() {
    this.providerService.getCataloguesOfProvider(this.providerId, this.dataForm.get('from').value, this.dataForm.get('quantity').value,
      this.dataForm.get('order').value, this.dataForm.get('sort').value,
      this.dataForm.get('active').value, this.dataForm.get('status').value, this.dataForm.get('query').value)
      .subscribe(res => {
          this.catalogues = res;
          this.total = res['total'];
          this.numberOfServicesOnView = res['to']-res['from'];
          this.paginationInit();
        },
        err => {
          this.errorMessage = 'An error occurred while retrieving the services of this provider. ' + err.error;
        },
        () => {
          this.statusesOnView = [];
          for (let i = 0; i < this.numberOfServicesOnView; i++) {
            this.serviceExtensionsService.getMonitoringStatus(this.catalogues.results[i].id).subscribe(
              monitoringStatus => {
                if(monitoringStatus) { this.statusesOnView.push(monitoringStatus[0].value) }
                else { this.statusesOnView.push('NA') } //no response hence Not Available status (NA)
              },
              err => { this.errorMessage = 'An error occurred while retrieving data for a catalogue. ' + err.error; }
            );
          }
        }
      );
  }

  setSelectedCatalogue(bundle: CatalogueBundle) {
    this.seletectedCatalogue = bundle;
    UIkit.modal('#actionModal').show();
  }

  deleteCatalogue(id: string) {
    UIkit.modal('#spinnerModal').show();
    this.catalogueService.deleteCatalogue(id).subscribe(
      res => {},
      err => {
        UIkit.modal('#spinnerModal').hide();
        this.errorMessage = (err?.status >= 500 && err?.status < 600)
            ? `Something went wrong. If the issue persists, please contact support and provide the following error code: ${err?.error?.traceId}`
            : `Something went bad, server responded: ${err?.error?.detail}`;
        this.getCatalogues();
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

    this.router.navigate([`/dashboard`, this.providerId, `catalogues`], {queryParams: map});
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
