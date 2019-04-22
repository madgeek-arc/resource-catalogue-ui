import {Component, OnInit} from '@angular/core';
import {UserService} from '../../../services/user.service';
import {RichService, Service} from '../../../domain/eic-model';
import {ResourceService} from '../../../services/resource.service';
import {ComparisonService} from '../../../services/comparison.service';
import {NavigationService} from '../../../services/navigation.service';
import {AuthenticationService} from '../../../services/authentication.service';
import {mergeMap} from 'rxjs/operators';

@Component({
  selector: 'app-user-favorites',
  templateUrl: './my-favourites.component.html',
  styleUrls: ['../../search/search.component.css']
})

export class MyFavouritesComponent implements OnInit {

  errorMessage: string;
  searchResults: RichService[];
  foundResults = true;
  listViewActive = true;

  constructor(
    private userService: UserService,
    private resourceService: ResourceService,
    public comparisonService: ComparisonService,
    public router: NavigationService,
    public authenticationService: AuthenticationService
  ) {
  }

  ngOnInit(): void {
    this.getFavorites();
  }

  getFavorites() {
    this.userService.getFavouritesOfUser().subscribe(
      res => this.searchResults = res
    );
  }

  isSelected(service: Service): boolean {
    return (this.comparisonService.servicesToCompare.map(e => e.id).indexOf(service.id)) > -1;
  }

  addToFavourites(i: number) {
    const service = this.searchResults[i];
    this.userService.addFavourite(service.id, !service.isFavourite).pipe(
        mergeMap(e => this.resourceService.getSelectedServices([e.service])))
      .subscribe(
        s => Object.assign(this.searchResults[i], s[0]),
        err => console.log(err),
        () => this.getFavorites()
      );

  }

  rateService(i: number, rating: number) {
    const service = this.searchResults[i];
    this.userService.rateService(service.id, rating).pipe(
      mergeMap(e => this.resourceService.getSelectedServices([e.service])))
      .subscribe(
        s => Object.assign(this.searchResults[i], s[0]),
        err => console.log(err)
      );
  }
}
