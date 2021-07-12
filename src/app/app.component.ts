import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {environment} from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isLoginOrRegister = false;

  breadcrumbs: string[] = [];

  constructor(public router: Router) {
  }

  ngOnInit() {
    this.router.events.subscribe((evt: any) => {
      if (evt.url) {
        this.breadcrumbs = evt.url.split(/\//);
      }
      this.breadcrumbs[0] = 'Home';

      // this.isLoginOrRegister = ["/signUp", "/signIn"].indexOf(evt.url) >= 0;
    });

    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
  }

  isDashboardRoute() {
    // console.log('Is home route? Route is: ' + this.router.url);
    return (this.router.url.includes('dashboard'));
  }
}
