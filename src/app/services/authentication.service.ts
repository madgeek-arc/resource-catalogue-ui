import {Injectable} from '@angular/core';
import {deleteCookie, getCookie, setCookie} from '../domain/utils';
import {NavigationService} from './navigation.service';
import {isNullOrUndefined} from 'util';
import {environment} from '../../environments/environment';

import * as moment from 'moment';


@Injectable()
export class AuthenticationService {
  redirectURL = '/myServiceProviders';
  cookieName = 'info';
  user = null;
  cookie;

  constructor(public router: NavigationService) {
    // this.user = JSON.parse(getCookie(this.cookieName));
  }

  /*public loginOLD(user: AAIUser) {
      if (!this.isLoggedIn()) {
          setCookie(this.cookieName, JSON.stringify(user), 1);
          this.user = user;
          this.router.go(this.redirectURL);
      }
  }*/

  public b64DecodeUnicode(str: string) {
    return decodeURIComponent(Array.prototype.map.call(atob(str), function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  }

  public getUserInfo() {
    // retrieve user information from cookie
    if (!this.isLoggedIn() && getCookie(this.cookieName) !== null) {
      // console.log(this.b64DecodeUnicode(getCookie(this.cookieName)));/

      this.user = JSON.parse(this.b64DecodeUnicode(getCookie(this.cookieName)));
      // console.log(this.user);
      this.user.id = this.user.eduperson_unique_id;

      sessionStorage.setItem('userInfo', JSON.stringify(this.user));
      const expiresAt = moment().add(JSON.stringify(this.user.expireSec), 'second');
      // const expiresAt = moment().add(30,'second');
      sessionStorage.setItem('expiresAt', JSON.stringify(expiresAt));

      let url = sessionStorage.getItem('redirect_url');
      sessionStorage.removeItem('redirect_url');
      if (!(sessionStorage.getItem('forward_url') === null)) {
        url = sessionStorage.getItem('forward_url');
        sessionStorage.removeItem('forward_url');
      }
      if (url !== null) {
        this.router.router.navigateByUrl(url);
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
    const user = JSON.parse(sessionStorage.getItem('userInfo'));
    if (!isNullOrUndefined(user) && !isNullOrUndefined(user[property]) && (user[property] !== 'null')) {
      return user[property];
    }
    return null;
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
      sessionStorage.clear();
      window.location.href = environment.API_ENDPOINT + '/openid_logout';
      // this.router.home();
    }
  }

  public isLoggedIn(): boolean {
    // console.log('Monet call');
    // console.log(moment());
    // console.log('moment expiration');
    // console.log(this.getExpiration());
    return (getCookie(this.cookieName) != null) && (this.user != null) && moment().isBefore(this.getExpiration());
  }

  getExpiration() {
    const expiration = sessionStorage.getItem('expiresAt');
    const expiresAt = JSON.parse(expiration);
    return moment(expiresAt);
  }

  public getUserId(): string {
    return this.user.id == null ? 'null' : this.user.id;
  }

  public getUserRoles(): string[] {
    return this.user.roles !== undefined ? this.user.roles : null;
  }
}
