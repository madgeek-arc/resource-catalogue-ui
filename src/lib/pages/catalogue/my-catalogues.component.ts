import {Component, OnInit} from '@angular/core';
import {ServiceProviderService} from '../../services/service-provider.service';
import {ResourceService} from '../../services/resource.service';
import {AuthenticationService} from '../../services/authentication.service';
import {CatalogueBundle} from '../../domain/eic-model';
import {zip} from 'rxjs';
import {environment} from '../../../environments/environment';
import {CatalogueService} from "../../services/catalogue.service";

@Component({
  selector: 'app-my-catalogues',
  templateUrl: './my-catalogues.component.html'
})
export class MyCataloguesComponent implements OnInit {

  serviceORresource = environment.serviceORresource;

  errorMessage: string;
  noCataloguesMessage: string;

  myCatalogues: CatalogueBundle[];
  serviceTemplatePerProvider: any[] = [];
  hasDraftServices: { id: string, flag: boolean }[] = [];
  hasRejectedServices: { id: string, flag: boolean }[] = [];

  myApprovedCatalogues: CatalogueBundle[] = [];
  myPendingActionCatalogues: CatalogueBundle[] = [];
  myRejectedCatalogues: CatalogueBundle[] = [];
  // myIncompleteCatalogues: CatalogueBundle[] = [];

  isApprovedChecked = true;
  isPendingChecked = true;
  isRejectedChecked = true;
  isIncompleteChecked = true;

  // public templateStatuses: Array<string> = ['approved template', 'pending template', 'rejected template', 'no template status'];
  // public templateLabels: Array<string> = ['Approved', 'Pending', 'Rejected', 'No Status'];

  constructor(
    private serviceProviderService: ServiceProviderService,
    private catalogueService: CatalogueService,
    private resourceService: ResourceService,
    public authenticationService: AuthenticationService
  ) {
  }

  ngOnInit() {
    zip(this.catalogueService.getMyCatalogues())
      .subscribe(
        res => {
          this.myCatalogues = res[0];
        },
        err => {
          this.errorMessage = 'An error occurred!';
          console.error(err);
        },
        () => {
          this.myCatalogues.forEach(
            p => {
              this.assignCatalogueToList(p);
            }
          );
          if (this.myCatalogues.length === 0) {
            this.noCataloguesMessage = 'You have not yet registered any catalogues.';
          }
        }
      );
  }

  /*
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
      return '/provider/' + id + '/add-first-resource';
    }
  }
  */

  assignCatalogueToList(p: CatalogueBundle) {
    if (p.status === 'rejected catalogue') {
      this.myRejectedCatalogues.push(p);
    } else if ((p.status === 'approved catalogue')) {
      this.myApprovedCatalogues.push(p);
    } else {
      this.myPendingActionCatalogues.push(p);
    }
  }

  onCheckChanged(e, status: string) {

    if (status === 'approved catalogue') {
      this.isApprovedChecked = e.target.checked;
    } else if (status === 'pending catalogue') {
      this.isPendingChecked = e.target.checked;
    } else if (status === 'rejected catalogue') {
      this.isRejectedChecked = e.target.checked;
    }
    // else if (status === 'incomplete') {
    //   this.isIncompleteChecked = e.target.checked;
    // }
  }

}
