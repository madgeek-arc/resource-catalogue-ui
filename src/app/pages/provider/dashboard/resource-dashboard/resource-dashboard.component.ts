import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AuthenticationService} from '../../../../services/authentication.service';
import {ResourceService} from '../../../../services/resource.service';
import {NavigationService} from '../../../../services/navigation.service';


@Component({
  selector: 'app-resource-dashboard',
  templateUrl: './resource-dashboard.component.html',
})
export class ResourceDashboardComponent implements OnInit {

  providerId: string;
  resourceId: string;

  constructor(public authenticationService: AuthenticationService,
              public resourceService: ResourceService,
              public router: NavigationService,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.providerId = this.route.snapshot.paramMap.get('providerId');
    this.resourceId = this.route.snapshot.paramMap.get('resourceId');
  }
}
