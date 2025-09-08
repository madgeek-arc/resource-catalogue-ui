import {Component, OnInit} from '@angular/core';
import {InteroperabilityRecordBundle, ProviderBundle} from '../../../../domain/eic-model';
import {ServiceProviderService} from '../../../../services/service-provider.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Paging} from '../../../../domain/paging';
import {FormArray, UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {URLParameter} from '../../../../domain/url-parameter';
import {GuidelinesService} from "../../../../services/guidelines.service";
import {pidHandler} from "../../../../shared/pid-handler/pid-handler.service";
import {environment} from "../../../../../environments/environment";
import {ConfigService} from "../../../../services/config.service";

declare var UIkit: any;

@Component({
  selector: 'app-guidelines',
  templateUrl: './guidelines.component.html',
  styleUrls: ['../services/service.component.css']
})

export class GuidelinesComponent implements OnInit {

  formPrepare = {
    from: '0',
    quantity: '10',
    order: 'ASC',
    sort: 'title',
    query: '',
    // active: 'statusAll',
    status: ''
  };

  dataForm: UntypedFormGroup;

  errorMessage = '';
  // toggleLoading = false;
  urlParams: URLParameter[] = [];
  providerId: string;
  catalogueConfigId: string = this.config.getProperty('catalogueConfigId');
  catalogueId: string;
  providerBundle: ProviderBundle;
  guidelines: Paging<InteroperabilityRecordBundle>;
  selectedGuideline: InteroperabilityRecordBundle = null;
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
    private guidelinesService: GuidelinesService,
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
          this.getGuidelines();
        },
        error => this.errorMessage = <any>error
      );
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

  getGuidelines() {
    this.guidelinesService.getInteroperabilityRecordsOfProvider(this.providerId, this.dataForm.get('from').value, this.dataForm.get('quantity').value,
      this.dataForm.get('order').value, this.dataForm.get('sort').value, this.dataForm.get('query').value, this.dataForm.get('status').value)
      .subscribe(res => {
          this.guidelines = res;
          this.total = res['total'];
          this.numberOfResultsOnView = res['to']-res['from'];
          this.paginationInit();
        },
        err => {
          this.errorMessage = 'An error occurred while retrieving the guidelines of this provider. ' + err.error;
        },
        () => {}
      );
  }

  setSelectedGuidelines(irBundle: InteroperabilityRecordBundle) {
    this.selectedGuideline = irBundle;
    UIkit.modal('#actionModal').show();
  }

  deleteGuidelines(id: string) {
    UIkit.modal('#spinnerModal').show();
    this.guidelinesService.deleteInteroperabilityRecordById(id).subscribe(
      res => {},
      error => {
        UIkit.modal('#spinnerModal').hide();
        this.errorMessage = 'Something went bad. ' + error.error ;
        this.getGuidelines();
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

    this.router.navigate([`/dashboard`, this.catalogueId, this.providerId, `guidelines`], {queryParams: map});
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
