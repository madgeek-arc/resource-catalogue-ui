import {Component, OnInit} from '@angular/core';
import {ResourceService} from '../../services/resource.service';
import {ServiceProviderService} from '../../services/service-provider.service';
import {DatasourceBundle, ProviderBundle, Service, ServiceBundle} from '../../domain/eic-model';
import {ConfigService} from "../../services/config.service";
import {environment} from '../../../environments/environment';
import {AuthenticationService} from '../../services/authentication.service';
import {ActivatedRoute, Router} from '@angular/router';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {URLParameter} from '../../domain/url-parameter';
import {NavigationService} from '../../services/navigation.service';
import {DatasourceService} from "../../services/datasource.service";
import {pidHandler} from "../../shared/pid-handler/pid-handler.service";

declare var UIkit: any;

@Component({
  selector: 'app-datasources-list',
  templateUrl: './datasources-list.component.html'
})

export class DatasourcesListComponent implements OnInit {
  url = environment.API_ENDPOINT;
  serviceORresource = environment.serviceORresource;
  catalogueConfigId: string | null = null;

  formPrepare = {
    order: 'ASC',
    sort: 'id',
    quantity: '10',
    from: '0',
    query: '',
    // active: '',
    // suspended: 'false',
    catalogue_id: new UntypedFormArray([]),
    service_id: new UntypedFormArray([]), //facets
    status: ''
  };

  dataForm: UntypedFormGroup;

  urlParams: URLParameter[] = [];

  errorMessage: string;
  loadingMessage = '';

  providers: ProviderBundle[] = [];

  datasources: DatasourceBundle[] = [];
  selectedDatasourceId: string;
  selectedDatasource: DatasourceBundle;

  serviceIdsOnView = [];
  servicesOnView = [];
  enrichedDatasources: DatasourceBundle[] = []; //ds bundles enriched with logo and name from service

  facets: any;
  searchFacet = '';

  total: number;
  // from = 0;
  // itemsPerPage = 10;
  currentPage = 1;
  pageTotal: number;
  pages: number[] = [];
  offset = 2;

  constructor(private resourceService: ResourceService,
              private serviceProviderService: ServiceProviderService,
              private datasourceService: DatasourceService,
              private authenticationService: AuthenticationService,
              private route: ActivatedRoute,
              private router: Router,
              private navigator: NavigationService,
              private fb: UntypedFormBuilder,
              public pidHandler: pidHandler,
              public config: ConfigService,
  ) {
  }

  ngOnInit() {
    this.catalogueConfigId = this.config.getProperty('catalogueId');
    if (!this.authenticationService.getUserProperty('roles').some(x => x === 'ROLE_ADMIN' || x === 'ROLE_EPOT')) {
      this.router.navigateByUrl('/home');
    } else {
      this.dataForm = this.fb.group(this.formPrepare);

      this.urlParams = [];
      this.route.queryParams
        .subscribe(params => {

            for (const i in params) {
              if (i === 'service_id') {
                if (this.dataForm.get('service_id').value.length === 0) {
                  const formArrayNew: UntypedFormArray = this.dataForm.get('service_id') as UntypedFormArray;
                  // formArrayNew = this.fb.array([]);
                  for (const service_id of params[i].split(',')) {
                    if (service_id !== '') {
                      formArrayNew.push(new UntypedFormControl(service_id));
                    }
                  }
                }
              } else if (i === 'catalogue_id') {
                if (this.dataForm.get('catalogue_id').value.length === 0) {
                  const formArrayNew: UntypedFormArray = this.dataForm.get('catalogue_id') as UntypedFormArray;
                  // formArrayNew = this.fb.array([]);
                  for (const catalogue_id of params[i].split(',')) {
                    if (catalogue_id !== '') {
                      formArrayNew.push(new UntypedFormControl(catalogue_id));
                    }
                  }
                }
              }
            }

            for (const i in this.dataForm.controls) {
              if (this.dataForm.get(i).value) {
                const urlParam = new URLParameter();
                urlParam.key = i;
                urlParam.values = [this.dataForm.get(i).value];
                this.urlParams.push(urlParam);
              }
            }

            this.getDatasources();
            // this.handleChange();
          },
          error => this.errorMessage = <any>error
        );
    }
  }

  handleChange() {
    this.urlParams = [];
    // const map: { [name: string]: string; } = {};
    for (const i in this.dataForm.controls) {
      // console.log('this.dataForm.get(i).value: ', this.dataForm.get(i).value);
      // if ((this.dataForm.get(i).value !== '') && (this.dataForm.get(i).value.length > 0)) {
      if ((this.dataForm.get(i).value !== '')) {
        const urlParam = new URLParameter();
        urlParam.key = i;
        urlParam.values = [this.dataForm.get(i).value];
        this.urlParams.push(urlParam);
        // map[i] = this.dataForm.get(i).value;
      }
    }

    const map: { [name: string]: string; } = { };
    for (const urlParameter of this.urlParams) {
      let concatValue = '';
      let counter = 0;
      for (const value of urlParameter.values) {
        if (counter !== 0) {
          concatValue += ',';
        }
        concatValue += value;
        counter++;
      }

      map[urlParameter.key] = concatValue;
    }
    // console.log('map', map);
    this.router.navigate([`/provider/datasource/all`], {queryParams: map});
  }

  handleChangeAndResetPage() {
    this.dataForm.get('from').setValue(0);
    this.handleChange();
  }

