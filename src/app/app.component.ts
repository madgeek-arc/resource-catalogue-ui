import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {AuthenticationService} from './services/authentication.service';
import {NavigationService} from './services/navigation.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isLoginOrRegister = false;

  breadcrumbs: string[] = [];

  constructor(public router: NavigationService) {}

  ngOnInit() {
    this.router.router.events.subscribe((evt: any) => {
      if (evt.url) {
        this.breadcrumbs = evt.url.split(/\//);
      }
      this.breadcrumbs[0] = 'Home';

      // this.isLoginOrRegister = ["/signUp", "/signIn"].indexOf(evt.url) >= 0;
    });
    this.router.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
  }
}
