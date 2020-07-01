import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {AuthenticationService} from '../../../../../../../src/app/services/authentication.service';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-top-menu-aire',
  templateUrl: './topmenu.component.html',
  styles: [`
    .uk-navbar-nav > li > a.loginLink {
      color: #214c9c;
    }
  `],
  encapsulation: ViewEncapsulation.None
})
export class TopMenuComponent implements OnInit, OnDestroy {

  constructor(public authenticationService: AuthenticationService, public route: Router) {
  }

  ngOnInit(): void {
    // this.isLoggedIn();
    // this.getUsername();
    // this.getUsersurname();
  }

  ngOnDestroy(): void {
  }

  get isHome() {
    return this.route.url === '/home';
  }

  onClick(id: string) {
    const el: HTMLElement = document.getElementById(id);
    el.classList.remove('uk-open');
  }
}
