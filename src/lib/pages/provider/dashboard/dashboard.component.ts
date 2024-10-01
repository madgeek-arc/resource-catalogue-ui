import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AuthenticationService} from '../../../services/authentication.service';
import {NavigationService} from '../../../services/navigation.service';
import {ResourceService} from '../../../services/resource.service';
import {environment} from '../../../../environments/environment';
import {ServiceProviderService} from '../../../services/service-provider.service';
import {ProviderBundle} from '../../../domain/eic-model';

declare var UIkit: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {

  catalogueId: string;
  providerId: string;
  providerStatus: string;
  providerBundle: ProviderBundle;
  serviceORresource = environment.serviceORresource;

  constructor(public authenticationService: AuthenticationService,
              public resourceService: ResourceService,
              public serviceProviderService: ServiceProviderService,
              public navigator: NavigationService,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    // this.activeTab = this.route.firstChild.snapshot.routeConfig.path;
    this.catalogueId = this.route.snapshot.paramMap.get('catalogueId');
    this.providerId = this.route.snapshot.paramMap.get('provider');
    this.getProvider();
  }

  getProvider() {
    this.serviceProviderService.getServiceProviderBundleById(this.providerId, this.catalogueId).subscribe(
      providerBundle => this.providerBundle = providerBundle,
      error =>  console.log(error),
      () => this.providerStatus = this.providerBundle.status
    );
  }

  showRequestDeletionModal() {
      UIkit.modal('#requestDeletionModal').show();
  }

  requestProviderDeletion(providerId) {
    this.serviceProviderService.requestProviderDeletion(providerId)
      .subscribe(
        res => {
          UIkit.modal('#requestDeletionModal').hide();
        },
        err => {
          UIkit.modal('#requestDeletionModal').hide();
          console.log(err);
        },
        () => {}
      );
  }

  protected readonly encodeURIComponent = encodeURIComponent;
}
