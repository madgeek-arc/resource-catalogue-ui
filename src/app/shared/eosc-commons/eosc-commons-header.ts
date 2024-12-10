import { Component, OnInit } from '@angular/core';
import {environment} from "../../../environments/environment";
import {AuthenticationService} from "../../../lib/services/authentication.service";

@Component({
  selector: 'app-external-header',
  template: `<div
    class="commons-header"
    [attr.username]="name"
    [attr.login-url]="loginUrl"
    [attr.logout-url]="logoutUrl"
  ></div>`,
})
export class ExternalHeaderComponent implements OnInit {
  name = this.authService.getUserName();
  loginUrl = environment.API_LOGIN;
  logoutUrl = environment.API_LOGOUT;

  constructor(public authService: AuthenticationService) {}

  ngOnInit(): void {
    // Call external theme's rendering function for header
    setTimeout(()=> {window['eosccommon']?.renderMainHeader?.('.commons-header')}, 0);
  }
}
