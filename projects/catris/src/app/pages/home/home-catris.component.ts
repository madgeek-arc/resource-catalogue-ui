import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Service, Vocabulary} from '../../../../../../src/app/domain/eic-model';
import {SearchQuery} from '../../../../../../src/app/domain/search-query';
import {NavigationService} from '../../../../../../src/app/services/navigation.service';
import {SearchResults} from '../../../../../../src/app/domain/search-results';

import {Info} from '../../../../../EOSC/src/app/domain/info';
import {ResourceServiceExtended} from '../../../../../EOSC/src/app/services/resource.service.extended';
import {HomeComponent} from '../../../../../../src/app/pages/home/home.component';



@Component({
  selector: 'app-home-catris',
  templateUrl: './home-catris.component.html',
  styleUrls: ['./home-catris.component.css']
})
export class HomeCatrisComponent extends HomeComponent implements OnInit {

  // public searchForm: FormGroup;
  // public categoriesResults: SearchResults<Vocabulary> = null;
  // public categories: Vocabulary = null;
  // public baseIconURI = './assets/images/icons/';
  //
  // public featuredServices: Service[] = null;
  // public viewServices: Service[] = [];
  // private step = 4;
  // private index = 0;
  //
  // public info: Info;
  //
  //
  // constructor(
  //   public fb: FormBuilder,
  //   public router: NavigationService,
  //   public resourceService: ResourceServiceExtended) {
  //   this.searchForm = fb.group({'query': ['']});
  // }
  //
  // ngOnInit() {
  //
  //   this.resourceService.getVocabulariesByType('CATEGORIES').subscribe(
  //     suc => {
  //       this.categoriesResults = suc;
  //       this.categories = this.categoriesResults.results[0];
  //     }
  //   );
  //
  //   this.resourceService.getInfo().subscribe(
  //     suc => this.info = suc
  //   );
  //
  //   this.resourceService.getFeaturedServices().subscribe(
  //     res => this.featuredServices = res,
  //     error => console.log(error),
  //     () => this.updateServiceList()
  //   );
  // }
  //
  // onSubmit(searchValue: SearchQuery) {
  //   return this.router.search({query: searchValue.query});
  // }
  //
  // signUpAndRegisterAservice() {
  //   sessionStorage.setItem('forward_url', '/newServiceProvider');
  //   this.router.router.navigateByUrl('/newServiceProvider');
  // }
  //
  // updateServiceList() {
  //   let tempService: Service;
  //   this.viewServices = [];
  //
  //   if (this.featuredServices.length > this.step) {
  //     for (let i = 0; i < this.step; i++) {
  //       if (this.index === this.featuredServices.length) {
  //         this.index = 0;
  //       }
  //       tempService = this.featuredServices[this.index];
  //       this.viewServices.push(tempService);
  //       this.index++;
  //       if (this.index === this.featuredServices.length) {
  //         this.index = 0;
  //       }
  //     }
  //   }
  //   // console.log(this.viewServices);
  //   // console.log(this.index);
  // }
  //
  // next() {
  //   this.updateServiceList();
  // }
  //
  // previous() {
  //   this.index = this.index - this.step * 2;
  //   if (this.index < 0) {
  //     this.index = this.featuredServices.length + this.index;
  //   }
  //   this.updateServiceList();
  // }
}

