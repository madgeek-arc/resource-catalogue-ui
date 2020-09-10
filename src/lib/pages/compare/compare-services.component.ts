import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';
import {RichService} from '../../domain/eic-model';
import {SearchQuery} from '../../domain/search-query';
import {AuthenticationService} from '../../services/authentication.service';
import {ComparisonService} from '../../services/comparison.service';
import {NavigationService} from '../../services/navigation.service';
import {ResourceService} from '../../services/resource.service';
import {UserService} from '../../services/user.service';
import {flatMap} from 'rxjs/operators';

@Component({
  selector: 'app-compare-services',
  templateUrl: './compare-services.component.html',
  styleUrls: ['./compare-services.component.css']
})
export class CompareServicesComponent implements OnInit, OnDestroy {
  searchForm: FormGroup;

  richServices: RichService[] = [];

  public errorMessage: string;
  ids: string[] = [];
  /*providers: any;*/
  nologo = 'src/lib/assets/images/broken_image-black-48dp.svg';
  private sub: Subscription;

  constructor(public fb: FormBuilder, public route: ActivatedRoute, public router: NavigationService,
              public resourceService: ResourceService, public authenticationService: AuthenticationService,
              public userService: UserService, public comparisonService: ComparisonService) {
    this.searchForm = fb.group({'query': ['']});
  }

  ngOnInit() {

    this.sub = this.route.params.subscribe(params => {
      this.ids = (params.services || '').split(',');
      if (this.ids.length > 1) {
        this.resourceService.getSelectedServices(this.ids).subscribe(
          services => this.richServices = services
        );
      } else {
        this.router.search({});
      }
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  onSubmit(searchValue: SearchQuery) {
    return this.router.search({query: searchValue.query});
  }

  addToFavourites(i: number) {
    this.userService.addFavourite(this.richServices[i].service.id, !this.richServices[i].isFavourite)
      .pipe(
        flatMap(e => this.resourceService.getSelectedServices([e.service]))
      ).subscribe(
      res => {
        Object.assign(this.richServices[i], res[0]);
        console.log(this.richServices[i].isFavourite);
      },
      err => console.log(err)
    );
  }

  rateService(i: number, rating: number) {
    this.userService.rateService(this.richServices[i].service.id, rating)
      .pipe(
        flatMap(e => this.resourceService.getSelectedServices([e.service]))
      ).subscribe(
      res => {
        Object.assign(this.richServices[i], res[0]);
        console.log(this.richServices[i].hasRate);
      },
      err => console.log(err)
    );
  }

  getIsFavourite(i: number) {
    return this.richServices[i].isFavourite;
  }

  getHasRate(i: number) {
    return this.richServices[i].hasRate;
  }

  getRatings(i: number) {
    return this.richServices[i].ratings;
  }


}
