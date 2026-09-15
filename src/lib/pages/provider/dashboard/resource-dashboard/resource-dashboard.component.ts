import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AuthenticationService} from '../../../../services/authentication.service';
import {ResourceService} from '../../../../services/resource.service';
import {ServiceExtensionsService} from '../../../../services/service-extensions.service';
import {NavigationService} from '../../../../services/navigation.service';
import {ConfigService} from "../../../../services/config.service";
import {environment} from '../../../../../environments/environment';
import {ResourceInteroperabilityRecord, ServiceBundle} from "../../../../domain/eic-model";
import {DatasourceService} from "../../../../services/datasource.service";
import {pidHandler} from '../../../../shared/pid-handler/pid-handler.service';
import {GuidelinesService} from "../../../../services/guidelines.service";

declare let UIkit: any;

@Component({
    selector: 'app-resource-dashboard',
    templateUrl: './resource-dashboard.component.html',
    standalone: false
})
export class ResourceDashboardComponent implements OnInit {

  _marketplaceServicesURL = environment.marketplaceServicesURL;
  serviceORresource = environment.serviceORresource;
  catalogueId: string;
  providerId: string;
  resourceId: string;
  monitoringId: string;
  helpdeskId: string;
  datasourceId: string; //subprofile

  resourceGuidelines: ResourceInteroperabilityRecord;
  guidelines: { id: string, name: string }[] = []; // {id, name} pairs, local + federation

  providerPID: string;
  resourcePID: string;

  resourceBundle: ServiceBundle;
  errorMessage: string;

  constructor(public authenticationService: AuthenticationService,
              public resourceService: ResourceService,
              public serviceExtensionsService: ServiceExtensionsService,
              public datasourceService: DatasourceService,
              public guidelinesService: GuidelinesService,
              public navigator: NavigationService,
              private route: ActivatedRoute,
              public pidHandler: pidHandler,
              public config: ConfigService) {
  }

  ngOnInit() {
    this.providerId = this.route.snapshot.paramMap.get('providerId');
    this.resourceId = this.route.snapshot.paramMap.get('resourceId');

    // this.providerPID = decodeURIComponent(this.providerId);
    // this.resourcePID = decodeURIComponent(this.resourceId);
    this.resourceService.getServiceBundleById(this.resourceId).subscribe(
      res => {
        if (res != null) {
          this.resourceBundle = res;
          this.catalogueId = this.resourceBundle.catalogueId;
          console.log('catalogueId:', this.catalogueId);
        }
      },
      error => {},
      () => {
/*        this.datasourceService.getDatasourceByServiceId(this.resourceId, this.catalogueId).subscribe( // TODO check
          res => { if (res!=null) this.datasourceId = res.id }
        );*/
        if (this.catalogueId == null){
          // this.serviceExtensionsService.getMonitoringByServiceId(this.resourceId).subscribe(
          //   res => { if (res!=null) this.monitoringId = res.id }
          // );
          // this.serviceExtensionsService.getHelpdeskByServiceId(this.resourceId).subscribe(
          //   res => { if (res!=null) this.helpdeskId = res.id }
          // );
        }

        this.guidelinesService.getGuidelinesOfResource(this.resourceId).subscribe(
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

/*  showDatasourceDeletionModal() {
    UIkit.modal('#datasourceDeletionModal').show();
  }

  deleteDatasource(id: string) {
    UIkit.modal('#spinnerModal').show();
    this.datasourceService.deleteDatasource(id).subscribe(
      res => {},
      err => {
        UIkit.modal('#spinnerModal').hide();
                this.errorMessage = (err?.status >= 500 && err?.status < 600)
            ? `Something went wrong. If the issue persists, please contact support and provide the following error code: ${err?.error?.traceId}`
            : `Something went bad, server responded: ${err?.error?.detail}`;
      },
      () => {
        UIkit.modal('#spinnerModal').hide();
        window.location.reload()
      }
    );
  }*/

}
