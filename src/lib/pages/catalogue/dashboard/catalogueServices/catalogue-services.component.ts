import {Component, OnInit} from '@angular/core';
import {CatalogueBundle, ServiceBundle, Service, Datasource} from '../../../../domain/eic-model';
import {ServiceProviderService} from '../../../../services/service-provider.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ResourceService} from '../../../../services/resource.service';
import {Paging} from '../../../../domain/paging';
import {FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {URLParameter} from '../../../../domain/url-parameter';
import {environment} from '../../../../../environments/environment';
import {CatalogueService} from "../../../../services/catalogue.service";

declare var UIkit: any;

@Component({
  selector: 'app-catalogue-services',
  templateUrl: './catalogue-services.component.html',
  styleUrls: ['../../../provider/dashboard/services/service.component.css']
})

export class CatalogueServicesComponent implements OnInit {

  serviceORresource = environment.serviceORresource;

  formPrepare = {
    order: 'ASC',
    orderField: 'name',
    from: '0',
    quantity: '10',
    active: '',
    query: '',
    status: '',
    // status: new FormArray([]),
    catalogue_id: new FormArray([])
  };

  dataForm: FormGroup;

  errorMessage = '';
  toggleLoading = false;
  urlParams: URLParameter[] = [];
  catalogueId;
  catalogueBundle: CatalogueBundle;
  // services: Paging<ServiceBundle>;
  services: ServiceBundle[] = new Array<ServiceBundle>();
  selectedService: ServiceBundle = null;
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
    private resourceService: ResourceService
  ) {}

  ngOnInit(): void {
    this.catalogueId = this.route.parent.snapshot.paramMap.get('catalogue');

    this.getCatalogue();

    this.dataForm = this.fb.group(this.formPrepare);
    (this.dataForm.get('catalogue_id') as FormArray).push(new FormControl(this.catalogueId));
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

  getPayload(bundle : ServiceBundle): Service | Datasource {
    return bundle.service != null ? bundle.service : bundle.datasource;
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

  toggleService(bundle: ServiceBundle) {
    if (bundle.status === 'pending resource' || bundle.status === 'rejected resource') {
      this.errorMessage = `You cannot activate a ${bundle.status}.`;
      window.scrollTo(0, 0);
      return;
    }
    this.toggleLoading = true;
    this.providerService[bundle.service ? 'publishService' : 'publishDatasource'](bundle.id, this.getPayload(bundle).version, !bundle.active).subscribe(
      res => {},
      error => {
        this.errorMessage = 'Something went bad. ' + error.error ;
        this.getServices();
        this.toggleLoading = false;
        // console.log(error);
      },
      () => {
        this.getServices();
        this.toggleLoading = false;
      }
    );
  }

  getServices() {
    this.toggleLoading = true;
    this.resourceService.getResourceBundles(this.dataForm.get('from').value, this.dataForm.get('quantity').value,
      this.dataForm.get('orderField').value, this.dataForm.get('order').value, this.dataForm.get('query').value,
      this.dataForm.get('active').value, null,
      this.dataForm.get('status').value, null, this.dataForm.get('catalogue_id').value).subscribe(
        res => {
          this.toggleLoading = false;
          this.services = res['results'];
          // this.facets = res['facets'];
          this.total = res['total'];
          // this.numberOfServicesOnView = res['to']-res['from'];
          this.paginationInit();
        },
        err => {
          this.toggleLoading = false;
          this.errorMessage = 'An error occurred while retrieving the services of this provider. ' + err.error;
        }
      );
  }

  setSelectedService(bundle: ServiceBundle) {
    this.selectedService = bundle;
    UIkit.modal('#actionModal').show();
  }

  deleteService(bundle: ServiceBundle) {
    // UIkit.modal('#spinnerModal').show();
    this.resourceService[bundle.service ? 'deleteService' : 'deleteDatasource'](bundle.id).subscribe(
      res => {},
      error => {
        // console.log(error);
        // UIkit.modal('#spinnerModal').hide();
        this.errorMessage = 'Something went bad. ' + error.error ;
        this.getServices();
      },
      () => {
        this.getServices();
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

    this.router.navigate([`/catalogue-dashboard/` + this.catalogueId + `/services`], {queryParams: map});
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
