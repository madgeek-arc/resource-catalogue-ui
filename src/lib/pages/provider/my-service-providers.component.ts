import {Component, OnInit} from '@angular/core';
import {ServiceProviderService} from '../../services/service-provider.service';
import {AuthenticationService} from '../../services/authentication.service';
import {ProviderBundle} from '../../domain/eic-model';
import {zip} from 'rxjs';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-my-service-providers',
  templateUrl: './my-service-providers.component.html'
})
export class MyServiceProvidersComponent implements OnInit {

  serviceORresource = environment.serviceORresource;

  errorMessage: string;
  noProvidersMessage: string;

  myProviders: ProviderBundle[];
  myPendingProviders: ProviderBundle[];
  pendingFirstServicePerProvider: any[] = [];
  hasPendingServices: { id: string, flag: boolean }[] = [];

  myApprovedProviders: ProviderBundle[] = [];
  myPendingActionProviders: ProviderBundle[] = [];
  myRejectedProviders: ProviderBundle[] = [];
  myIncompleteProviders: ProviderBundle[] = [];

  isApprovedChecked = true;
  isPendingChecked = true;
  isRejectedChecked = true;
  isIncompleteChecked = true;

  constructor(
    private serviceProviderService: ServiceProviderService,
    public authenticationService: AuthenticationService
  ) {
  }

  ngOnInit() {
    zip(
      this.serviceProviderService.getMyServiceProviders(),
      this.serviceProviderService.getMyPendingProviders())
      .subscribe(
        res => {
          this.myProviders = res[0];
          this.myPendingProviders = res[1];
          this.myIncompleteProviders = res[1];
        },
        err => {
          this.errorMessage = 'An error occurred!';
          console.error(err);
        },
        () => {
          this.myProviders.forEach(
            p => {
              if ((p.status === 'pending template approval') || (p.status === 'rejected template')) {
                this.serviceProviderService.getPendingServicesOfProvider(p.id).subscribe(
                  res => {
                    if (res && (res.length > 0)) {
                      this.pendingFirstServicePerProvider.push({providerId: p.id, serviceId: res[0].id});
                    }
                  }
                );
              }
              if (p.status === 'pending template submission') {
                // console.log(p.id);
                this.serviceProviderService.getPendingServicesByProvider(p.id, '0', '50', 'ASC', 'name').subscribe(
                  res => {
                    if (res.results.length > 0) {
                      this.hasPendingServices.push({id: p.id, flag: true});
                    } else {
                      this.hasPendingServices.push({id: p.id, flag: false});
                    }
                    // console.log(this.hasPendingServices);
                  }
                );
              }
              this.assignProviderToList(p);
            }
          );
          if (this.myProviders.length === 0) {
            this.noProvidersMessage = 'You have not yet registered any service providers.';
          }
        }
      );
  }

  hasCreatedFirstService(id: string) {
    return this.pendingFirstServicePerProvider.some(x => x.providerId === id);
  }

  checkForPendingServices(id: string): boolean {
    for (let i = 0; i < this.hasPendingServices.length; i++) {
      if (this.hasPendingServices[i].id === id) {
        return this.hasPendingServices[i].flag;
      }
    }
    return false;
  }

  getLinkToFirstService(id: string) {
    if (this.hasCreatedFirstService(id)) {
      return '/provider/' + id + '/resource/update/' + this.pendingFirstServicePerProvider.filter(x => x.providerId === id)[0].serviceId;
    } else {
      return '/provider/' + id + '/add-resource-template';
    }
  }

  assignProviderToList(p: ProviderBundle) {
    if ((p.status === 'rejected template') || (p.status === 'rejected')) {
      this.myRejectedProviders.push(p);
    } else if ((p.status === 'approved')) {
      this.myApprovedProviders.push(p);
    } else {
      this.myPendingActionProviders.push(p);
    }
  }

  onCheckChanged(e, status: string) {

    if (status === 'approved') {
      this.isApprovedChecked = e.target.checked;
    } else if (status === 'pending') {
      this.isPendingChecked = e.target.checked;
    } else if (status === 'rejected') {
      this.isRejectedChecked = e.target.checked;
    } else if (status === 'incomplete') {
      this.isIncompleteChecked = e.target.checked;
    }
  }

}
