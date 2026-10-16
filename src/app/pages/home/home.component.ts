import {Component} from '@angular/core';
import {NavigationService} from '../../../lib/services/navigation.service';
import {AuthenticationService} from '../../../lib/services/authentication.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    standalone: false
})
export class HomeComponent {

  constructor(public navigator: NavigationService, public authenticationService: AuthenticationService) {
  }
}

