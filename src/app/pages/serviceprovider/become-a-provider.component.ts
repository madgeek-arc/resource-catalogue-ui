import {Component} from '@angular/core';
import {NavigationService} from '../../../lib/services/navigation.service';
import {SearchQuery} from '../../../lib/domain/search-query';

@Component({
  selector: 'app-become-a-provider',
  templateUrl: './become-a-provider.component.html',
  styleUrls: ['./become-a-provider.component.css']
})
export class BecomeAProviderComponent {

  constructor(public router: NavigationService) {
  }

  onSubmit(searchValue: SearchQuery) {
    return this.router.search({query: searchValue.query});
  }

  signUpAndRegisterAservice() {
    sessionStorage.setItem('forward_url', '/provider/add');
    this.router.router.navigateByUrl('/provider/add');
  }
}

