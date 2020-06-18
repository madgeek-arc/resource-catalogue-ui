import {Component, OnInit} from '@angular/core';
import {ServiceProviderService} from '../../services/service-provider.service';
import {AuthenticationService} from '../../services/authentication.service';
import {ProviderBundle} from '../../domain/eic-model';

@Component({
  selector: 'app-my-service-providers',
  templateUrl: './my-service-providers.component.html'
})
export class MyServiceProvidersComponent implements OnInit {
  errorMessage: string;
  noProvidersMessage: string;
  tilesView: boolean;

  myProviders: ProviderBundle[];
  myPendingProviders: ProviderBundle[];
  pendingFirstServicePerProvider: any[] = [];
  hasPendingServices: {id: string, flag: boolean}[] = [];

  constructor(
    private serviceProviderService: ServiceProviderService,
    public authenticationService: AuthenticationService
  ) {
  }

  ngOnInit() {
    this.tilesView = true;
    this.getServiceProviders();
    this.getPendingProviders();
  }

  getPendingProviders() {
    this.serviceProviderService.getMyPendingProviders().subscribe(
      res => this.myPendingProviders = res,
      err => {
        console.log(err);
        // this.errorMessage = 'An error occurred!';
        if (err['status'] === 401) {
          this.authenticationService.login();
        }
      }/*,
      () => {
        this.myPendingProviders.forEach(
          p => {
            if ((p.status === 'pending service template approval') || (p.status === 'rejected service template')) {
              this.serviceProviderService.getPendingServicesOfProvider(p.id).subscribe(
                res => {
                  if (res && (res.length > 0)) {
                    this.pendingFirstServicePerProvider.push({providerId: p.id, serviceId: res[0].id});
                  }
                }
              );
            }
            if (p.metadata !== null && p.metadata.source === 'Meril' && p.status === 'pending service template submission') {
              console.log(p.id);
              this.serviceProviderService.getPendingServicesByProvider(p.id).subscribe(
                res => {
                  if (res.results.length > 0) {
                    this.hasPendingServices.push({id: p.id, flag: true});
                  } else {
                    this.hasPendingServices.push({id: p.id, flag: false});
                  }
                  console.log(this.hasPendingServices);
                }
              );
            }
          }
        );
      }*/
    );
  }

  getServiceProviders() {
    this.serviceProviderService.getMyServiceProviders().subscribe(
      res => this.myProviders = res,
      err => {
        this.errorMessage = 'An error occurred!';
        console.log(err);
        if (err['status'] === 401) {
          this.authenticationService.login();
        }
      },
      () => {
        this.myProviders.forEach(
          p => {
            if ((p.status === 'pending service template approval') || (p.status === 'rejected service template')) {
              this.serviceProviderService.getPendingServicesOfProvider(p.id).subscribe(
                res => {
                  if (res && (res.length > 0)) {
                    this.pendingFirstServicePerProvider.push({providerId: p.id, serviceId: res[0].id});
                  }
                }
              );
            }
            if (p.status === 'pending service template submission') {
              // console.log(p.id);
              this.serviceProviderService.getPendingServicesByProvider(p.id, 50).subscribe(
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
    for (let i = 0; i < this.hasPendingServices.length ; i++) {
      if (this.hasPendingServices[i].id === id) {
        return this.hasPendingServices[i].flag;
      }
    }
    return false;
  }

  getLinkToFirstService(id: string) {
    if (this.hasCreatedFirstService(id)) {
      // return '/newServiceProvider/' + id + '/editFirstService/' + this.pendingFirstServicePerProvider.filter(x => x.providerId === id)[0].serviceId; // TODO: what is this?
      return '/edit/' + this.pendingFirstServicePerProvider.filter(x => x.providerId === id)[0].serviceId;
    } else {
      return '/newServiceProvider/' + id + '/addFirstService';
    }
  }

  toggleTiles() {
    this.tilesView = !this.tilesView;
  }

}
