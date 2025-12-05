import {Component, Injector, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DatePipe} from '@angular/common';
import {AuthenticationService} from '../../services/authentication.service';
import {Subscription} from 'rxjs';
import {ResourceService} from '../../services/resource.service';
import {ServiceProviderService} from '../../services/service-provider.service';
import {NavigationService} from "../../services/navigation.service";
import {TrainingResourceForm} from "./training-resource-form";
import {FormControlService} from "../../../dynamic-catalogue/services/form-control.service";
import {environment} from '../../../environments/environment';
import {ConfigService} from "../../services/config.service";

@Component({
    selector: 'app-update-training-resource',
    templateUrl: './training-resource-form.html',
    styleUrls: ['../provider/service-provider-form.component.css'],
    standalone: false
})
export class UpdateTrainingResource extends TrainingResourceForm implements OnInit {
  private sub: Subscription;

  // private serviceID: string;

  constructor(public route: ActivatedRoute,
              public authenticationService: AuthenticationService,
              protected serviceProviderService: ServiceProviderService,
              protected injector: Injector,
              public datePipe: DatePipe,
              public navigator: NavigationService,
              public dynamicFormService: FormControlService,
              public config: ConfigService) {
    super(injector, authenticationService, serviceProviderService, route, dynamicFormService, config);
    this.editMode = true;
  }

  ngOnInit() {
    const path = this.route.snapshot.routeConfig.path;
    if (path.includes(':catalogueId')) { this.catalogueId = this.route.snapshot.paramMap.get('catalogueId') }
    else { this.catalogueId = this.catalogueConfigId }
    if (path === ':catalogueId/:providerId/training-resource/view/:resourceId') this.disable = true; // view-only mode
    super.ngOnInit();
    if (sessionStorage.getItem('service')) {
      sessionStorage.removeItem('service');
    } else {
      this.sub = this.route.params.subscribe(params => {
        // this.trainingResourceId = params['trainingResourceId'];
        this.trainingResourceId = this.route.snapshot.paramMap.get('trainingResourceId');
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

              this.payloadAnswer = {'answer': {TrainingResource: trBundle.trainingResource}};

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
                // this.initResourceBitSets();
              }
            }
          );
      });
    }
  }

}
