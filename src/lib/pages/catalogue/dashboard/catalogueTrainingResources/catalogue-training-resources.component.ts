import {Component, DestroyRef, OnInit} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {CatalogueBundle, TrainingResourceBundle} from '../../../../domain/eic-model';
import {ActivatedRoute, Router} from '@angular/router';
import {Paging} from '../../../../domain/paging';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {URLParameter} from '../../../../domain/url-parameter';
import {CatalogueService} from "../../../../services/catalogue.service";
import {TrainingResourceService} from "../../../../services/training-resource.service";
import {ConfigService} from "../../../../services/config.service";
import {environment} from "../../../../../environments/environment";
import {ResourceService} from "../../../../services/resource.service";

declare let UIkit: any;

@Component({
    selector: 'app-catalogue-training-resources',
    templateUrl: './catalogue-training-resources.component.html',
    standalone: false
})

export class CatalogueTrainingResourcesComponent implements OnInit {

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
  trainingResourceBundles: TrainingResourceBundle[] = new Array<TrainingResourceBundle>();
  selectedTrainingResource: TrainingResourceBundle = null;
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
    private resourceService: ResourceService,
    private trainingResourceService: TrainingResourceService,
    private config: ConfigService,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.catalogueId = this.route.parent.snapshot.paramMap.get('catalogue');

    this.getCatalogue();

    this.dataForm = this.fb.group(this.formPrepare);
    (this.dataForm.get('catalogue_id') as UntypedFormArray).push(new UntypedFormControl(this.catalogueId));
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
          this.getResources();
        },
        error => this.errorMessage = <any>error
      );
  }

  // navigate(resourceId: string) {
  //   this.router.navigate([`/dashboard/${this.catalogueId}/${resourceId.split('.')[0]}/training-resource-dashboard/`, resourceId]);
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

  toggleTrainingResource(bundle: TrainingResourceBundle) {
    if (bundle.status === 'pending' || bundle.status === 'rejected') {
      this.errorMessage = `You cannot activate a ${bundle.status}.`;
      window.scrollTo(0, 0);
      return;
    }
    this.toggleLoading = true;
    this.trainingResourceService.activateTrainingResource(bundle.id, !bundle.active).subscribe(
      res => {},
      err => {
        this.errorMessage = (err?.status >= 500 && err?.status < 600)
            ? `Something went wrong. If the issue persists, please contact support and provide the following error code: ${err?.error?.traceId}`
            : `Something went bad, server responded: ${err?.error?.detail}`;
        this.getResources();
        this.toggleLoading = false;
        // console.log(error);
      },
      () => {
        this.getResources();
        this.toggleLoading = false;
      }
    );
  }

  getResources() {
    this.toggleLoading = true;
    this.trainingResourceService.getResourceBundles(this.dataForm.get('from').value, this.dataForm.get('quantity').value,
      this.dataForm.get('sort').value, this.dataForm.get('order').value, this.dataForm.get('query').value,
      null, null, this.dataForm.get('status').value, [], [], this.catalogueId ? [this.catalogueId] : []).subscribe(
      res => {
          this.toggleLoading = false;
          this.trainingResourceBundles = res['results'];
          this.total = res['total'];
          this.paginationInit();
        },
        err => {
          this.toggleLoading = false;
          this.errorMessage = 'An error occurred while retrieving the training resources of this provider. ' + err.error;
        }
      );
  }

  setSelectedTrainingResource(bundle: TrainingResourceBundle) {
    this.selectedTrainingResource = bundle;
    UIkit.modal('#actionModal').show();
  }

  deleteTrainingResource(id: string) {
    // UIkit.modal('#spinnerModal').show();
    this.trainingResourceService.deleteTrainingResource(id).subscribe(
      res => {},
      err => {
        // UIkit.modal('#spinnerModal').hide();
        this.errorMessage = (err?.status >= 500 && err?.status < 600)
            ? `Something went wrong. If the issue persists, please contact support and provide the following error code: ${err?.error?.traceId}`
            : `Something went bad, server responded: ${err?.error?.detail}`;
        this.getResources();
      },
      () => {
        this.getResources();
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

    this.router.navigate([`/catalogue-dashboard/` + this.catalogueId + `/training-resources`], {queryParams: map});
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
