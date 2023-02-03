import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AuthenticationService} from '../../../../services/authentication.service';
import {ResourceService} from '../../../../services/resource.service';
import {NavigationService} from '../../../../services/navigation.service';
import {environment} from '../../../../../environments/environment';


@Component({
  selector: 'app-shared-datasource-dashboard',
  templateUrl: './shared-datasource-dashboard.component.html',
})
export class SharedDatasourceDashboardComponent implements OnInit {

  _marketplaceDatasourcesURL = environment.marketplaceDatasourcesURL;
  serviceORresource = environment.serviceORresource;

  providerId: string;
  datasourceId: string;

  constructor(public authenticationService: AuthenticationService,
              public resourceService: ResourceService,
              public router: NavigationService,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.providerId = this.route.snapshot.paramMap.get('providerId');
    this.datasourceId = this.route.snapshot.paramMap.get('datasourceId');
  }
}
