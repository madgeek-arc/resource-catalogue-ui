import {Component, Injector, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DatePipe} from '@angular/common';
import {ServiceFormComponent} from './service-form.component';
import {AuthenticationService} from '../../services/authentication.service';
import {ResourceService} from '../../services/resource.service';
import {Service} from '../../domain/eic-model';
import {ServiceProviderService} from '../../services/service-provider.service';
import {RecommendationsService} from "../../services/recommendations.service";
import {CatalogueService} from "../../services/catalogue.service";
import {pidHandler} from "../../shared/pid-handler/pid-handler.service";
import {FormControlService} from "../../../dynamic-catalogue/services/form-control.service";
import {ConfigService} from "../../services/config.service";

@Component({
    selector: 'app-add-first-service',
    templateUrl: './service-form.component.html',
    providers: [FormControlService],
    standalone: false
})
export class AddFirstServiceComponent extends ServiceFormComponent implements OnInit {

  pendingServices: Service[] = [];
  serviceId: string;

  constructor(protected injector: Injector,
              protected authenticationService: AuthenticationService,
              protected serviceProviderService: ServiceProviderService,
              protected recommendationsService: RecommendationsService,
              protected catalogueService: CatalogueService,
              protected route: ActivatedRoute,
              private datePipe: DatePipe,
              public pidHandler: pidHandler,
              public dynamicFormService: FormControlService,
              public router: Router,
              public config: ConfigService) {
    super(injector, authenticationService, serviceProviderService, recommendationsService, catalogueService, route, pidHandler, dynamicFormService, router, config);
    this.editMode = false;
  }

  ngOnInit() {
    super.ngOnInit();
    this.firstServiceForm = true;
    // this.providerId = this.route.snapshot.paramMap.get('providerId');
    // this.serviceForm.get('resourceOrganisation').setValue(decodeURIComponent(this.providerId));
    this.serviceId = this.route.snapshot.paramMap.get('resourceId');
    if (this.serviceId) {
      this.editMode = true;
      this.resourceService.getService(this.serviceId).subscribe(
        service => {
          ResourceService.removeNulls(service);
          this.serviceForm.patchValue(service);
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
        err => this.errorMessage = 'Something went bad, server responded: ' + err.error);
    }
  }

  onSuccess(service) {
    this.successMessage = 'Resource uploaded successfully!';
  }

}
