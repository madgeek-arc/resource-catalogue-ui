import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AuthenticationService} from '../../../services/authentication.service';
import {NavigationService} from '../../../services/navigation.service';
import {ResourceService} from '../../../services/resource.service';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {

  providerId: string;
  serviceORresource = environment.serviceORresource;

  constructor(public authenticationService: AuthenticationService,
              public resourceService: ResourceService,
              public router: NavigationService,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    // this.activeTab = this.route.firstChild.snapshot.routeConfig.path;
    this.providerId = this.route.snapshot.paramMap.get('provider');
  }
}
