import {Component, OnInit} from '@angular/core';
import {Datasource, ProviderBundle} from '../../../../domain/eic-model';
import {ServiceProviderService} from '../../../../services/service-provider.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ResourceService} from '../../../../services/resource.service';
import {Paging} from '../../../../domain/paging';
import {FormArray, UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {URLParameter} from '../../../../domain/url-parameter';
import {environment} from '../../../../../environments/environment';
import {DatasourceService} from "../../../../services/datasource.service";
import {NavigationService} from "../../../../services/navigation.service";

declare var UIkit: any;

@Component({
    selector: 'app-datasource-select',
    templateUrl: './datasource-select.component.html',
    styleUrls: ['../services/service.component.css'],
    standalone: false
})

export class DatasourceSelectComponent implements OnInit {

  serviceORresource = environment.serviceORresource;

  formPrepare = {
    from: '0',
    quantity: '10',
    order: 'ASC',
    sort: 'name',
    query: '',
  };

  dataForm: UntypedFormGroup;

  errorMessage = '';
  showLoader = false;
  urlParams: URLParameter[] = [];
  providerId: string;
  resourceId: string;
  catalogueId: string;
  providerBundle: ProviderBundle;
  datasources: Paging<Datasource>;
  selectedDatasource: Datasource = null;
  path: string;

  total: number;
  currentPage = 1;
  pageTotal: number;
  pages: number[] = [];
  offset = 2;

  constructor(
    private fb: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private navigator: NavigationService,
    private providerService: ServiceProviderService,
    private service: ResourceService,
    private datasourceService: DatasourceService
  ) {}

  ngOnInit(): void {
    this.providerId = this.route.snapshot.paramMap.get('providerId');
    this.resourceId = this.route.snapshot.paramMap.get('resourceId');

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
          this.getOpenAIREDatasources();
        },
        error => this.errorMessage = <any>error
      );
  }

  navigate(id: string) {
    // this.router.navigate([`/dashboard/${this.catalogueId}/${this.providerId}/datasource-dashboard/`, id]);
  }

  getProvider() {
    this.providerService.getServiceProviderBundleById(this.providerId, this.catalogueId).subscribe(
      providerBundle => this.providerBundle = providerBundle,
      error => console.log(error)
    );
  }

  getOpenAIREDatasources() {
    this.showLoader = true;
    this.datasourceService.getOpenAIREDatasources(this.dataForm.get('from').value, this.dataForm.get('quantity').value,
      this.dataForm.get('sort').value, this.dataForm.get('order').value, this.dataForm.get('query').value)
      .subscribe(res => {
          this.datasources = res;
          this.total = res['total'];
          this.paginationInit();
        },
        err => {
          this.showLoader = false;
          this.errorMessage = 'An error occurred while retrieving the datasources of this provider. ' + err.error;
        },
        () => this.showLoader = false
      );
  }

  handleSelectedDatasource(datasource: Datasource) {
    this.selectedDatasource = datasource;

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

    this.router.navigate([`/provider/${this.providerId}/resource/${this.resourceId}/datasource/select`], {queryParams: map});
  }

  paginationInit() {
    let addToEndCounter = 0;
    let addToStartCounter = 0;
    this.pages = [];
    this.currentPage = (this.dataForm.get('from').value / (this.dataForm.get('quantity').value)) + 1;
    this.pageTotal = Math.ceil(this.total / (this.dataForm.get('quantity').value));
    for ( let i = (+this.currentPage - this.offset); i < (+this.currentPage + 1 + this.offset); ++i ) {
      if ( i < 1 ) { addToEndCounter++; }
      if ( i > this.pageTotal ) { addToStartCounter++; }
      if ((i >= 1) && (i <= this.pageTotal)) {
        this.pages.push(i);
      }
    }
    for ( let i = 0; i < addToEndCounter; ++i ) {
      if (this.pages.length < this.pageTotal) {
        this.pages.push(this.pages.length + 1);
      }
    }
    for ( let i = 0; i < addToStartCounter; ++i ) {
      if (this.pages[0] > 1) {
        this.pages.unshift(this.pages[0] - 1 );
      }
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.dataForm.get('from').setValue((this.currentPage - 1) * (+this.dataForm.get('quantity').value));
    this.handleChange();
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.dataForm.get('from').setValue(+this.dataForm.get('from').value - +this.dataForm.get('quantity').value);
      this.handleChange();
    }
  }

  nextPage() {
    if (this.currentPage < this.pageTotal) {
      this.currentPage++;
      this.dataForm.get('from').setValue(+this.dataForm.get('from').value + +this.dataForm.get('quantity').value);
      this.handleChange();
    }
  }

}
