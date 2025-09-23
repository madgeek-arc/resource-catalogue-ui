import {Component, OnInit} from '@angular/core';
import {ServiceBundle, ProviderBundle, Service, Datasource} from '../../../../domain/eic-model';
import {ServiceProviderService} from '../../../../services/service-provider.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ResourceService} from '../../../../services/resource.service';
import {Paging} from '../../../../domain/paging';
import {FormArray, UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {URLParameter} from '../../../../domain/url-parameter';
import {ConfigService} from "../../../../services/config.service";
import {environment} from '../../../../../environments/environment';
import {ServiceExtensionsService} from "../../../../services/service-extensions.service";
import {pidHandler} from "../../../../shared/pid-handler/pid-handler.service";

declare var UIkit: any;

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./service.component.css']
})

export class ServicesComponent implements OnInit {
  catalogueConfigId: string = this.config.getProperty('catalogueId');
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
  providerServices: Paging<ServiceBundle>;
  // providerCoverage: string[];
  // providerServicesGroupedByPlace: any;
  selectedService: ServiceBundle = null;
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
    private resourceService: ResourceService,
    private serviceExtensionsService: ServiceExtensionsService,
    public pidHandler: pidHandler,
    public config: ConfigService
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
          this.getServices();
        },
        error => this.errorMessage = <any>error
      );
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

  toggleService(bundle: ServiceBundle) {
    if (bundle.status === 'pending resource' || bundle.status === 'rejected resource') {
      this.errorMessage = `You cannot activate a ${bundle.status}.`;
      window.scrollTo(0, 0);
      return;
    }
    UIkit.modal('#spinnerModal').show();
    this.providerService.publishService(bundle.id, bundle.service.version, !bundle.active).subscribe(
      res => {},
      error => {
        UIkit.modal('#spinnerModal').hide();
        this.errorMessage = 'Something went bad. ' + error.error.error ;
      },
      () => {
        UIkit.modal('#spinnerModal').hide();
        location.reload();
      }
    );
  }

  getServices() {
    this.providerService.getServicesOfProvider(this.providerId, this.catalogueId, this.dataForm.get('from').value, this.dataForm.get('quantity').value,
      this.dataForm.get('order').value, this.dataForm.get('sort').value,
      this.dataForm.get('active').value, this.dataForm.get('status').value, this.dataForm.get('query').value)
      .subscribe(res => {
          this.providerServices = res;
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
            this.serviceExtensionsService.getMonitoringStatus(this.providerServices.results[i].id).subscribe(
              monitoringStatus => {
                if(monitoringStatus) { this.statusesOnView.push(monitoringStatus[0].value) }
                else { this.statusesOnView.push('NA') } //no response hence Not Available status (NA)
             },
              err => { this.errorMessage = 'An error occurred while retrieving data for a service. ' + err.error; }
            );
          }
        }
      );
  }

  setSelectedService(service: ServiceBundle) {
    this.selectedService = service;
    UIkit.modal('#actionModal').show();
  }

  deleteService(bundle: ServiceBundle) {
    UIkit.modal('#spinnerModal').show();
    this.resourceService[bundle.service ? 'deleteService' : 'deleteDatasource'](bundle.id).subscribe( //todo: seems outdated
      res => {},
      error => {
        UIkit.modal('#spinnerModal').hide();
        this.errorMessage = 'Something went bad. ' + error.error ;
        this.getServices();
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
