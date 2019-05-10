import {Component} from '@angular/core';
import {AuthenticationService} from '../../../../../../src/app/services/authentication.service';
import {NavigationService} from '../../../../../../src/app/services/navigation.service';

@Component({
  selector: 'app-footer-eosc',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {

  constructor(public authenticationService: AuthenticationService, public navigationService: NavigationService) {
  }

  isProvider() {
    if (this.authenticationService.isLoggedIn()) {
      return this.authenticationService.getUserProperty('roles').some(x => x === 'ROLE_PROVIDER');
    }
  }

  isAdmin() {
    if (this.authenticationService.isLoggedIn()) {
      return this.authenticationService.getUserProperty('roles').some(x => x === 'ROLE_ADMIN');
    }
  }

  signUpAndRegisterAservice() {
    sessionStorage.setItem('forward_url', '/newServiceProvider');
    this.navigationService.router.navigateByUrl('/newServiceProvider');
  }
}
