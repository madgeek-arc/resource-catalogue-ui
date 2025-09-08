import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AuthenticationService} from '../../../../services/authentication.service';
import {ResourceService} from '../../../../services/resource.service';
import {NavigationService} from '../../../../services/navigation.service';
import {ConfigService} from "../../../../services/config.service";
import {environment} from '../../../../../environments/environment';

@Component({
  selector: 'app-shared-resource-dashboard',
  templateUrl: './shared-resource-dashboard.component.html',
})
export class SharedResourceDashboardComponent implements OnInit {

  _marketplaceServicesURL = environment.marketplaceServicesURL;
  serviceORresource = environment.serviceORresource;

  catalogueConfigId: string = this.config.getProperty('catalogueConfigId');
  providerId: string;
  resourceId: string;

  constructor(public authenticationService: AuthenticationService,
              public resourceService: ResourceService,
              public navigator: NavigationService,
              private route: ActivatedRoute,
              private config: ConfigService) {
  }

  ngOnInit() {
    this.providerId = this.route.snapshot.paramMap.get('providerId');
    this.resourceId = this.route.snapshot.paramMap.get('resourceId');
  }
}
