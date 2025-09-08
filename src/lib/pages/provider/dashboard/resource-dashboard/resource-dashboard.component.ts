import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AuthenticationService} from '../../../../services/authentication.service';
import {ResourceService} from '../../../../services/resource.service';
import {ServiceExtensionsService} from '../../../../services/service-extensions.service';
import {NavigationService} from '../../../../services/navigation.service';
import {ConfigService} from "../../../../services/config.service";
import {environment} from '../../../../../environments/environment';
import {InteroperabilityRecord, ResourceInteroperabilityRecord, ServiceBundle} from "../../../../domain/eic-model";
import {DatasourceService} from "../../../../services/datasource.service";
import {pidHandler} from '../../../../shared/pid-handler/pid-handler.service';
import {GuidelinesService} from "../../../../services/guidelines.service";

declare var UIkit: any;

@Component({
  selector: 'app-resource-dashboard',
  templateUrl: './resource-dashboard.component.html',
})
export class ResourceDashboardComponent implements OnInit {

  _marketplaceServicesURL = environment.marketplaceServicesURL;
  serviceORresource = environment.serviceORresource;
  catalogueConfigId: string = this.config.getProperty('catalogueConfigId');
  catalogueId: string;
  providerId: string;
  resourceId: string;
  monitoringId: string;
  helpdeskId: string;
  datasourceId: string; //subprofile

  resourceGuidelines: ResourceInteroperabilityRecord;
  guidelines: InteroperabilityRecord[] = [];

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
    this.catalogueId = this.route.snapshot.paramMap.get('catalogueId');
    this.providerId = this.route.snapshot.paramMap.get('providerId');
    this.resourceId = this.route.snapshot.paramMap.get('resourceId');
    // console.log(this.providerId);
    this.providerPID = decodeURIComponent(this.providerId);
    this.resourcePID = decodeURIComponent(this.resourceId);
    // console.log(this.providerPID);
    this.resourceService.getServiceBundleById(this.resourceId, this.catalogueId).subscribe(
      res => { if (res!=null) this.resourceBundle = res },
      error => {},
      () => {
        this.datasourceService.getDatasourceByServiceId(this.resourceId, this.catalogueId).subscribe(
          res => { if (res!=null) this.datasourceId = res.id }
        );
        if (this.catalogueId === this.catalogueConfigId){
          this.serviceExtensionsService.getMonitoringByServiceId(this.resourceId).subscribe(
            res => { if (res!=null) this.monitoringId = res.id }
          );
          this.serviceExtensionsService.getHelpdeskByServiceId(this.resourceId).subscribe(
            res => { if (res!=null) this.helpdeskId = res.id }
          );
        }

        this.guidelinesService.getGuidelinesOfResource(this.resourceId).subscribe(
          res => {
            if (res != null) this.resourceGuidelines = res;
            console.log(res);
          },
          err => console.log(err),
          () => {
            this.guidelinesService.getInteroperabilityRecords('0', '9999').subscribe(
              res => {
                if (res != null) this.guidelines = res['results'];
                console.log(this.guidelines);
              }
            );
          }
        );
      }
    );
  }

  getGuidelineName(id: string): string {
    return this.guidelines?.find(g => g.id === id)?.title || id;
  }

  showDatasourceDeletionModal() {
    UIkit.modal('#datasourceDeletionModal').show();
  }

  deleteDatasource(id: string) {
    UIkit.modal('#spinnerModal').show();
    this.datasourceService.deleteDatasource(id).subscribe(
      res => {},
      error => {
        // console.log(error);
        UIkit.modal('#spinnerModal').hide();
        this.errorMessage = 'Something went bad. ' + error.error ;
      },
      () => {
        UIkit.modal('#spinnerModal').hide();
        window.location.reload()
      }
    );
  }

}
