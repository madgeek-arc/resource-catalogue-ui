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

  signUpAndRegisterAservice() {
    sessionStorage.setItem('forward_url', '/provider/add');
    this.navigationService.router.navigateByUrl('/provider/add');
  }
}
