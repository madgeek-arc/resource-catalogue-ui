import {Component, OnInit} from '@angular/core';
import {ServiceProviderService} from '../../services/service-provider.service';
import {ResourceService} from '../../services/resource.service';
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
  serviceTemplatePerProvider: any[] = [];
  hasDraftServices: { id: string, flag: boolean }[] = [];
  hasRejectedServices: { id: string, flag: boolean }[] = [];

  myApprovedProviders: ProviderBundle[] = [];
  myPendingActionProviders: ProviderBundle[] = [];
  myRejectedProviders: ProviderBundle[] = [];
  myIncompleteProviders: ProviderBundle[] = [];

  isApprovedChecked = true;
  isPendingChecked = true;
  isRejectedChecked = true;
  isIncompleteChecked = true;

  public templateStatuses: Array<string> = ['approved template', 'pending template', 'rejected template', 'no template status'];
  public templateLabels: Array<string> = ['Approved', 'Pending', 'Rejected', 'No Status'];

  constructor(
    private serviceProviderService: ServiceProviderService,
    private resourceService: ResourceService,
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
              // if ((p.status === 'pending template approval') || (p.status === 'rejected template')) {
              // if ((p.templateStatus === 'pending template') || (p.templateStatus === 'rejected template')) {
              if (p.templateStatus === 'pending template') {
                this.resourceService.getResourceTemplateOfProvider(p.id).subscribe(
                  res => {
                    if (res) {
                      this.serviceTemplatePerProvider.push({providerId: p.id, serviceId: JSON.parse(JSON.stringify(res)).id});
                    }
                  }
                );
              }
              // if (p.status === 'pending template submission') {
              if (p.status === 'approved provider') {
                // console.log(p.id);
                this.serviceProviderService.getDraftServicesByProvider(p.id, '0', '50', 'ASC', 'name').subscribe(
                  res => {
                    if (res.results.length > 0) {
                      this.hasDraftServices.push({id: p.id, flag: true});
                    } else {
                      this.hasDraftServices.push({id: p.id, flag: false});
                    }
                    // console.log(this.hasDraftServices);
                  }
                );
              }
              if ((p.templateStatus === 'rejected template')) {
                this.serviceProviderService.getRejectedResourcesOfProvider(p.id, '0', '50', 'ASC', 'name').subscribe(
                  res => {
                    if (res.results.length > 0) {
                      this.hasRejectedServices.push({id: p.id, flag: true});
                    } else {
                      this.hasRejectedServices.push({id: p.id, flag: false});
                    }
                  }
                );
              }
              this.assignProviderToList(p);
            }
          );
          if (this.myProviders.length === 0) {
            this.noProvidersMessage = 'You have not yet registered any '+this.serviceORresource+' Providers.';
          }
        }
      );
  }

  hasCreatedFirstService(id: string) {
    return this.serviceTemplatePerProvider.some(x => x.providerId === id);
  }

  checkForDraftServices(id: string): boolean {
    for (let i = 0; i < this.hasDraftServices.length; i++) {
      if (this.hasDraftServices[i].id === id) {
        return this.hasDraftServices[i].flag;
      }
    }
    return false;
  }

  checkForRejectedServices(id: string): boolean {
    for (let i = 0; i < this.hasRejectedServices.length; i++) {
      if (this.hasRejectedServices[i].id === id) {
        // console.log('rejected flag', id, 'returns', this.hasRejectedServices[i].flag);
        return this.hasRejectedServices[i].flag;
      }
    }
    // console.log('rejected return false', id);
    return false;
  }

  getLinkToFirstService(id: string) {
    if (this.hasCreatedFirstService(id)) {
      return '/provider/' + id + '/resource/update/' + this.serviceTemplatePerProvider.filter(x => x.providerId === id)[0].serviceId;
    } else {
      return '/provider/' + id + '/add-first-service';
    }
  }

  getLinkToFirstDatasource(id: string) { //TODO: revisit when making draft datasources
    // if (this.hasCreatedFirstService(id)) {
    //   return '/provider/' + id + '/datasource/update/' + this.serviceTemplatePerProvider.filter(x => x.providerId === id)[0].serviceId;
    // } else {
      return '/provider/' + id + '/add-first-datasource';
    // }
  }

  assignProviderToList(p: ProviderBundle) {
    if (p.status === 'rejected provider') {
      this.myRejectedProviders.push(p);
    } else if ((p.status === 'approved provider')) {
      this.myApprovedProviders.push(p);
    } else {
      this.myPendingActionProviders.push(p);
    }
  }

  onCheckChanged(e, status: string) {

    if (status === 'approved provider') {
      this.isApprovedChecked = e.target.checked;
    } else if (status === 'pending provider') {
      this.isPendingChecked = e.target.checked;
    } else if (status === 'rejected provider') {
      this.isRejectedChecked = e.target.checked;
    } else if (status === 'incomplete') {
      this.isIncompleteChecked = e.target.checked;
    }
  }

}
