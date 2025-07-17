import {Component, Injector, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DeployableServiceForm} from "./deployable-service-form";
import {AuthenticationService} from '../../services/authentication.service';
import {ResourceService} from '../../services/resource.service';
import {DeployableService, Service} from '../../domain/eic-model';
import {NavigationService} from "../../services/navigation.service";
import {FormControlService} from "../../../dynamic-catalogue/services/form-control.service";
import {DeployableServiceService} from "../../services/deployable-service.service";

@Component({
  selector: 'app-add-first-deployable-service',
  templateUrl: './deployable-service-form.html'
})
export class AddFirstDeployableServiceComponent extends DeployableServiceForm implements OnInit {

  pendingServices: DeployableService[] = [];
  deployableServiceId: string;

  constructor(protected injector: Injector,
              protected authenticationService: AuthenticationService,
              protected deployableServiceService: DeployableServiceService,
              protected route: ActivatedRoute,
              protected navigator: NavigationService,
              public dynamicFormService: FormControlService) {
    super(injector, authenticationService, deployableServiceService, route, dynamicFormService);
    this.editMode = false;
  }

  ngOnInit() {
    super.ngOnInit();
    this.firstServiceForm = true;
    // this.providerId = this.route.snapshot.paramMap.get('providerId');
    // this.serviceForm.get('resourceOrganisation').setValue(decodeURIComponent(this.providerId));
    this.deployableServiceId = this.route.snapshot.paramMap.get('deployableServiceId');
    if (this.deployableServiceId) {
      this.editMode = true;
      this.deployableServiceService.getDeployableServiceBundle(this.deployableServiceId).subscribe(
        dsBundle => {
          ResourceService.removeNulls(dsBundle.deployableService);
          // this.formPrepare(dsBundle.deployableService);
          this.serviceForm.patchValue(dsBundle.deployableService);
          for (const i in this.serviceForm.controls) {
            if (this.serviceForm.controls[i].value === null) {
              this.serviceForm.controls[i].setValue('');
            }
          }
        },
        err => this.errorMessage = 'Something went bad, server responded: ' + err.error);
    }
  }

  onSuccess(service) {
    this.successMessage = '' +
      ' Resource uploaded successfully!';
  }

  onSubmit(service: Service, tempSave: boolean) {
    if (this.deployableServiceId) {
      service.id = this.deployableServiceId;
    }
    super.onSubmit(service, tempSave);
  }
}
