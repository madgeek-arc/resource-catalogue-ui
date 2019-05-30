import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {Subscription, zip} from 'rxjs';
import {SearchQuery} from '../../../../../../src/app/domain/search-query';
import {SearchResults} from '../../../../../../src/app/domain/search-results';
import {AuthenticationService} from '../../../../../../src/app/services/authentication.service';
import {ComparisonService} from '../../../../../../src/app/services/comparison.service';
import {NavigationService} from '../../../../../../src/app/services/navigation.service';
import {ResourceService} from '../../../../../../src/app/services/resource.service';
import {UserService} from '../../../../../../src/app/services/user.service';
import {URLParameter} from '../../../../../../src/app/domain/url-parameter';
import {Provider, RichService} from '../../../../../../src/app/domain/eic-model';
import {SearchComponent} from "../../../../../../src/app/pages/search/search.component";

declare var UIkit: any;

@Component({
  selector: 'app-search',
  templateUrl: './search.aire.component.html',
  styleUrls: ['./search.aire.component.css']
})
export class SearchAireComponent extends SearchComponent {
  // searchForm: FormGroup;
  // errorMessage: string;
  // sub: Subscription;
  // urlParameters: URLParameter[] = [];
  // searchResults: SearchResults<RichService>;
  // facetOrder = ['category', 'trl', 'lifeCycleStatus', 'provider'];
  // pageSize = 9;
  // currentPage = 0;
  // totalPages = 0;
  // isPreviousPageDisabled = false;
  // isFirstPageDisabled = false;
  // isNextPageDisabled = false;
  // isLastPageDisabled = false;
  // foundResults = true;
  // advanced = false;
  // providers: any;
  // // vocabularies: any;
  //
  // listViewActive = false;
  //
  // myProviders: Provider[] = [];
  // canAddOrEditService = false;
  //
  // constructor(public fb: FormBuilder, public router: NavigationService, public route: ActivatedRoute,
  //             public userService: UserService, public resourceService: ResourceService,
  //             public authenticationService: AuthenticationService, public comparisonService: ComparisonService) {
  //   this.searchForm = fb.group({'query': ['']});
  // }
  //
  // ngOnInit() {
  //
  //   this.canAddOrEditService = false;
  //   // this 2 lines should be done better
  //   this.updatePagingURLParametersQuantity(this.pageSize);
  //   this.navigateUsingParameters();
  //
  //   if (this.authenticationService.isLoggedIn()) {
  //     zip(
  //       this.resourceService.getProvidersNames(),
  //       this.resourceService.getMyServiceProviders()
  //     ).subscribe(suc => {
  //       this.providers = suc[0];
  //       this.myProviders = suc[1];
  //
  //       /* check if the current user can add a service */
  //       this.canAddOrEditService = this.myProviders.some(p => p.id === 'openaire');
  //
  //       this.sub = this.route.params.subscribe(params => {
  //         this.urlParameters.splice(0, this.urlParameters.length);
  //         this.foundResults = true;
  //         for (const obj in params) {
  //           if (params.hasOwnProperty(obj)) {
  //             const urlParameter: URLParameter = {
  //               key: obj,
  //               values: params[obj].split(',')
  //             };
  //             this.urlParameters.push(urlParameter);
  //           }
  //         }
  //         // request results from the registry
  //         return this.resourceService.search(this.urlParameters).subscribe(
  //           searchResults => this.updateSearchResults(searchResults));
  //       });
  //     });
  //   } else {
  //     zip(
  //       this.resourceService.getProvidersNames(),
  //     ).subscribe(suc => {
  //       this.providers = suc[0];
  //
  //       this.updatePagingURLParametersQuantity(this.pageSize);
  //       this.sub = this.route.params.subscribe(params => {
  //         this.urlParameters.splice(0, this.urlParameters.length);
  //         this.foundResults = true;
  //         for (const obj in params) {
  //           if (params.hasOwnProperty(obj)) {
  //             const urlParameter: URLParameter = {
  //               key: obj,
  //               values: params[obj].split(',')
  //             };
  //             this.urlParameters.push(urlParameter);
  //           }
  //         }
  //         // request results from the registry
  //         return this.resourceService.search(this.urlParameters).subscribe(
  //           searchResults => this.updateSearchResults(searchResults));
  //       });
  //     });
  //   }
  //
  //
  // }
  //
  // ngOnDestroy(): void {
  //   this.sub.unsubscribe();
  // }
  //
  // toggleListGrid(show: string) {
  //   if (show === 'list') {
  //     this.listViewActive = true;
  //     this.pageSize = 10;
  //     this.updatePagingURLParametersQuantity(this.pageSize);
  //     this.updatePagingURLParameters(0);
  //     return this.navigateUsingParameters();
  //   } else if (show === 'grid') {
  //     this.listViewActive = false;
  //     this.pageSize = 9;
  //     this.updatePagingURLParametersQuantity(this.pageSize);
  //     this.updatePagingURLParameters(0);
  //     return this.navigateUsingParameters();
  //   } else {
  //     this.listViewActive = false;
  //     this.pageSize = 9;
  //     this.updatePagingURLParametersQuantity(this.pageSize);
  //     this.updatePagingURLParameters(0);
  //     return this.navigateUsingParameters();
  //   }
  // }
  //
  // updateSearchResults(searchResults: SearchResults<RichService>) {
  //
  //   // INITIALISATIONS
  //   this.errorMessage = null;
  //   this.searchResults = searchResults;
  //   this.isFirstPageDisabled = false;
  //   this.isPreviousPageDisabled = false;
  //   this.isLastPageDisabled = false;
  //   this.isNextPageDisabled = false;
  //   if (this.searchResults.results.length === 0) {
  //     this.foundResults = false;
  //   }
  //   this.orderFacets();
  //   // update form values using URLParameters
  //   for (const urlParameter of this.urlParameters) {
  //     if (urlParameter.key === 'query') {
  //       this.searchForm.get('query').setValue(urlParameter.values[0]);
  //     } else if (urlParameter.key === 'advanced') {
  //       this.advanced = urlParameter.values[0] === 'true';
  //     } else {
  //       for (const facet of this.searchResults.facets) {
  //         if (facet.field === urlParameter.key) {
  //           //
  //           for (const parameterValue of urlParameter.values) {
  //             for (const facetValue of facet.values) {
  //               if (parameterValue === facetValue.value) {
  //                 facetValue.isChecked = true;
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }
  //   }
  //   // this.pageSize = 10;
  //   this.updatePagingURLParametersQuantity(this.pageSize);
  //   this.currentPage = (searchResults.from / this.pageSize) + 1;
  //   this.totalPages = Math.ceil(searchResults.total / this.pageSize);
  //   if (this.currentPage === 1) {
  //     this.isFirstPageDisabled = true;
  //     this.isPreviousPageDisabled = true;
  //   }
  //   if (this.currentPage === this.totalPages) {
  //     this.isLastPageDisabled = true;
  //     this.isNextPageDisabled = true;
  //   }
  // }
  //
  // orderFacets() {
  //   const facetValues = {};
  //   this.facetOrder.forEach((e, i) => {
  //     facetValues[e] = i;
  //   });
  //   this.searchResults.facets.sort((a, b): number => {
  //     return facetValues[a.field] - facetValues[b.field];
  //   });
  // }
  //
  // onSubmit(searchValue: SearchQuery) {
  //   let foundQuery = false;
  //   let queryParameterIndex = 0;
  //   for (const urlParameter of this.urlParameters) {
  //     if (urlParameter.key === 'query') {
  //       foundQuery = true;
  //       if (searchValue.query === '') {
  //         this.urlParameters.splice(queryParameterIndex, 1);
  //       } else {
  //         urlParameter.values.splice(0, urlParameter.values.length);
  //         urlParameter.values.push(searchValue.query);
  //       }
  //     }
  //     queryParameterIndex++;
  //   }
  //   if (!foundQuery && searchValue.query !== '') {
  //     const searchQuery: URLParameter = {
  //       key: 'query',
  //       values: [searchValue.query]
  //     };
  //     this.urlParameters.push(searchQuery);
  //   }
  //   return this.navigateUsingParameters();
  // }
  //
  // deselectFacet(category: string, value: string) {
  //   let categoryIndex = 0;
  //   for (const urlParameter of this.urlParameters) {
  //     if (urlParameter.key === category) {
  //       const valueIndex = urlParameter.values.indexOf(value, 0);
  //       if (valueIndex > -1) {
  //         urlParameter.values.splice(valueIndex, 1);
  //         if (urlParameter.values.length === 0) {
  //           this.urlParameters.splice(categoryIndex, 1);
  //         }
  //       }
  //     }
  //     categoryIndex++;
  //     if (category === 'query') {
  //       this.searchForm.get('query').setValue('');
  //     }
  //   }
  //   return this.navigateUsingParameters();
  // }
  //
  // selectFacet(category: string, value: string) {
  //   let foundCategory = false;
  //   this.goToFirstPage();
  //   for (const urlParameter of this.urlParameters) {
  //     if (urlParameter.key === category) {
  //       foundCategory = true;
  //       const valueIndex = urlParameter.values.indexOf(value, 0);
  //       if (valueIndex < 0) {
  //         urlParameter.values.push(value);
  //       }
  //     }
  //   }
  //   if (!foundCategory) {
  //     const newParameter: URLParameter = {
  //       key: category,
  //       values: [value]
  //     };
  //     this.urlParameters.push(newParameter);
  //   }
  //   return this.navigateUsingParameters();
  // }
  //
  // onSelection(e, category: string, value: string) {
  //   if (e.target.checked) {
  //     let foundCategory = false;
  //     for (const urlParameter of this.urlParameters) {
  //       if (urlParameter.key === category) {
  //         foundCategory = true;
  //         urlParameter.values.push(value);
  //       }
  //     }
  //     if (!foundCategory) {
  //       const newParameter: URLParameter = {
  //         key: category,
  //         values: [value]
  //       };
  //       this.urlParameters.push(newParameter);
  //     }
  //   } else {
  //     let categoryIndex = 0;
  //     for (const urlParameter of this.urlParameters) {
  //       if (urlParameter.key === category) {
  //         const valueIndex = urlParameter.values.indexOf(value, 0);
  //         if (valueIndex > -1) {
  //           urlParameter.values.splice(valueIndex, 1);
  //           if (urlParameter.values.length === 0) {
  //             this.urlParameters.splice(categoryIndex, 1);
  //           }
  //         }
  //       }
  //       categoryIndex++;
  //     }
  //   }
  //   return this.navigateUsingParameters();
  // }
  //
  // navigateUsingParameters() {
  //   const map: { [name: string]: string; } = {};
  //   for (const urlParameter of this.urlParameters) {
  //     let concatValue = '';
  //     let counter = 0;
  //     for (const value of urlParameter.values) {
  //       if (counter !== 0) {
  //         concatValue += ',';
  //       }
  //       concatValue += value;
  //       counter++;
  //     }
  //     map[urlParameter.key] = concatValue;
  //   }
  //   return this.router.search(map);
  // }
  //
  // goToFirstPage() {
  //   const from = 0;
  //   const to = 9;
  //   this.updatePagingURLParameters(from);
  //   return this.navigateUsingParameters();
  // }
  //
  // goToPreviousPage() {
  //   let from: number = this.searchResults.from;
  //   let to: number = this.searchResults.to;
  //   from -= this.pageSize;
  //   to -= this.pageSize;
  //   this.updatePagingURLParameters(from);
  //   return this.navigateUsingParameters();
  // }
  //
  // goToNextPage() {
  //   let from: number = this.searchResults.from;
  //   let to: number = this.searchResults.to;
  //   from += this.pageSize;
  //   to += this.pageSize;
  //   this.updatePagingURLParameters(from);
  //   return this.navigateUsingParameters();
  // }
  //
  // goToLastPage() {
  //   const from: number = Math.floor(this.searchResults.total / this.pageSize) * this.pageSize;
  //   const to: number = this.searchResults.total - 1;
  //   this.updatePagingURLParameters(from);
  //   return this.navigateUsingParameters();
  // }
  //
  // updatePagingURLParameters(from: number) {
  //   let foundFromCategory = false;
  //   for (const urlParameter of this.urlParameters) {
  //     if (urlParameter.key === 'from') {
  //       foundFromCategory = true;
  //       urlParameter.values = [];
  //       urlParameter.values.push(from + '');
  //     }
  //   }
  //   if (!foundFromCategory) {
  //     const newFromParameter: URLParameter = {
  //       key: 'from',
  //       values: [from + '']
  //     };
  //     this.urlParameters.push(newFromParameter);
  //   }
  // }
  //
  // updatePagingURLParametersQuantity(quantity: number) {
  //   let foundQuantityCategory = false;
  //   for (const urlParameter of this.urlParameters) {
  //     if (urlParameter.key === 'quantity') {
  //       foundQuantityCategory = true;
  //       urlParameter.values = [];
  //       urlParameter.values.push(quantity + '');
  //     }
  //   }
  //   if (!foundQuantityCategory) {
  //     const newQuantityParameter: URLParameter = {
  //       key: 'quantity',
  //       values: [quantity + '']
  //     };
  //     this.urlParameters.push(newQuantityParameter);
  //   }
  // }
}
