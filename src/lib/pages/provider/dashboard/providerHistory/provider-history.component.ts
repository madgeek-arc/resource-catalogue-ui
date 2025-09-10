import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {LoggingInfo, ProviderBundle, Service} from '../../../../domain/eic-model';
import {NavigationService} from '../../../../services/navigation.service';
import {ResourceService} from '../../../../services/resource.service';
import {Paging} from '../../../../domain/paging';
import {environment} from '../../../../../environments/environment';
import {ServiceProviderService} from '../../../../services/service-provider.service';
import {pidHandler} from "../../../../shared/pid-handler/pid-handler.service";
import {ConfigService} from "../../../../services/config.service";


@Component({
  selector: 'app-service-dashboard',
  templateUrl: './provider-history.component.html',
  styleUrls: ['../resource-dashboard/service-stats.component.css']
})
export class ProviderHistoryComponent implements OnInit {

  serviceORresource = environment.serviceORresource;
  catalogueConfigId: string | null = null;
  catalogueId: string;
  providerId: string;
  providerBundle: ProviderBundle;
  providerHistory: Paging<LoggingInfo>;

  public service: Service;
  public errorMessage: string;

  constructor(private route: ActivatedRoute,
              private navigator: NavigationService,
              private resourceService: ResourceService,
              private providerService: ServiceProviderService,
              public pidHandler: pidHandler,
              public config: ConfigService) {
  }

  ngOnInit() {
    this.catalogueConfigId = this.config.getProperty('catalogueId');
    // console.log(this.route.parent.snapshot)
    this.providerId = this.route.parent.snapshot.paramMap.get('provider');
    this.catalogueId = this.route.parent.snapshot.paramMap.get('catalogueId');
    this.getProvider();

    this.providerService.getProviderLoggingInfoHistory(this.providerId, this.catalogueId).subscribe(
      res => this.providerHistory = res,
      err => {
        this.errorMessage = 'An error occurred while retrieving the history of this service. ' + err.error;
      }
    );
  }

  getProvider() {
    this.providerService.getServiceProviderBundleById(this.providerId, this.catalogueId).subscribe(
      providerBundle => {
        this.providerBundle = providerBundle;
      }, error => {
        console.log(error);
      }
    );
  }

}
