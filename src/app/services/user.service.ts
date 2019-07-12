import {Injectable} from '@angular/core';
import {Observable, throwError} from 'rxjs';
import {Service, User, Event as EicEvent, RichService} from '../domain/eic-model';
import {AuthenticationService} from './authentication.service';
import {NavigationService} from './navigation.service';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {catchError} from 'rxjs/operators';

declare var UIkit: any;

@Injectable()
export class UserService {

  private base = environment.API_ENDPOINT;
  private options = {withCredentials: true};

  constructor(public http: HttpClient,
              public router: NavigationService,
              public authenticationService: AuthenticationService,
              ) {
  }

  addFavourite(serviceID: string, value: boolean): Observable<EicEvent> {
    if (this.authenticationService.isLoggedIn()) {
      /*return this.http.put(`/event/favourite/service/${serviceID}`,{});*/
      // new addFavourite method
      return this.http.post<EicEvent>(this.base + `/event/favourite/service/${serviceID}?value=${value}`, {}, this.options)
        ;
    } else {
      this.authenticationService.login();
    }
  }

  public getFavouritesOfUser() {
    if (this.authenticationService.isLoggedIn()) {
      return this.http.get<RichService[]>(this.base + `/userEvents/favourites/`, this.options)
        ;
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
      return this.http.post<EicEvent>(this.base + `/event/rating/service/${serviceID}?rating=${rating}`, {}, this.options)
        ;
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

  private handleError(error: HttpErrorResponse) {
    const message = 'Server error';
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    UIkit.notification.closeAll();
    UIkit.notification({message: message, status: 'danger', pos: 'top-center', timeout: 5000});
    return throwError(error);
  }
}
