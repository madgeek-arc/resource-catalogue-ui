import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AuthenticationService} from '../../../lib/services/authentication.service';

@Component({
  selector: 'app-external-header',
  template: `
    @if (name) {
      <div
        #renderLogin
        class="commons-header"
        [attr.username]="name"
        [attr.logout-url]="logoutUrl"
      ></div>
    } @else {
      <div
        class="commons-header"
        [attr.username]=""
        [attr.login-url]="loginUrl"
      ></div>
    }
  `,
  standalone: false
})
export class ExternalHeaderComponent implements OnInit {
  name = this.authService.getUserName();
  loginUrl = this.authService.getLoginUrl();
  logoutUrl = this.authService.getLogoutUrl();

  constructor(public authService: AuthenticationService) {
    this.authService.refreshUserInfo();
  }

  @ViewChild('renderLogin', {static: false})
  set renderLogin(elementRef: ElementRef<HTMLDivElement> | undefined) {
    if (elementRef) { // rerender when the element appears in the DOM
      window['eosccommon']?.renderMainHeader?.('.commons-header');
    }
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe({
      next: user => {
        if (user) {
          this.name = user.name;
        }
      }
    });
    // Call external theme's rendering function for header inside a small timeout (so that user can be retrieved from the backend)
    setTimeout(() => {
      window['eosccommon']?.renderMainHeader?.('.commons-header');
    }, 0);
  }
}