  getDatasources() {
    this.loadingMessage = 'Loading datasource entries...';
    this.datasources = [];
    this.datasourceService.getDatasourceBundles(this.dataForm.get('from').value, this.dataForm.get('quantity').value,
      this.dataForm.get('sort').value, this.dataForm.get('order').value, this.dataForm.get('query').value,
      this.dataForm.get('status').value, this.dataForm.get('catalogue_id').value, this.dataForm.get('service_id').value).subscribe(
      res => {
        this.datasources = res['results'];
        this.facets = res['facets'];
        this.total = res['total'];
        this.paginationInit();
        this.serviceIdsOnView = [];
        this.enrichedDatasources = [];
      },
      err => {
        console.log(err);
        this.errorMessage = 'The list could not be retrieved';
        this.loadingMessage = '';
      },
      () => {
        for (let i = 0; i < this.datasources?.length; i++) {
          if (this.datasources[i]?.datasource?.serviceId) {
            this.serviceIdsOnView.push(this.datasources[i].datasource.serviceId);
          }
        }
        if (this.serviceIdsOnView.length > 0) {
          this.resourceService.getMultipleResourcesById(this.serviceIdsOnView.join(',')).subscribe(
            res => {
              this.servicesOnView = res
            },
            err => {
              console.log(err)
            },
            () => {
              this.enrichedDatasources = this.datasources.map(datasource => {
                const matchingService = this.servicesOnView.find(service => service.id === datasource.datasource.serviceId);
                if (matchingService) {
                  return {
                    ...datasource,
                    logo: matchingService.logo,
                    name: matchingService.name,
                    resourceOrganisation: matchingService.resourceOrganisation,
                  };
                }
                return datasource; // if no match is found, return the service as is
              });
            }
          )
        }
        this.loadingMessage = '';
      }
    );
  }

  showDeletionModal(id: string) {
    this.selectedDatasourceId = id;
    if (this.selectedDatasourceId) {
      UIkit.modal('#deletionModal').show();
    }
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

  showSuspensionModal(bundle: DatasourceBundle) {
    this.selectedDatasource = bundle;
    if (this.selectedDatasource) {
      UIkit.modal('#suspensionModal').show();
    }
  }

  verifyDatasource(id: string, active: boolean, status: string){
    this.loadingMessage = '';
    UIkit.modal('#spinnerModal').show();
    this.datasourceService.verifyDatasource(id, active, status).subscribe(
      res => this.getDatasources(),
      err => UIkit.modal('#spinnerModal').hide(),
      () => {
        UIkit.modal('#spinnerModal').hide();
        location.reload();
      }
    );
  }

  /** for facets--> **/
  // isCatalogueChecked(value: string) {
  //   return this.dataForm.get('catalogue_id').value.includes(value);
  // }
  //
  // isServiceChecked(value: string) {
  //   return this.dataForm.get('service_id').value.includes(value);
  // }

  isChecked(value: string, category) {
    return this.dataForm.get(category).value.includes(value);
  }

  onSelection(e, category: string, value: string) {
    const formArrayNew: UntypedFormArray = this.dataForm.get(category) as UntypedFormArray;
    if (e.target.checked) {
      this.addParameterToURL(category, value);
      formArrayNew.push(new UntypedFormControl(value));
    } else {
      let categoryIndex = 0;
      for (const urlParameter of this.urlParams) {
        if (urlParameter.key === category) {
          const valueIndex = urlParameter.values.indexOf(value, 0);
          if (valueIndex > -1) {
            urlParameter.values.splice(valueIndex, 1);
            if (urlParameter.values.length === 0) {
              this.urlParams.splice(categoryIndex, 1);
            }
          }
          const formArrayIndex = formArrayNew.value.indexOf(value, 0);
          if (formArrayIndex > -1 ) {
            formArrayNew.removeAt(formArrayIndex);
          }
        }
        categoryIndex++;
      }
    }
    // this.getServices();
    return this.navigateUsingParameters();
  }

  private addParameterToURL(category: string, value: string) {
    let foundCategory = false;
    for (const urlParameter of this.urlParams) {
      if (urlParameter.key === category) {
        foundCategory = true;
        const valueIndex = urlParameter.values.indexOf(value, 0);
        if (valueIndex < 0) {
          urlParameter.values.push(value);
          this.updatePagingURLParameters(0);
        }
      }
    }
    if (!foundCategory) {
      this.updatePagingURLParameters(0);
      const newParameter: URLParameter = {
        key: category,
        values: [value]
      };
      this.urlParams.push(newParameter);
    }
  }

  navigateUsingParameters() {
    const map: { [name: string]: string; } = {};
    for (const urlParameter of this.urlParams) {
      map[urlParameter.key] = urlParameter.values.join(',');
    }
    this.handleChange();
    // return this.navigator.resourcesList(map);  // problematic semicolon in url
  }

  updatePagingURLParameters(from: number) {
    let foundFromCategory = false;
    for (const urlParameter of this.urlParams) {
      if (urlParameter.key === 'from') {
        foundFromCategory = true;
        urlParameter.values = [];
        urlParameter.values.push(from + '');
        break;
      }
    }
    if (!foundFromCategory) {
      const newFromParameter: URLParameter = {
        key: 'from',
        values: [from + '']
      };
      this.urlParams.push(newFromParameter);
    }
  }
  /** <--for facets **/

  /** Pagination --> **/
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
  /** <--Pagination **/

}
