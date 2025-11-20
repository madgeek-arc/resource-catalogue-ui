import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from "../../../lib/services/authentication.service";

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
  loginUrl = this.authService.getLoginUrl();
  logoutUrl = this.authService.getLogoutUrl();

  constructor(public authService: AuthenticationService) {
    this.authService.refreshUserInfo();
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe({
      next: user => {
        if (user) {
          this.name = user.name;
          // this.name = `${user.name} ${user.surname}`;
        }
      }
    });
    // Call external theme's rendering function for header inside a small timeout (so that user can be retrieved from the backend)
    setTimeout(() => {
      window['eosccommon']?.renderMainHeader?.('.commons-header');
    }, 150);
  }
}
