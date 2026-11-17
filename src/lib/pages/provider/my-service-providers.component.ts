import {Component, OnInit} from '@angular/core';
import {ServiceProviderService} from '../../services/service-provider.service';
import {ResourceService} from '../../services/resource.service';
import {AuthenticationService} from '../../services/authentication.service';
import {ProviderBundle} from '../../domain/eic-model';
import {zip} from 'rxjs';
import {ConfigService} from "../../services/config.service";
import {environment} from '../../../environments/environment';
import {pidHandler} from "../../shared/pid-handler/pid-handler.service";

@Component({
    selector: 'app-my-service-providers',
    templateUrl: './my-service-providers.component.html',
    standalone: false
})
export class MyServiceProvidersComponent implements OnInit {

  serviceORresource = environment.serviceORresource;

  errorMessage: string;
  noProvidersMessage: string;

  myProviders: ProviderBundle[];
  myPendingProviders: ProviderBundle[];
  serviceTemplatePerProvider: any[] = [];
  hasDraftServices: { id: string, flag: boolean }[] = [];
  hasDraftDatasources: { id: string, flag: boolean }[] = [];
  hasRejectedServices: { id: string, flag: boolean }[] = [];
  hasRejectedDatasources: { id: string, flag: boolean }[] = [];
  hasRejectedTrainingResources: { id: string, flag: boolean }[] = [];
  hasRejectedDeployableServices: { id: string, flag: boolean }[] = [];

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
    public authenticationService: AuthenticationService,
    public pidHandler: pidHandler,
    public config: ConfigService
  ) {
  }

  ngOnInit() {
    zip(
      this.serviceProviderService.getMyProviders(),
      this.serviceProviderService.getMyProviders(true))
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
                      this.serviceTemplatePerProvider.push({
                        providerId: p.id, serviceId: JSON.parse(JSON.stringify(res)).id,
                        service: JSON.parse(JSON.stringify(res)).service,
                        datasource: JSON.parse(JSON.stringify(res)).datasource,
                        trainingResource: JSON.parse(JSON.stringify(res)).trainingResource,
                        deployableApplication: JSON.parse(JSON.stringify(res)).deployableApplication,
                        adapter: JSON.parse(JSON.stringify(res)).adapter,
                        interoperabilityRecord: JSON.parse(JSON.stringify(res)).interoperabilityRecord
                      });
                    }
                  }
                );
              }
              // if (p.status === 'pending template submission') {
              if (p.status === 'approved' && p.organisation.catalogueId == null) {
                // console.log(p.id);
                this.resourceService.getDraftServicesByProvider(p.id, '0', '50', 'ASC', 'name').subscribe(
                  res => {
                    if (res.results?.length > 0) {
                      this.hasDraftServices.push({id: p.id, flag: true});
                    } else {
                      this.hasDraftServices.push({id: p.id, flag: false});
                    }
                    // console.log(this.hasDraftServices);
                  }
                );
                this.resourceService.getDraftServicesByProvider(p.id, '0', '50', 'ASC', 'name').subscribe(
                  res => {
                    if (res.results?.length > 0) {
                      this.hasDraftDatasources.push({id: p.id, flag: true});
                    } else {
                      this.hasDraftDatasources.push({id: p.id, flag: false});
                    }
                  }
                );
              }
              if ((p.templateStatus === 'rejected template')) {
                this.serviceProviderService.getRejectedResourcesOfProvider(p.id, '0', '50', 'ASC', 'name', 'service').subscribe(
                  res => {
                    if (res.results?.length > 0) {
                      this.hasRejectedServices.push({id: p.id, flag: true});
                    } else {
                      this.hasRejectedServices.push({id: p.id, flag: false});
                    }
                  }
                );
                this.serviceProviderService.getRejectedResourcesOfProvider(p.id, '0', '50', 'ASC', 'name', 'datasource').subscribe(
                  res => {
                    if (res.results?.length > 0) {
                      this.hasRejectedDatasources.push({id: p.id, flag: true});
                    } else {
                      this.hasRejectedDatasources.push({id: p.id, flag: false});
                    }
                  }
                );
                this.serviceProviderService.getRejectedResourcesOfProvider(p.id, '0', '50', 'ASC', 'name', 'training_resource').subscribe(
                  res => {
                    if (res.results?.length > 0) {
                      this.hasRejectedTrainingResources.push({id: p.id, flag: true});
                    } else {
                      this.hasRejectedTrainingResources.push({id: p.id, flag: false});
                    }
                  }
                );
                this.serviceProviderService.getRejectedResourcesOfProvider(p.id, '0', '50', 'ASC', 'name', 'deployable_application').subscribe(
                  res => {
                    if (res.results?.length > 0) {
                      this.hasRejectedDeployableServices.push({id: p.id, flag: true});
                    } else {
                      this.hasRejectedDeployableServices.push({id: p.id, flag: false});
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

  hasCreatedFirstService(providerId: string) {
    for (let i = 0; i < this.serviceTemplatePerProvider.length; i++) {
      if (this.serviceTemplatePerProvider[i].providerId == providerId) {
        if (this.serviceTemplatePerProvider[i].service) {
          return true;
        }
      }
    }
    return false;
  }

  hasCreatedFirstDatasource(providerId: string) {
    for (let i = 0; i < this.serviceTemplatePerProvider.length; i++) {
      if (this.serviceTemplatePerProvider[i].providerId == providerId) {
        if (this.serviceTemplatePerProvider[i].datasource) {
          return true;
        }
      }
    }
    return false;
  }

  hasCreatedFirstTrainingResource(providerId: string) {
    for (let i = 0; i < this.serviceTemplatePerProvider.length; i++) {
      if (this.serviceTemplatePerProvider[i].providerId == providerId) {
        if (this.serviceTemplatePerProvider[i].trainingResource) {
          return true;
        }
      }
    }
    return false;
  }

  hasCreatedFirstDeployableApplication(providerId: string) {
    for (let i = 0; i < this.serviceTemplatePerProvider.length; i++) {
      if (this.serviceTemplatePerProvider[i].providerId == providerId) {
        // console.log(this.serviceTemplatePerProvider[i]);
        if (this.serviceTemplatePerProvider[i].deployableApplication) {
          return true;
        }
      }
    }
    return false;
  }

  checkForDraftServices(id: string): boolean {
    for (let i = 0; i < this.hasDraftServices.length; i++) {
      if (this.hasDraftServices[i].id === id) {
        return this.hasDraftServices[i].flag;
      }
    }
    return false;
  }

  checkForDraftDatasources(id: string): boolean {
    for (let i = 0; i < this.hasDraftDatasources.length; i++) {
      if (this.hasDraftDatasources[i].id === id) {
        return this.hasDraftDatasources[i].flag;
      }
    }
    return false;
  }

  checkForRejectedServices(id: string): boolean {
    for (let i = 0; i < this.hasRejectedServices.length; i++) {
      if (this.hasRejectedServices[i].id === id) {
        return this.hasRejectedServices[i].flag;
      }
    }
    return false;
  }

  checkForRejectedDatasources(id: string): boolean {
    for (let i = 0; i < this.hasRejectedDatasources.length; i++) {
      if (this.hasRejectedDatasources[i].id === id) {
        return this.hasRejectedDatasources[i].flag;
      }
    }
    return false;
  }

  checkForRejectedTrainingResources(id: string): boolean {
    for (let i = 0; i < this.hasRejectedTrainingResources.length; i++) {
      if (this.hasRejectedTrainingResources[i].id === id) {
        return this.hasRejectedTrainingResources[i].flag;
      }
    }
    return false;
  }

  checkForRejectedDeployableServices(id: string): boolean {
    for (let i = 0; i < this.hasRejectedDeployableServices.length; i++) {
      if (this.hasRejectedDeployableServices[i].id === id) {
        return this.hasRejectedDeployableServices[i].flag;
      }
    }
    return false;
  }

  getLinkToFirstService(id: string) {
    if (this.hasCreatedFirstService(id)) {
      return '/provider/' + this.pidHandler.customEncodeURIComponent(id) + '/resource/update/' + this.pidHandler.customEncodeURIComponent(this.serviceTemplatePerProvider.filter(x => x.providerId === id)[0].serviceId);
    } else {
      return '/provider/' + this.pidHandler.customEncodeURIComponent(id) + '/add-first-service';
    }
  }

  getLinkToFirstDatasource(id: string) {
    if (this.hasCreatedFirstDatasource(id)) {
      return '/provider/' + this.pidHandler.customEncodeURIComponent(id) + '/datasource/update/' + this.pidHandler.customEncodeURIComponent(this.serviceTemplatePerProvider.filter(x => x.providerId === id)[0].serviceId);
    } else {
      return  '/provider/' + this.pidHandler.customEncodeURIComponent(id) + '/datasource/select-first';
    }
  }

  getLinkToFirstTrainingResource(id: string) {
    if (this.hasCreatedFirstTrainingResource(id)) {
      return '/provider/' + this.pidHandler.customEncodeURIComponent(id) + '/training-resource/update/' + this.pidHandler.customEncodeURIComponent(this.serviceTemplatePerProvider.filter(x => x.providerId === id)[0].serviceId);
    } else {
      return '/provider/' + this.pidHandler.customEncodeURIComponent(id) + '/add-first-training-resource';
    }
  }

  getLinkToFirstDeployableApplication(id: string) {
    if (this.hasCreatedFirstDeployableApplication(id)) {
      return '/provider/' + this.pidHandler.customEncodeURIComponent(id) + '/deployable-service/update/' + this.pidHandler.customEncodeURIComponent(this.serviceTemplatePerProvider.filter(x => x.providerId === id)[0].serviceId);
    } else {
      return '/provider/' + this.pidHandler.customEncodeURIComponent(id) + '/add-first-deployable-service';
    }
  }

  hasCreatedFirstAdapter(providerId: string) {
    return this.serviceTemplatePerProvider.some(x => x.providerId == providerId && x.adapter);
  }

  hasCreatedFirstGuideline(providerId: string) {
    return this.serviceTemplatePerProvider.some(x => x.providerId == providerId && x.interoperabilityRecord);
  }

  getLinkToFirstAdapter(id: string) {
    if (this.hasCreatedFirstAdapter(id)) {
      return '/provider/' + this.pidHandler.customEncodeURIComponent(id) + '/adapter/update/' + this.pidHandler.customEncodeURIComponent(this.serviceTemplatePerProvider.filter(x => x.providerId === id)[0].serviceId);
    } else {
      return '/provider/' + this.pidHandler.customEncodeURIComponent(id) + '/adapter/add';
    }
  }

  getLinkToFirstGuideline(id: string) {
    if (this.hasCreatedFirstGuideline(id)) {
      return '/guidelines/' + this.pidHandler.customEncodeURIComponent(id) + '/update/' + this.pidHandler.customEncodeURIComponent(this.serviceTemplatePerProvider.filter(x => x.providerId === id)[0].serviceId);
    } else {
      return '/guidelines/' + this.pidHandler.customEncodeURIComponent(id) + '/add';
    }
  }

  assignProviderToList(p: ProviderBundle) {
    if (p.status === 'rejected') {
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
