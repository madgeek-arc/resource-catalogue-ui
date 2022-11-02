import {Component, OnInit} from '@angular/core';
import {CatalogueBundle, DatasourceBundle, ProviderBundle} from '../../../../domain/eic-model';
import {ServiceProviderService} from '../../../../services/service-provider.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Paging} from '../../../../domain/paging';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {URLParameter} from '../../../../domain/url-parameter';
import {environment} from '../../../../../environments/environment';
import {CatalogueService} from "../../../../services/catalogue.service";
import {DatasourceService} from "../../../../services/datasource.service";

declare var UIkit: any;

@Component({
  selector: 'app-catalogue-datasources',
  templateUrl: './catalogue-datasources.component.html',
  styleUrls: ['../../../provider/dashboard/services/service.component.css']
})

export class CatalogueDatasourcesComponent implements OnInit {

  formPrepare = {
    from: '0',
    quantity: '10',
    order: 'ASC',
    orderField: 'name',
    query: '',
    active: 'statusAll',
    status: ''
  };

  dataForm: FormGroup;

  errorMessage = '';
  toggleLoading = false;
  urlParams: URLParameter[] = [];
  catalogueId;
  catalogueBundle: CatalogueBundle;
  datasourceBundles: Paging<DatasourceBundle>;
  selectedDatasource: DatasourceBundle = null;
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
    private datasourceService: DatasourceService
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
          this.getDatasources();
        },
        error => this.errorMessage = <any>error
      );
  }

  navigate(datasourceId: string) {
    this.router.navigate([`/dashboard/${this.catalogueId}/${datasourceId.split('.')[0]}/datasource-dashboard/`, datasourceId]);
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

  toggleDatasource(datasourceBundle: DatasourceBundle) {
    if (datasourceBundle.status === 'pending resource' || datasourceBundle.status === 'rejected resource') {
      this.errorMessage = `You cannot activate a ${datasourceBundle.status}.`;
      window.scrollTo(0, 0);
      return;
    }
    this.toggleLoading = true;
    this.datasourceService.publishDatasource(datasourceBundle.id, datasourceBundle.datasource.version, !datasourceBundle.active).subscribe(
      res => {},
      error => {
        this.errorMessage = 'Something went bad. ' + error.error ;
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
    this.catalogueService.getDatasourcesOfCatalogue(this.catalogueId, this.dataForm.get('from').value, this.dataForm.get('quantity').value,
      this.dataForm.get('order').value, this.dataForm.get('orderField').value,
      this.dataForm.get('active').value, this.dataForm.get('status').value, this.dataForm.get('query').value)
      .subscribe(res => {
          this.datasourceBundles = res;
          this.total = res['total'];
          this.paginationInit();
        },
        err => {
          this.errorMessage = 'An error occurred while retrieving the datasources of this provider. ' + err.error;
        }
      );
  }

  setSelectedDatasource(datasource: DatasourceBundle) {
    this.selectedDatasource = datasource;
    UIkit.modal('#actionModal').show();
  }

  deleteDatasource(id: string) {
    // UIkit.modal('#spinnerModal').show();
    this.datasourceService.deleteDatasource(id).subscribe(
      res => {},
      error => {
        // console.log(error);
        // UIkit.modal('#spinnerModal').hide();
        this.errorMessage = 'Something went bad. ' + error.error ;
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
