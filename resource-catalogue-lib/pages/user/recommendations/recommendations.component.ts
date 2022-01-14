import {Component, OnInit} from '@angular/core';
import {RichService, Service} from '../../../domain/eic-model';
import {ResourceService} from '../../../services/resource.service';
import {AuthenticationService} from '../../../services/authentication.service';
import {NavigationService} from '../../../services/navigation.service';
import {environment} from '../../../../environments/environment';
import {flatMap} from 'rxjs/operators';
import {UserService} from '../../../services/user.service';
import {ComparisonService} from '../../../services/comparison.service';

@Component({
  selector: 'app-recommendations',
  templateUrl: 'recommendations.component.html',
  styleUrls: ['recommendations.component.css']
})

export class RecommendationsComponent implements OnInit {

  projectName = environment.projectName;
  serviceIdsArray: string[] = [];
  recommendations: RichService[] = [];
  recommendationsToShow: RichService[] = [];
  errorMessage = '';
  loadingMessage = '';
  listViewActive = true;
  currentPage = 1;
  totalPages = 0;
  pageSize = 10;
  from = 0;
  to = 0;
  total = 0;
  isPreviousPageDisabled = true;
  isNextPageDisabled = true;

  constructor( public resourceService: ResourceService,
               public authenticationService: AuthenticationService,
               public router: NavigationService,
               public userService: UserService,
               public comparisonService: ComparisonService
  ) {}

  ngOnInit() {
    if (this.authenticationService.isLoggedIn()) {
      this.loadingMessage = 'Loading user recommendations...';
      this.resourceService.getRecommendedServices(20).subscribe(
        suc => {
          this.recommendations = suc;
        },
        error => {
          this.errorMessage = 'Something went bad. ' + error.error.error ;
          this.loadingMessage = '';
        },
        () => {
          this.total = this.recommendations.length;
          this.totalPages = Math.ceil(this.total / this.pageSize);
          if (this.total > this.pageSize) {
            this.isNextPageDisabled = false;
          }
          if (this.recommendations.length > this.pageSize) {
            this.to = this.pageSize;
          } else {
            this.to = this.recommendations.length;
          }
          this.recommendationsToShow = this.recommendations.slice(this.from, this.to);
          this.loadingMessage = '';
        }
      );
    } else {
      this.errorMessage = 'Please log in first';
    }
  }

  toggleListGrid() {
    this.listViewActive = !this.listViewActive;
  }

  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.from = (this.currentPage - 1) * this.pageSize;
      this.to = this.currentPage * this.pageSize;
      this.recommendationsToShow = this.recommendations.slice(this.from, this.to);
      this.isNextPageDisabled = false;
    }
    if (this.currentPage === 1) {
      this.isPreviousPageDisabled = true;
    }
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.from = (this.currentPage - 1) * this.pageSize;
      this.to = this.currentPage * this.pageSize;
      if (this.to > this.total) {
        this.to = this.total;
      }
      this.recommendationsToShow = this.recommendations.slice(this.from, this.to);
      this.isPreviousPageDisabled = false;
    }
    if (this.currentPage === this.totalPages) {
      this.isNextPageDisabled = true;
    }
  }

  getResourceOrganizationAbbreviation(service: RichService) {
    for (const providerInfo of service.providerInfo) {
      if (providerInfo.resourceOrganisation) {
        return providerInfo.providerAbbreviation;
      }
    }
    return null;
  }

  addToFavourites(i: number) { /** Favourite the service **/
    const richService = this.recommendationsToShow[i];
    this.userService.addFavourite(richService.service.id, !(!!richService.isFavourite)).pipe(
      flatMap(e => this.resourceService.getSelectedServices([e.service])))
      .subscribe(
        s => {
          // console.log(s[0]);
          Object.assign(this.recommendations[this.currentPage * this.pageSize  + i], s[0]);
        },
        err => console.log(err)
      );
  }

  isSelected(service: Service): boolean { /** Add to comparison list **/
    return (this.comparisonService.servicesToCompare.map(e => e.id).indexOf(service.id)) > -1;
  }

  /** Ask for info --> **/
  isChecked(serviceId: string) {
    return this.serviceIdsArray.indexOf(serviceId) > -1;
  }

  addOrRemove(serviceId: string) {
    const pos = this.serviceIdsArray.indexOf(serviceId);
    if (pos > -1) {
      this.serviceIdsArray.splice(pos, 1);
    } else {
      this.serviceIdsArray.push(serviceId);
    }
  }
  /** <-- Ask for info **/

}
