import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AuthenticationService} from '../../../../services/authentication.service';
import {ResourceService} from '../../../../services/resource.service';
import {ServiceExtensionsService} from '../../../../services/service-extensions.service';
import {NavigationService} from '../../../../services/navigation.service';
import {environment} from '../../../../../environments/environment';
import {ServiceBundle} from "../../../../domain/eic-model";
import {DatasourceService} from "../../../../services/datasource.service";

declare var UIkit: any;

@Component({
  selector: 'app-resource-dashboard',
  templateUrl: './resource-dashboard.component.html',
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

  resourceBundle: ServiceBundle;
  errorMessage: string;

  constructor(public authenticationService: AuthenticationService,
              public resourceService: ResourceService,
              public serviceExtensionsService: ServiceExtensionsService,
              public datasourceService: DatasourceService,
              public router: NavigationService,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.catalogueId = this.route.snapshot.paramMap.get('catalogueId');
    this.providerId = this.route.snapshot.paramMap.get('providerId');
    this.resourceId = this.route.snapshot.paramMap.get('resourceId');
    this.resourceService.getServiceBundleById(this.resourceId, this.catalogueId).subscribe(
      res => { if (res!=null) this.resourceBundle = res },
      error => {},
      () => {
        this.serviceExtensionsService.getMonitoringByServiceId(this.resourceId).subscribe(
          res => { if (res!=null) this.monitoringId = res.id }
        );
        this.serviceExtensionsService.getHelpdeskByServiceId(this.resourceId).subscribe(
          res => { if (res!=null) this.helpdeskId = res.id }
        );
        this.datasourceService.getDatasourceByServiceId(this.resourceId).subscribe(
          res => { if (res!=null) this.datasourceId = res.id }
        );
      }
    );
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
