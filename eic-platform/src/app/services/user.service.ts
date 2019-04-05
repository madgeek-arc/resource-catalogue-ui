import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Service, User, Event as EicEvent, RichService} from '../domain/eic-model';
import {AuthenticationService} from './authentication.service';
import {NavigationService} from './navigation.service';
import {ResourceService} from './resource.service';
import {HttpClient} from '@angular/common/http';
import {environment} from "../../environments/environment";

@Injectable()
export class UserService {

  private base = environment.API_ENDPOINT;

  constructor(public http: HttpClient, public router: NavigationService, public authenticationService: AuthenticationService,
              public resourceService: ResourceService) {
  }

  addFavourite(serviceID: string, value: boolean): Observable<EicEvent> {
    if (this.authenticationService.isLoggedIn()) {
      /*return this.http.put(`/event/favourite/service/${serviceID}`,{});*/
      // new addFavourite method
      return this.http.post<EicEvent>(`/event/favourite/service/${serviceID}?value=${value}`, {});
    } else {
      this.authenticationService.login();
    }
  }

  public getFavouritesOfUser() {
    if (this.authenticationService.isLoggedIn()) {
      return this.http.get<RichService[]>(this.base + `/userEvents/favourites`);
    } else {
      return null;
    }
  }

  getIfFavouriteOfUser(service: string) {
    if (this.authenticationService.isLoggedIn()) {
      return this.http.get(`/event/favourite/service/${service}`);
    } else {
      this.authenticationService.login();
    }
  }

  loginUser(email: string, password: string): Observable<any> {
    return this.http.post('/user/login', {email, password});
  }

  registerUser(user: User): Observable<any> {
    return this.http.post('/user/register', user);
  }

  public canEditService(service: Service) {
    /*return this.authenticationService.isLoggedIn() && service.providers && service.providers.length > 0 &&
        service.providers.indexOf(this.authenticationService.getUser()) > -1;*/
    return false;
  }

  public rateService(serviceID: string, rating: number): Observable<EicEvent> {
    if (this.authenticationService.isLoggedIn()) {
      return this.http.post<EicEvent>(`/event/rating/service/${serviceID}?rating=${rating}`, {});
      // return this.resourceService.recordEvent(serviceID, "RATING", value).subscribe(console.log);
    } else {
      this.authenticationService.login();
    }
  }

  public getRatingsOfUser() {
    if (this.authenticationService.isLoggedIn()) {
      return this.http.get(`/event/ratings`);
    } else {
      return null;
    }
  }

  getUserRating(service: string) {
    if (this.authenticationService.isLoggedIn()) {
      return this.http.get(`/event/rating/service/${service}`);
    } else {
      this.authenticationService.login();
    }
  }

  isDev() {
    return localStorage.getItem('dev') === 'aye';
  }
}
