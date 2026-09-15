import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AuthenticationService} from '../../../../services/authentication.service';
import {ResourceService} from '../../../../services/resource.service';
import {ServiceExtensionsService} from '../../../../services/service-extensions.service';
import {NavigationService} from '../../../../services/navigation.service';
import {ConfigService} from "../../../../services/config.service";
import {environment} from '../../../../../environments/environment';
import {DatasourceBundle, ResourceInteroperabilityRecord} from "../../../../domain/eic-model";
import {pidHandler} from "../../../../shared/pid-handler/pid-handler.service";
import {DatasourceService} from "../../../../services/datasource.service";
import {GuidelinesService} from "../../../../services/guidelines.service";


@Component({
    selector: 'app-datasource-dashboard',
    templateUrl: './datasource-dashboard.component.html',
    standalone: false
})
export class DatasourceDashboardComponent implements OnInit {
  protected readonly environment = environment;
  _marketplaceTrainingResourcesURL = environment.marketplaceTrainingResourcesURL;

  catalogueId: string;
  providerId: string;
  datasourceId: string;
  monitoringId: string;
  helpdeskId: string;

  datasourceBundle: DatasourceBundle;

  resourceGuidelines: ResourceInteroperabilityRecord;
  guidelines: { id: string, name: string }[] = []; // {id, name} pairs, local + federation

  constructor(public authenticationService: AuthenticationService,
              public resourceService: ResourceService,
              public datasourceService: DatasourceService,
              public serviceExtensionsService: ServiceExtensionsService,
              public navigator: NavigationService,
              private route: ActivatedRoute,
              public pidHandler: pidHandler,
              public config: ConfigService,
              public guidelinesService: GuidelinesService) {
  }

  ngOnInit() {
    this.providerId = this.route.snapshot.paramMap.get('providerId');
    this.datasourceId = this.route.snapshot.paramMap.get('datasourceId');
    this.datasourceService.getDatasourceBundleById(this.datasourceId).subscribe(
      res => {
        if (res != null) {
          this.datasourceBundle = res;
          this.catalogueId = this.datasourceBundle.catalogueId;
          console.log('catalogueId:', this.catalogueId);
        }
      },      error => {},
      () => {
        // this.serviceExtensionsService.getMonitoringByServiceId(this.datasourceId).subscribe(
        //   res => { if (res!=null) this.monitoringId = res.id }
        // );
        // this.serviceExtensionsService.getHelpdeskByServiceId(this.datasourceId).subscribe(
        //   res => { if (res!=null) this.helpdeskId = res.id }
        // );
        this.guidelinesService.getGuidelinesOfResource(this.datasourceId).subscribe(
          res => {
            if (res != null) this.resourceGuidelines = res;
          },
          err => console.log(err),
          () => {
            // {id, name} pairs, local + federation, so linked guidelines hosted on another
            // node still resolve to a name in getGuidelineName().
            this.guidelinesService.getInteroperabilityRecordsForPicker().subscribe(
              res => {
                if (res != null) this.guidelines = res;
              }
            );
          }
        );
      }
    );
  }

  getGuidelineName(id: string): string {
    return this.guidelines?.find(g => g.id === id)?.name || id;
  }

}
