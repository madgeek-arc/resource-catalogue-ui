import {Component} from '@angular/core';
import {AuthenticationService} from '../../../lib/services/authentication.service';
import {NavigationService} from '../../../lib/services/navigation.service';


@Component({
  selector: 'app-footer-eosc',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class EOSCFooterComponent {

  constructor(public authenticationService: AuthenticationService, public navigator: NavigationService) {
  }

  signUpAndRegisterAservice() {
    sessionStorage.setItem('forward_url', '/provider/add');
    this.navigator.router.navigateByUrl('/provider/add');
  }

  scrollToTop(){
    window.scroll(0,0);
  }
}
