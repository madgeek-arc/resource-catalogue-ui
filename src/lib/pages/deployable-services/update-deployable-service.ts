import {Component, Injector, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DatePipe} from '@angular/common';
import {AuthenticationService} from '../../services/authentication.service';
import {Subscription} from 'rxjs';
import {ResourceService} from '../../services/resource.service';
import {NavigationService} from "../../services/navigation.service";
import {DeployableServiceForm} from "./deployable-service-form";
import {FormControlService} from "../../../dynamic-catalogue/services/form-control.service";
import {DeployableServiceService} from "../../services/deployable-service.service";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-update-deployable-service',
  templateUrl: './deployable-service-form.html',
  styleUrls: ['../provider/service-provider-form.component.css']
})
export class UpdateDeployableService extends DeployableServiceForm implements OnInit {
  private sub: Subscription;

  constructor(public route: ActivatedRoute,
              public authenticationService: AuthenticationService,
              protected deployableServiceService: DeployableServiceService,
              protected injector: Injector,
              public datePipe: DatePipe,
              public navigator: NavigationService,
              public dynamicFormService: FormControlService) {
    super(injector, authenticationService, deployableServiceService, route, dynamicFormService);
    this.editMode = true;
  }

  ngOnInit() {
    const path = this.route.snapshot.routeConfig.path;
    if (path.includes(':catalogueId')) { this.catalogueId = this.route.snapshot.paramMap.get('catalogueId') }
    else { this.catalogueId = environment.CATALOGUE }
    if (path === ':catalogueId/:providerId/deployable-service/view/:resourceId') this.disable = true; // view-only mode
    super.ngOnInit();
    if (sessionStorage.getItem('service')) {
      sessionStorage.removeItem('service');
    } else {
      this.sub = this.route.params.subscribe(params => {
        // this.deployableServiceId = params['deployableServiceId'];
        this.deployableServiceId = this.route.snapshot.paramMap.get('deployableServiceId');
        const pathName = window.location.pathname;
        if (pathName.includes('draft-deployable-service/update')) {
          this.pendingResource = true;
        }
        // this.deployableServiceService.getService(this.resourceId).subscribe(service => {
        this.deployableServiceService[this.pendingResource ? 'getPendingService' : 'getDeployableServiceBundle'](this.deployableServiceId, this.catalogueId)
          .subscribe(dsBundle => {
              this.payloadAnswer = {'answer': {DeployableService: dsBundle.deployableService}};
              // if (dsBundle.deployableService.contact === null) //in case of unauthorized access backend will not show sensitive info
              //   this.navigator.go('/forbidden')
              ResourceService.removeNulls(dsBundle.deployableService);
              // this.formPrepare(dsBundle.deployableService);
              // this.serviceForm.patchValue(dsBundle.deployableService);

/*              for (const i in this.serviceForm.controls) {
                if (this.serviceForm.controls[i].value === null) {
                  this.serviceForm.controls[i].setValue('');
                }
              }
              if (this.serviceForm.get('versionDate').value) {
                const versionDate = new Date(this.serviceForm.get('versionDate').value);
                this.serviceForm.get('versionDate').setValue(this.datePipe.transform(versionDate, 'yyyy-MM-dd'));
              }*/
            },
            err => this.errorMessage = 'Could not get the data for the requested service. ' + err.error,
            () => {
              if (window.location.href.indexOf('/add/use-template') > -1) {
                this.editMode = false;
                // this.serviceForm.get('id').setValue('');
                // this.serviceForm.get('name').setValue('');
              }
              if (this.disable) {
                // this.serviceForm.disable();
                // this.serviceName = this.serviceForm.get('name').value;
              } else {
                // this.initResourceBitSets();
              }
            }
          );
      });
    }
  }

}
