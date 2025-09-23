import {Component, Injector, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {TrainingResourceForm} from "./training-resource-form";
import {AuthenticationService} from '../../services/authentication.service';
import {ResourceService} from '../../services/resource.service';
import {Service, TrainingResource} from '../../domain/eic-model';
import {ServiceProviderService} from '../../services/service-provider.service';
import {NavigationService} from "../../services/navigation.service";
import {FormControlService} from "../../../dynamic-catalogue/services/form-control.service";
import {config} from "rxjs";
import {ConfigService} from "../../services/config.service";

@Component({
  selector: 'app-add-first-training-resource',
  templateUrl: './training-resource-form.html'
})
export class AddFirstTrainingResourceComponent extends TrainingResourceForm implements OnInit {

  pendingServices: TrainingResource[] = [];
  trainingResourceId: string;

  constructor(protected injector: Injector,
              protected authenticationService: AuthenticationService,
              protected serviceProviderService: ServiceProviderService,
              protected route: ActivatedRoute,
              protected navigator: NavigationService,
              public dynamicFormService: FormControlService,
              public config: ConfigService) {
    super(injector, authenticationService, serviceProviderService, route, dynamicFormService, config);
    this.editMode = false;
  }

  ngOnInit() {
    super.ngOnInit();
    this.firstServiceForm = true;
    // this.providerId = this.route.snapshot.paramMap.get('providerId');
    // this.serviceForm.get('resourceOrganisation').setValue(decodeURIComponent(this.providerId));
    this.trainingResourceId = this.route.snapshot.paramMap.get('trainingResourceId');
    if (this.trainingResourceId) {
      this.editMode = true;
      this.trainingResourceService.getTrainingResourceBundle(this.trainingResourceId).subscribe(
        trBundle => {
          ResourceService.removeNulls(trBundle.trainingResource);
          this.formPrepare(trBundle.trainingResource);
          this.serviceForm.patchValue(trBundle.trainingResource);
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
    this.successMessage = 'Training Resource uploaded successfully!';
  }

}
