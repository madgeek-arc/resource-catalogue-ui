import {Component, OnInit} from '@angular/core';
import {ResourceService} from '../../services/resource.service';
import {ServiceProviderService} from '../../services/service-provider.service';
import {ProviderBundle, VocabularyCuration, VocabularyEntryRequest} from '../../domain/eic-model';
import {environment} from '../../../environments/environment';
import {AuthenticationService} from '../../services/authentication.service';
import {ActivatedRoute, Router} from '@angular/router';
import {FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {URLParameter} from '../../domain/url-parameter';
import {NavigationService} from '../../services/navigation.service';

declare var UIkit: any;

@Component({
  selector: 'app-vocabulary-requests',
  templateUrl: './vocabulary-requests.component.html'
})
export class VocabularyRequestsComponent implements OnInit {
  url = environment.API_ENDPOINT;
  serviceORresource = environment.serviceORresource;

  formPrepare = {
    status: 'Pending',
    order: 'DESC',
    orderField: 'dateOfRequest',
    quantity: '10',
    from: '0',
    query: '',
    vocabulary: new FormArray([])
  };

  dataForm: FormGroup;

  urlParams: URLParameter[] = [];

  errorMessage: string;
  loadingMessage = '';

  providers: ProviderBundle[] = [];

  vocabularyCurations: VocabularyCuration[] = [];
  selectedCuration: VocabularyCuration;
  selectedVocabularyEntryRequests: VocabularyEntryRequest[] = [];
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
              private authenticationService: AuthenticationService,
              private route: ActivatedRoute,
              private router: Router,
              private navigator: NavigationService,
              private fb: FormBuilder
  ) {
  }

  ngOnInit() {
    if (!this.authenticationService.getUserProperty('roles').some(x => x === 'ROLE_ADMIN')) {
      this.router.navigateByUrl('/home');
    } else {
      this.dataForm = this.fb.group(this.formPrepare);

      this.urlParams = [];
      this.route.queryParams
        .subscribe(params => {

            for (const i in params) {
              if (i === 'vocabulary') {

                if (this.dataForm.get('vocabulary').value.length === 0) {
                  const formArrayNew: FormArray = this.dataForm.get('vocabulary') as FormArray;
                  // formArrayNew = this.fb.array([]);
                  for (const vocabulary of params[i].split(',')) {
                    if (vocabulary !== '') {
                      formArrayNew.push(new FormControl(vocabulary));
                    }
                  }
                }
              } else {
                this.dataForm.get(i).setValue(params[i]);
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

            this.getVocabularyCuration();
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
    this.router.navigate([`/vocabulary-requests`], {queryParams: map});
    // this.getVocabularyCuration();
  }

  handleChangeAndResetPage() {
    this.dataForm.get('from').setValue(0);
    this.handleChange();
  }

  getVocabularyCuration() {
    this.loadingMessage = 'Loading vocabulary entries...';
    this.vocabularyCurations = [];
    this.serviceProviderService.getVocabularyCuration(this.dataForm.get('status').value,
      this.dataForm.get('from').value, this.dataForm.get('quantity').value, this.dataForm.get('order').value,
      this.dataForm.get('orderField').value, this.dataForm.get('vocabulary').value, this.dataForm.get('query').value).subscribe(
      res => {
        this.vocabularyCurations = res['results'];
        this.facets = res['facets'];
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

  isProviderChecked(value: string) {
    return this.dataForm.get('vocabulary').value.includes(value);
  }

  onSelection(e, category: string, value: string) {
    const formArrayNew: FormArray = this.dataForm.get('vocabulary') as FormArray;
    if (e.target.checked) {
      this.addParameterToURL(category, value);
      formArrayNew.push(new FormControl(value));
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
    // this.getVocabularyCuration();
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
    // return this.navigator.resourcesList(map);  // problematic semi-colon in url
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

  approvalModal(curation: VocabularyCuration) {
    this.selectedCuration = curation;
    if (this.selectedCuration) {
      UIkit.modal('#approvalModal').show();
    }
  }

  approveAction() {
    this.loadingMessage = '';
    this.serviceProviderService.approveVocabularyEntry(this.selectedCuration, true)
      .subscribe(
        res => {
          UIkit.modal('#approvalModal').hide();
          this.getVocabularyCuration();
        },
        err => {
          UIkit.modal('#approvalModal').hide();
          this.loadingMessage = '';
          console.log(err);
        },
        () => {
          this.loadingMessage = '';
        }
      );
  }

  rejectionModal(curation: VocabularyCuration) {
    this.selectedCuration = curation;
    if (this.selectedCuration) {
      UIkit.modal('#rejectionModal').show();
    }
  }

  rejectAction() {
    const reasonOfRejection = (<HTMLInputElement>document.getElementById('reasonOfRejection')).value;
    this.loadingMessage = '';
    this.serviceProviderService.approveVocabularyEntry(this.selectedCuration, false, reasonOfRejection)
      .subscribe(
        res => {
          UIkit.modal('#rejectionModal').hide();
          this.getVocabularyCuration();
        },
        err => {
          UIkit.modal('#rejectionModal').hide();
          this.loadingMessage = '';
          console.log(err);
        },
        () => {
          (<HTMLInputElement>document.getElementById('reasonOfRejection')).value = '';
          this.loadingMessage = '';
        }
      );
  }

  viewMoreModal(curation: VocabularyCuration) {
    console.log(curation.vocabularyEntryRequests);
    this.selectedCuration = curation;
    this.selectedVocabularyEntryRequests = curation.vocabularyEntryRequests;
    if (this.selectedVocabularyEntryRequests) {
      UIkit.modal('#viewMoreModal').show();
    }
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

  // dateConverter(UNIX_timestamp) {
  //   return new Date(UNIX_timestamp).toLocaleDateString('en-UK');
  // }

}
