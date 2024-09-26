import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AuthenticationService} from '../../../../services/authentication.service';
import {ResourceService} from '../../../../services/resource.service';
import {ServiceExtensionsService} from '../../../../services/service-extensions.service';
import {NavigationService} from '../../../../services/navigation.service';
import {environment} from '../../../../../environments/environment';
import {TrainingResourceBundle} from "../../../../domain/eic-model";
import {TrainingResourceService} from "../../../../services/training-resource.service";


@Component({
  selector: 'app-training-resource-dashboard',
  templateUrl: './training-resource-dashboard.component.html',
})
export class TrainingResourceDashboardComponent implements OnInit {

  _marketplaceTrainingResourcesURL = environment.marketplaceTrainingResourcesURL;

  catalogueId: string;
  providerId: string;
  trainingResourceId: string;
  monitoringId: string;
  helpdeskId: string;

  trainingResourceBundle: TrainingResourceBundle;

  constructor(public authenticationService: AuthenticationService,
              public resourceService: ResourceService,
              public trainingResourceService: TrainingResourceService,
              public serviceExtensionsService: ServiceExtensionsService,
              public navigator: NavigationService,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.catalogueId = this.route.snapshot.paramMap.get('catalogueId');
    this.providerId = this.route.snapshot.paramMap.get('providerId');
    this.trainingResourceId = this.route.snapshot.paramMap.get('trainingResourceId');
    this.trainingResourceService.getTrainingResourceBundle(this.trainingResourceId, this.catalogueId).subscribe(
      res => { if (res!=null) this.trainingResourceBundle = res },
      error => {},
      () => {
        // this.serviceExtensionsService.getMonitoringByServiceId(this.trainingResourceId).subscribe(
        //   res => { if (res!=null) this.monitoringId = res.id }
        // );
        // this.serviceExtensionsService.getHelpdeskByServiceId(this.trainingResourceId).subscribe(
        //   res => { if (res!=null) this.helpdeskId = res.id }
        // );
      }
    );
  }

  protected readonly encodeURIComponent = encodeURIComponent;
}
