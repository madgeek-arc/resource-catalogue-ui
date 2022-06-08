import {Component, Injector, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DatePipe} from '@angular/common';
import {DatasourceFormComponent} from "./datasource-form.component";
import {AuthenticationService} from '../../services/authentication.service';
import {Subscription} from 'rxjs';
import {Service} from '../../domain/eic-model';
import {ResourceService} from '../../services/resource.service';
import {ServiceProviderService} from '../../services/service-provider.service';
import {NavigationService} from "../../services/navigation.service";


@Component({
  selector: 'app-update-datasource',
  templateUrl: './datasource-form.component.html',
  // styleUrls: ['../provider/service-provider-form.component.css']
})
export class UpdateDatasourceComponent extends DatasourceFormComponent implements OnInit {
  private sub: Subscription;

  // private serviceID: string;

  constructor(public route: ActivatedRoute,
              public authenticationService: AuthenticationService,
              protected serviceProviderService: ServiceProviderService,
              protected injector: Injector,
              public datePipe: DatePipe,
              public navigationService: NavigationService) {
    super(injector, authenticationService, serviceProviderService, route);
    this.editMode = true;
  }

  ngOnInit() {
    super.ngOnInit();
    if (sessionStorage.getItem('service')) {
      sessionStorage.removeItem('service');
    } else {
      this.sub = this.route.params.subscribe(params => {
        this.serviceID = params['resourceId'];
        const pathName = window.location.pathname;
        if (pathName.includes('draft-resource/update')) {
          this.pendingService = true;
        }
        // this.resourceService.getService(this.serviceID).subscribe(service => {
        this.resourceService[this.pendingService ? 'getPendingService' : 'getRichService'](this.serviceID)
          .subscribe(richService => {
              if (richService.service.mainContact === null) //in case of unauthorized access backend will not show sensitive info
                this.navigationService.go('/forbidden') // TODO: recheck with backend
              ResourceService.removeNulls(richService.service);
              this.formPrepare(richService);
              this.serviceForm.patchValue(richService.service);
              for (const i in this.serviceForm.controls) {
                if (this.serviceForm.controls[i].value === null) {
                  this.serviceForm.controls[i].setValue('');
                }
              }
              if (this.serviceForm.get('lastUpdate').value) {
                const lastUpdate = new Date(this.serviceForm.get('lastUpdate').value);
                this.serviceForm.get('lastUpdate').setValue(this.datePipe.transform(lastUpdate, 'yyyy-MM-dd'));
              }
            },
            err => this.errorMessage = 'Could not get the data for the requested service. ' + err.error,
            () => {
              if (window.location.href.indexOf('/add/use-template') > -1) {
                this.editMode = false;
                this.serviceForm.get('id').setValue('');
                this.serviceForm.get('name').setValue('');
              }
              this.initServiceBitSets();
            }
          );
      });
    }
  }

  onSubmit(service: Service, tempSave: boolean) {
    super.onSubmit(service, tempSave, this.pendingService);
  }

  initServiceBitSets() {
    this.handleBitSets(0, 0, 'name');
    this.handleBitSets(0, 21, 'abbreviation');
    this.handleBitSets(0, 1, 'resourceOrganisation');
    this.handleBitSets(0, 2, 'webpage');
    this.handleBitSets(1, 3, 'description');
    this.handleBitSets(1, 4, 'tagline');
    this.handleBitSets(1, 5, 'logo');
    this.handleBitSetsOfGroups(2, 7, 'scientificSubdomain', 'scientificDomains');
    this.handleBitSetsOfGroups(2, 9, 'subcategory', 'categories');
    this.handleBitSets(2, 10, 'targetUsers');
    this.handleBitSets(3, 11, 'geographicalAvailabilities');
    this.handleBitSets(3, 12, 'languageAvailabilities');
    this.handleBitSetsOfGroups(5, 13, 'firstName', 'mainContact');
    this.handleBitSetsOfGroups(5, 14, 'lastName', 'mainContact');
    this.handleBitSetsOfGroups(5, 15, 'email', 'mainContact');
    this.handleBitSetsOfPublicContact(5, 20, 'email', 'publicContacts');
    this.handleBitSets(5, 16, 'helpdeskEmail');
    this.handleBitSets(5, 17, 'securityContactEmail');
    this.handleBitSets(6, 18, 'trl');
    this.handleBitSets(9, 22, 'termsOfUse');
    this.handleBitSets(9, 23, 'privacyPolicy');
    this.handleBitSets(10, 19, 'orderType');
  }

}
