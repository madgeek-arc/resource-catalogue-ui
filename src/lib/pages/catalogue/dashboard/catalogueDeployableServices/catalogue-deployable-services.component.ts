import {Component, OnInit} from '@angular/core';
import {CatalogueBundle, DeployableServiceBundle} from '../../../../domain/eic-model';
import {ActivatedRoute, Router} from '@angular/router';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {URLParameter} from '../../../../domain/url-parameter';
import {CatalogueService} from "../../../../services/catalogue.service";
import {DeployableServiceService} from "../../../../services/deployable-service.service";
import {environment} from '../../../../../environments/environment';

declare var UIkit: any;

@Component({
  selector: 'app-catalogue-deployable-services',
  templateUrl: './catalogue-deployable-services.component.html',
  styleUrls: ['../../../provider/dashboard/services/service.component.css']
})

export class CatalogueDeployableServicesComponent implements OnInit {

  protected readonly environment = environment;

  formPrepare = {
    from: '0',
    quantity: '10',
    order: 'ASC',
    sort: 'name',
    query: '',
    active: '',
    status: '',
    catalogue_id: new UntypedFormArray([])
  };

  dataForm: UntypedFormGroup;

  errorMessage = '';
  toggleLoading = false;
  urlParams: URLParameter[] = [];
  catalogueId;
  catalogueBundle: CatalogueBundle;
  deployableServiceBundles: DeployableServiceBundle[] = new Array<DeployableServiceBundle>();
  selectedDeployableService: DeployableServiceBundle = null;
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
    private catalogueService: CatalogueService,
    private deployableServiceService: DeployableServiceService
  ) {}

  ngOnInit(): void {
    this.catalogueId = this.route.parent.snapshot.paramMap.get('catalogue');

    this.getCatalogue();

    this.dataForm = this.fb.group(this.formPrepare);
    (this.dataForm.get('catalogue_id') as UntypedFormArray).push(new UntypedFormControl(this.catalogueId));
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
          this.getDeployableServices();
        },
        error => this.errorMessage = <any>error
      );
  }

  // navigate(resourceId: string) {
  //   this.router.navigate([`/dashboard/${this.catalogueId}/${resourceId.split('.')[0]}/deployable-service-dashboard/`, resourceId]);
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

  toggleDeployableService(bundle: DeployableServiceBundle) {
    if (bundle.status === 'pending resource' || bundle.status === 'rejected resource') {
      this.errorMessage = `You cannot activate a ${bundle.status}.`;
      window.scrollTo(0, 0);
      return;
    }
    this.toggleLoading = true;
    this.deployableServiceService.publishDeployableService(bundle.id, !bundle.active).subscribe(
      res => {},
      error => {
        this.errorMessage = 'Something went bad. ' + error.error ;
        this.getDeployableServices();
        this.toggleLoading = false;
        // console.log(error);
      },
      () => {
        this.getDeployableServices();
        this.toggleLoading = false;
      }
    );
  }

  getDeployableServices() {
    this.toggleLoading = true;
    this.catalogueService.getDeployableServicesOfCatalogue(this.dataForm.get('catalogue_id').value,
      this.dataForm.get('from').value, this.dataForm.get('quantity').value,
      this.dataForm.get('order').value, this.dataForm.get('sort').value,
      this.dataForm.get('status').value, this.dataForm.get('query').value).subscribe(
      res => {
          this.toggleLoading = false;
          this.deployableServiceBundles = res['results'];
          this.total = res['total'];
          this.paginationInit();
        },
        err => {
          this.toggleLoading = false;
          this.errorMessage = 'An error occurred while retrieving the deployable services of this provider. ' + err.error;
        }
      );
  }

  setSelectedDeployableService(bundle: DeployableServiceBundle) {
    this.selectedDeployableService = bundle;
    UIkit.modal('#actionModal').show();
  }

  deleteDeployableService(id: string) {
    // UIkit.modal('#spinnerModal').show();
    this.deployableServiceService.deleteDeployableService(id).subscribe(
      res => {},
      error => {
        // console.log(error);
        // UIkit.modal('#spinnerModal').hide();
        this.errorMessage = 'Something went bad. ' + error.error ;
        this.getDeployableServices();
      },
      () => {
        this.getDeployableServices();
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

    this.router.navigate([`/catalogue-dashboard/` + this.catalogueId + `/deployable-services`], {queryParams: map});
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
