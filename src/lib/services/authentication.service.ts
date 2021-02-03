import {Injectable} from '@angular/core';
import {deleteCookie, getCookie, setCookie} from '../domain/utils';
import {NavigationService} from './navigation.service';
import {isNullOrUndefined} from 'util';
import {environment} from '../../environments/environment';

import * as moment from 'moment';
import {timer} from 'rxjs';


@Injectable()
export class AuthenticationService {
  redirectURL = '/provider/my';
  cookieName = 'info';
  user = null;
  cookie = null;
  expiresAt = null;

  constructor(public navigationService: NavigationService) {
    // this.user = JSON.parse(getCookie(this.cookieName));

    // check if user has already logged in
    this.getUserInfo();

    // check every minute if cookie has expired.
    timer(0, 60000).pipe().subscribe(x => {
      // console.log(moment().toString() + ' ' + this.isLoggedIn());
      if (!this.isLoggedIn()) {
        deleteCookie(this.cookieName);
        this.user = null;
        this.cookie = null;
        this.expiresAt = null;
      }
    });
  }

  /*public loginOLD(user: AAIUser) {
      if (!this.isLoggedIn()) {
          setCookie(this.cookieName, JSON.stringify(user), 1);
          this.user = user;
          this.navigationService.go(this.redirectURL);
      }
  }*/

  public b64DecodeUnicode(str: string) {
    return decodeURIComponent(Array.prototype.map.call(atob(str), function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  }

  public getUserInfo() {
    // retrieve user information from cookie
    this.cookie = getCookie(this.cookieName);
    if (!this.isLoggedIn() && this.cookie !== null) {

      this.user = JSON.parse(this.b64DecodeUnicode(getCookie(this.cookieName).replace(/"/gi, '')));

      this.user.id = this.user.eduperson_unique_id;
      // console.log(this.user);

      sessionStorage.setItem('userInfo', JSON.stringify(this.user));
      this.expiresAt = moment().add(JSON.stringify(this.user.expireSec), 'second');
      // this.expiresAt = moment().add(75, 'second');
      sessionStorage.setItem('expiresAt', JSON.stringify(this.expiresAt));

      let url = sessionStorage.getItem('redirect_url');
      sessionStorage.removeItem('redirect_url');
      if (!(sessionStorage.getItem('forward_url') === null)) {
        url = sessionStorage.getItem('forward_url');
        sessionStorage.removeItem('forward_url');
      }
      if (url !== null) {
        this.navigationService.router.navigateByUrl(url);
      }
    }
  }

  getUser() {
    const user = JSON.parse(sessionStorage.getItem('userInfo'));
    if (!isNullOrUndefined(user)) {
      return user;
    }
    return null;
  }

  getUserProperty(property: string) {
    if (isNullOrUndefined(this.user)) {
      this.user = JSON.parse(sessionStorage.getItem('userInfo'));
    }
    if (!isNullOrUndefined(this.user) && !isNullOrUndefined(this.user[property]) && (this.user[property] !== 'null')) {
      return this.user[property];
    }
    return null;
  }

  public refreshLogin(redirectUrl: string) {
    deleteCookie(this.cookieName);
    if (!redirectUrl) {
      redirectUrl = this.navigationService.router.url;
    }
    sessionStorage.setItem('redirect_url', redirectUrl);
    // console.log(redirectUrl);
    window.location.href = environment.API_ENDPOINT + '/openid_connect_login';
  }

  public login() {
    if (getCookie(this.cookieName) !== null && moment().isBefore(this.getExpiration())) {
      console.log('found cookie');
      this.getUserInfo();
    } else {
      sessionStorage.setItem('redirect_url', window.location.pathname);
      window.location.href = environment.API_ENDPOINT + '/openid_connect_login';
    }
  }

  public logout() {
    if (this.isLoggedIn()) {
      deleteCookie(this.cookieName);
      this.user = null;
      this.cookie = null;
      this.expiresAt = null;
      sessionStorage.clear();
      window.location.href = environment.API_ENDPOINT + '/openid_logout';
    }
  }

  public isLoggedIn(): boolean {
    return this.cookie != null && this.user != null && moment().isBefore(this.getExpiration());
  }

  getExpiration() {
    if (isNullOrUndefined(this.expiresAt)) {
      const expiration = sessionStorage.getItem('expiresAt');
      this.expiresAt = moment(JSON.parse(expiration));
    }
    return this.expiresAt;
  }

  public getUserId(): string {
    if (this.isLoggedIn()) {
      return !isNullOrUndefined(this.user.id) ? this.user.id : 'null';
    }
  }

  getUserName() {
    if (this.isLoggedIn()) {
      return !isNullOrUndefined(this.user.given_name) ? this.user.given_name : '';
    }
  }

  getUserSurname() {
    if (this.isLoggedIn()) {
      return !isNullOrUndefined(this.user.family_name) ? this.user.family_name : '';
    }
  }

  getUserEmail() {
    return !isNullOrUndefined(this.user.email) ? this.user.email : 'null';
  }

  public getUserRoles(): string[] {
    if (this.isLoggedIn()) {
      return this.user.roles !== undefined ? this.user.roles : null;
    }
  }

  isProvider() {
    if (this.isLoggedIn()) {
      return this.user.roles !== undefined ? this.user.roles.some(x => x === 'ROLE_PROVIDER') : false;
    }
  }

  isAdmin() {
    if (this.isLoggedIn()) {
      return this.user.roles !== undefined ? this.user.roles.some(x => x === 'ROLE_ADMIN') : false;
    }
  }
}
