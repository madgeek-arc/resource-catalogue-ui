/**
 * Created by stefania on 7/5/16.
 */
import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Service, Vocabulary} from '../../domain/eic-model';
import {SearchQuery} from '../../domain/search-query';
import {NavigationService} from '../../services/navigation.service';
import {ResourceService} from '../../services/resource.service';
import {SearchResults} from '../../domain/search-results';
import {Info} from '../../../../projects/EOSC/src/app/domain/info';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public searchForm: FormGroup;
  public categoriesResults: SearchResults<Vocabulary> = null;
  public categories: Vocabulary = null;
  public baseIconURI = './assets/images/icons/';

  public featuredServices: Service[] = null;
  public viewServices: Service[] = [];
  private step = 4;
  private index = 0;
  private slideRight: boolean;

  public info: Info;

  constructor(public fb: FormBuilder, public router: NavigationService, public resourceService: ResourceService) {
    this.searchForm = fb.group({'query': ['']});
  }

  ngOnInit() {

    this.resourceService.getVocabulariesByType('CATEGORIES').subscribe(
      suc => {
        this.categoriesResults = suc;
        this.categories = this.categoriesResults.results[0];
      }
    );

    this.resourceService.getInfo().subscribe(
      suc => this.info = suc
    );

    this.resourceService.getFeaturedServices().subscribe(
      res => {
        this.featuredServices = res;
      },
      error => {
        console.log(error);
      },
      () => {
        this.updateServiceList();
      }
    );
  }

  onSubmit(searchValue: SearchQuery) {
    return this.router.search({query: searchValue.query});
  }

  signUpAndRegisterAservice() {
    sessionStorage.setItem('forward_url', '/newServiceProvider');
    this.router.router.navigateByUrl('/newServiceProvider');
  }

  updateServiceList() {
    let tempService: Service;
    this.viewServices = [];

    if (this.featuredServices.length > this.step) {
      for (let i = 0; i < this.step; i++) {
        if (this.index === this.featuredServices.length) {
          this.index = 0;
        }
        tempService = this.featuredServices[this.index];
        this.viewServices.push(tempService);
        this.index++;
        if (this.index === this.featuredServices.length) {
          this.index = 0;
        }
      }
    }
  }

  next() {
    this.slideRight = true;
    this.updateServiceList();
  }

  previous() {
    this.slideRight = false;
    this.index = this.index - this.step * 2;
    if (this.index < 0) {
      this.index = this.featuredServices.length + this.index;
    }

    this.updateServiceList();
  }
}

