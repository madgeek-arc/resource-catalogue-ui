import {Component} from '@angular/core';
import {NavigationService} from '../../../lib/services/navigation.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    standalone: false
})
export class HomeComponent {

  constructor(public navigator: NavigationService) {
  }
}

