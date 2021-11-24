import {Component} from '@angular/core';
import {NavigationService} from '../../../lib/services/navigation.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  constructor(public router: NavigationService) {
  }
}

