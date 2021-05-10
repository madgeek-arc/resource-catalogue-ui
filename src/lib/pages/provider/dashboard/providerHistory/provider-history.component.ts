import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ProviderBundle, Service, ServiceHistory} from '../../../../domain/eic-model';
import {NavigationService} from '../../../../services/navigation.service';
import {ResourceService} from '../../../../services/resource.service';
import {Paging} from '../../../../domain/paging';
import {environment} from '../../../../../environments/environment';
import {ServiceProviderService} from '../../../../services/service-provider.service';

@Component({
  selector: 'app-service-dashboard',
  templateUrl: './provider-history.component.html',
  styleUrls: ['../resource-dashboard/service-stats.component.css']
})
export class ProviderHistoryComponent implements OnInit {

  serviceORresource = environment.serviceORresource;
  projectName = environment.projectName;

  providerId: string;
  providerBundle: ProviderBundle;

  public service: Service;
  public errorMessage: string;

  providerHistory: Paging<ServiceHistory>;

  constructor(private route: ActivatedRoute,
              private router: NavigationService,
              private resourceService: ResourceService,
              private providerService: ServiceProviderService) {
  }

  ngOnInit() {
    this.providerId = this.route.parent.snapshot.paramMap.get('provider');
    this.getProvider();

    this.providerService.getProviderHistory(this.providerId).subscribe(
      searchResults => this.providerHistory = searchResults,
      err => {
        this.errorMessage = 'An error occurred while retrieving the history of this service. ' + err.error;
      }
    );
  }

  getProvider() {
    this.providerService.getServiceProviderBundleById(this.providerId).subscribe(
      providerBundle => {
        this.providerBundle = providerBundle;
      }, error => {
        console.log(error);
      }
    );
  }

}
