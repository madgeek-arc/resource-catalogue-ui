import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';

import {BehaviorSubject, Observable, Subscription, timer} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {User} from '../domain/user';


@Injectable()
export class AuthenticationService {
  private loginInterval: Subscription;
  private apiUrl: string = environment.API_ENDPOINT;
  private loginUrl = environment.API_LOGIN;
  currentUserSubject: BehaviorSubject<User> = new BehaviorSubject<User | null>(null);
  currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor(public router: Router, private http: HttpClient) {
  }

  public isLoggedIn() {
    return this.getIsUserLoggedIn();
  }

  public getLoginUrl(path: string = null): string {
    const continueUrl = window.location.origin + encodeURIComponent(path ? path : this.router.url);
    return `${this.loginUrl}?continue=${continueUrl}`;
  }

  public getLogoutUrl(): string {
    return `${this.apiUrl}/logout`;
  }

  getUserProperty(property: string): any {
    if (this.getIsUserLoggedIn()) {
      return this.currentUserSubject.value[property];
    } else {
      return '';
    }
  }

  public refreshLogin(redirectUrl: string) {
    this.refreshUserInfo();
    if (!redirectUrl) {
      redirectUrl = this.router.url;
    }
    this.router.navigate([redirectUrl])
      .then(r => console.debug('Redirecting to: ', redirectUrl));
  }

  public login() {
    this.refreshLogin(null);
  }

  public getUserId(): string {
    return this.getUserProperty('id');
  }

  public getIsUserLoggedIn() {
    return (!this.loginInterval?.closed) && this.currentUserSubject.value !== null;
  }

  public getUserName(): string {
    return this.getUserProperty('name');
  }

  getUserSurname(): string {
    return this.getUserProperty('surname');
  }

  public getUserEmail(): string {
    return this.getUserProperty('email');
  }

  public getUserRoles(): string[] {
    return this.getUserProperty('roles');
  }

  isProvider() {
    let roles: string[] = this.getUserRoles();
    return roles !== undefined ? roles?.some(x => x === 'ROLE_PROVIDER') : false;
  }

  isAdmin() {
    let roles: string[] = this.getUserRoles();
    return roles != undefined && roles.length > 0 ? roles.some(x => x === 'ROLE_ADMIN' || x === 'ROLE_EPOT') : false;
  }

  public refreshUserInfo() {
    /* SETTING INTERVAL TO REFRESH SESSION TIMEOUT COUNTDOWN */
    if (this.loginInterval == null || this.loginInterval.closed) {
      this.loginInterval = timer(0, 1000 * 60 * 5).subscribe(() => {
        this.http.get<User>(this.apiUrl + '/user/info', {withCredentials: true}).subscribe(
          userInfo => {
            sessionStorage.setItem('user', `${userInfo.name} ${userInfo.surname}`);
            this.currentUserSubject.next(userInfo)
          },
          error => {
            console.debug('/user/login status: ', error.status);
            this.router.navigate(['/home']);
            this.loginInterval.unsubscribe();
            sessionStorage.clear();
          },
          () => {
            console.debug(`User is:
              ${this.currentUserSubject.value.name} ${this.currentUserSubject.value.surname}
              ${this.currentUserSubject.value.email}
              ${this.currentUserSubject.value.roles}`
            )
            if (sessionStorage.getItem('state.location')) {
              let state = sessionStorage.getItem('state.location');
              sessionStorage.removeItem('state.location');
              console.debug(`returning to state: ${state}`);
              this.router.navigate([state]);
            }
          }
        );
      });
    }
    console.debug('after refreshUserInfo');
  }

  public clearUserData() {
    sessionStorage.clear();
  }

  public logout() {
    this.clearUserData()
    this.currentUserSubject.next(null);
    window.location.href = this.getLogoutUrl();
  }

}
