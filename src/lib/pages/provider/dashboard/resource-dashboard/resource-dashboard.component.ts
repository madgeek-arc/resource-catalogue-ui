import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AuthenticationService} from '../../../../services/authentication.service';
import {ResourceService} from '../../../../services/resource.service';
import {ServiceExtensionsService} from '../../../../services/service-extensions.service';
import {NavigationService} from '../../../../services/navigation.service';
import {environment} from '../../../../../environments/environment';


@Component({
  selector: 'app-resource-dashboard',
  templateUrl: './resource-dashboard.component.html',
})
export class ResourceDashboardComponent implements OnInit {

  _marketplaceBaseURL = environment.marketplaceBaseURL;
  serviceORresource = environment.serviceORresource;

  catalogueId: string;
  providerId: string;
  resourceId: string;
  monitoringId: string;
  helpdeskId: string;

  constructor(public authenticationService: AuthenticationService,
              public resourceService: ResourceService,
              public serviceExtensionsService: ServiceExtensionsService,
              public router: NavigationService,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.catalogueId = this.route.snapshot.paramMap.get('catalogueId');
    this.providerId = this.route.snapshot.paramMap.get('providerId');
    this.resourceId = this.route.snapshot.paramMap.get('resourceId');
    this.serviceExtensionsService.getMonitoringByServiceId(this.resourceId).subscribe(
      res => { if (res!=null) this.monitoringId = res.id } //id not used atm
    );
    this.serviceExtensionsService.getHelpdeskByServiceId(this.resourceId).subscribe(
      res => { if (res!=null) this.helpdeskId = res.id } //id not used atm
    );
  }
}
