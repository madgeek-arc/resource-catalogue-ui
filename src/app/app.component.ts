import {Component, inject, OnInit} from '@angular/core';
import {ActivationEnd, NavigationEnd, Router} from '@angular/router';
import {toSignal} from "@angular/core/rxjs-interop";
import {filter, map, startWith} from "rxjs/operators";
import {AuthenticationService} from '../lib/services/authentication.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    standalone: false
})
export class AppComponent implements OnInit {

  breadcrumbs: string[] = [];

  protected router = inject(Router);
  protected authenticationService = inject(AuthenticationService);

  hideAppShellSignal = toSignal(
    this.router.events.pipe(
      filter((event): event is ActivationEnd => event instanceof ActivationEnd),
      filter(event => event.snapshot.firstChild === null),
      map(event => event.snapshot.data['hideAppShell'] ?? false),
      startWith(false)
    ),
    { initialValue: false }
  );

  hideAppShell = this.hideAppShellSignal;

  ngOnInit() {
    this.router.events.subscribe((evt: any) => {
      if (evt.url) {
        this.breadcrumbs = evt.url.split(/\//);
      }
      this.breadcrumbs[0] = 'Home';
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

  onHelpdeskClick() {
    if (this.authenticationService.isLoggedIn()) {
      this.router.navigate(['/helpdesk/create']);
    } else {
      this.authenticationService.setPostLoginRedirect('/helpdesk/create');
      window.location.href = this.authenticationService.getLoginUrl('/helpdesk/create');
    }
  }
}
