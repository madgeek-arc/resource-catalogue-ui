import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AuthenticationService} from '../../../../services/authentication.service';
import {ResourceService} from '../../../../services/resource.service';
import {ServiceExtensionsService} from '../../../../services/service-extensions.service';
import {NavigationService} from '../../../../services/navigation.service';
import {ConfigService} from "../../../../services/config.service";
import {environment} from '../../../../../environments/environment';
import {DeployableServiceBundle} from "../../../../domain/eic-model";
import {pidHandler} from "../../../../shared/pid-handler/pid-handler.service";
import {DeployableServiceService} from "../../../../services/deployable-service.service";


@Component({
    selector: 'app-deployable-service-dashboard',
    templateUrl: './deployable-service-dashboard.component.html',
    standalone: false
})
export class DeployableServiceDashboardComponent implements OnInit {
  catalogueConfigId: string | null = null;
  protected readonly environment = environment;
  _marketplaceTrainingResourcesURL = environment.marketplaceTrainingResourcesURL;

  catalogueId: string;
  providerId: string;
  deployableServiceId: string;
  monitoringId: string;
  helpdeskId: string;

  deployableServiceBundle: DeployableServiceBundle;

  constructor(public authenticationService: AuthenticationService,
              public resourceService: ResourceService,
              public deployableServiceService: DeployableServiceService,
              public serviceExtensionsService: ServiceExtensionsService,
              public navigator: NavigationService,
              private route: ActivatedRoute,
              public pidHandler: pidHandler,
              public config: ConfigService) {
  }

  ngOnInit() {
    this.catalogueConfigId = this.config.getProperty('catalogueId');
    this.catalogueId = this.route.snapshot.paramMap.get('catalogueId');
    this.providerId = this.route.snapshot.paramMap.get('providerId');
    this.deployableServiceId = this.route.snapshot.paramMap.get('deployableServiceId');
    this.deployableServiceService.getDeployableServiceBundle(this.deployableServiceId, this.catalogueId).subscribe(
      res => { if (res!=null) this.deployableServiceBundle = res },
      error => {},
      () => {
        this.serviceExtensionsService.getMonitoringByServiceId(this.deployableServiceId).subscribe(
          res => { if (res!=null) this.monitoringId = res.id }
        );
        this.serviceExtensionsService.getHelpdeskByServiceId(this.deployableServiceId).subscribe(
          res => { if (res!=null) this.helpdeskId = res.id }
        );
      }
    );
  }

}
