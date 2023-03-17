import {Component, OnInit} from '@angular/core';
import {ResourceService} from '../../../services/resource.service';
import {ServiceProviderService} from '../../../services/service-provider.service';
import {
  ServiceBundle,
  InteroperabilityRecord,
  ProviderBundle,
  VocabularyCuration,
  VocabularyEntryRequest
} from '../../../domain/eic-model';
import {environment} from '../../../../environments/environment';
import {AuthenticationService} from '../../../services/authentication.service';
import {ActivatedRoute, Router} from '@angular/router';
import {FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {URLParameter} from '../../../domain/url-parameter';
import {NavigationService} from '../../../services/navigation.service';
import {ResourceExtrasService} from "../../../services/resource-extras.service";

declare var UIkit: any;

@Component({
  selector: 'app-guidelines-list',
  templateUrl: './guidelines-list.component.html'
})
export class GuidelinesListComponent implements OnInit {
  url = environment.API_ENDPOINT;
  serviceORresource = environment.serviceORresource;

  formPrepare = {
    order: 'ASC',
    orderField: 'id',
    quantity: '10',
    from: '0',
    query: ''
  };

  dataForm: FormGroup;

  urlParams: URLParameter[] = [];

  errorMessage: string;
  loadingMessage = '';

  providers: ProviderBundle[] = [];

  guidelines: InteroperabilityRecord[] = [];
  vocabularyCurations: VocabularyCuration[] = [];
  selectedGuidelineId: string;
  selectedVocabularyEntryRequests: VocabularyEntryRequest[] = [];

  total: number;
  // from = 0;
  // itemsPerPage = 10;
  currentPage = 1;
  pageTotal: number;
  pages: number[] = [];
  offset = 2;

  constructor(private resourceService: ResourceService,
              private serviceProviderService: ServiceProviderService,
              private resourceExtrasService: ResourceExtrasService,
              private authenticationService: AuthenticationService,
              private route: ActivatedRoute,
              private router: Router,
              private navigator: NavigationService,
              private fb: FormBuilder
  ) {
  }

  ngOnInit() {
    if (!this.authenticationService.getUserProperty('roles').some(x => x === 'ROLE_ADMIN' || x === 'ROLE_EPOT')) {
      this.router.navigateByUrl('/home');
    } else {
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

            this.getGuidelines();
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
    this.router.navigate([`/guidelines/all`], {queryParams: map});
  }

  handleChangeAndResetPage() {
    this.dataForm.get('from').setValue(0);
    this.handleChange();
  }

  getGuidelines() {
    this.loadingMessage = 'Loading guidelines entries...';
    this.guidelines = [];
    this.resourceExtrasService.getInteroperabilityRecords(this.dataForm.get('from').value, this.dataForm.get('quantity').value, this.dataForm.get('orderField').value,
      this.dataForm.get('order').value, this.dataForm.get('query').value).subscribe(
      res => {
        this.guidelines = res['results'];
        this.total = res['total'];
        this.paginationInit();
      },
      err => {
        console.log(err);
        this.errorMessage = 'The list could not be retrieved';
        this.loadingMessage = '';
      },
      () => {
        this.loadingMessage = '';
      }
    );
  }

  showDeletionModal(id: string) {
    this.selectedGuidelineId = id;
    if (this.selectedGuidelineId) {
      UIkit.modal('#deletionModal').show();
    }
  }

  deleteGuideline(id: string) {
    // UIkit.modal('#spinnerModal').show();
    this.resourceExtrasService.deleteInteroperabilityRecordById(id).subscribe(
      res => {},
      error => {
        // console.log(error);
        // UIkit.modal('#spinnerModal').hide();
        this.errorMessage = 'Something went bad. ' + error.error ;
        this.getGuidelines();
      },
      () => {
        this.getGuidelines();
        // UIkit.modal('#spinnerModal').hide();
      }
    );
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
