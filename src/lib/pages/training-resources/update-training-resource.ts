import {Component, Injector, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DatePipe} from '@angular/common';
import {ServiceFormComponent} from '../provider-resources/service-form.component';
import {AuthenticationService} from '../../services/authentication.service';
import {Subscription} from 'rxjs';
import {Service} from '../../domain/eic-model';
import {ResourceService} from '../../services/resource.service';
import {ServiceProviderService} from '../../services/service-provider.service';
import {NavigationService} from "../../services/navigation.service";
import {TrainingResourceForm} from "./training-resource-form";

@Component({
  selector: 'app-update-training-resource',
  templateUrl: './training-resource-form.html',
  styleUrls: ['../provider/service-provider-form.component.css']
})
export class UpdateTrainingResource extends TrainingResourceForm implements OnInit {
  private sub: Subscription;

  // private serviceID: string;

  constructor(public route: ActivatedRoute,
              public authenticationService: AuthenticationService,
              protected serviceProviderService: ServiceProviderService,
              protected injector: Injector,
              public datePipe: DatePipe,
              public navigator: NavigationService) {
    super(injector, authenticationService, serviceProviderService, route);
    this.editMode = true;
  }

  ngOnInit() {
    const path = this.route.snapshot.routeConfig.path;
    if (path.includes(':catalogueId')) { this.catalogueId = this.route.snapshot.paramMap.get('catalogueId') }
    else { this.catalogueId = 'eosc' }
    if (path === ':catalogueId/:providerId/training-resource/view/:trainingResourceId') this.disable = true; // view-only mode
    super.ngOnInit();
    if (sessionStorage.getItem('service')) {
      sessionStorage.removeItem('service');
    } else {
      this.sub = this.route.params.subscribe(params => {
        this.trainingResourceId = params['trainingResourceId'];
        const pathName = window.location.pathname;
        if (pathName.includes('draft-training-resource/update')) {
          this.pendingResource = true;
        }
        // this.trainingResourceService.getService(this.resourceId).subscribe(service => {
        this.trainingResourceService[this.pendingResource ? 'getPendingService' : 'getTrainingResourceBundle'](this.trainingResourceId, this.catalogueId)
          .subscribe(trBundle => {
              if (trBundle.trainingResource.contact === null) //in case of unauthorized access backend will not show sensitive info
                this.navigator.go('/forbidden')
              ResourceService.removeNulls(trBundle.trainingResource);
              this.formPrepare(trBundle.trainingResource);
              this.serviceForm.patchValue(trBundle.trainingResource);
              for (const i in this.serviceForm.controls) {
                if (this.serviceForm.controls[i].value === null) {
                  this.serviceForm.controls[i].setValue('');
                }
              }
              if (this.serviceForm.get('versionDate').value) {
                const versionDate = new Date(this.serviceForm.get('versionDate').value);
                this.serviceForm.get('versionDate').setValue(this.datePipe.transform(versionDate, 'yyyy-MM-dd'));
              }
            },
            err => this.errorMessage = 'Could not get the data for the requested service. ' + err.error,
            () => {
              if (window.location.href.indexOf('/add/use-template') > -1) {
                this.editMode = false;
                this.serviceForm.get('id').setValue('');
                this.serviceForm.get('title').setValue('');
              }
              if (this.disable) {
                this.serviceForm.disable();
                this.serviceName = this.serviceForm.get('title').value;
              } else {
                this.initResourceBitSets();
              }
            }
          );
      });
    }
  }

  onSubmit(service: Service, tempSave: boolean) {
    super.onSubmit(service, tempSave, this.pendingResource);
  }

  initResourceBitSets() {
    this.handleBitSets(0, 0, 'title');
    this.handleBitSets(0, 1, 'resourceOrganisation');
    this.handleBitSets(0, 2, 'authors');
    this.handleBitSets(0, 3, 'url');
    this.handleBitSets(1, 4, 'license');
    this.handleBitSets(1, 5, 'accessRights');
    this.handleBitSets(1, 6, 'versionDate');
    this.handleBitSets(2, 7, 'targetGroups');
    this.handleBitSets(2, 8, 'learningOutcomes');
    this.handleBitSets(2, 9, 'expertiseLevel');
    this.handleBitSets(3, 10, 'languages');
    this.handleBitSets(3, 11, 'geographicalAvailabilities');
    this.handleBitSetsOfGroups(4, 13, 'scientificSubdomain', 'scientificDomains');
    this.handleBitSetsOfGroups(5, 14, 'firstName', 'contact');
    this.handleBitSetsOfGroups(5, 15, 'lastName', 'contact');
    this.handleBitSetsOfGroups(5, 16, 'email', 'contact');
  }

}
