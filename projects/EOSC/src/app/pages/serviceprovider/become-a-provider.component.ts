import {Component} from '@angular/core';
import {SearchQuery} from '../../../../../../src/app/domain/search-query';
import {NavigationService} from '../../../../../../src/app/services/navigation.service';

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

