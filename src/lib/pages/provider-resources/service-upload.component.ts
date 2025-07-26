import {Component, Injector, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {Service} from '../../domain/eic-model';
import {ServiceFormComponent} from './service-form.component';
import {AuthenticationService} from '../../services/authentication.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ServiceProviderService} from '../../services/service-provider.service';
import {RecommendationsService} from "../../services/recommendations.service";
import {CatalogueService} from "../../services/catalogue.service";
import {pidHandler} from "../../shared/pid-handler/pid-handler.service";
import {FormControlService} from "../../../dynamic-catalogue/services/form-control.service";

@Component({
  selector: 'app-service-upload',
  templateUrl: './service-form.component.html'
})
export class ServiceUploadComponent extends ServiceFormComponent implements OnInit {
  private sub: Subscription;

  constructor(protected injector: Injector,
              protected authenticationService: AuthenticationService,
              protected serviceProviderService: ServiceProviderService,
              protected recommendationsService: RecommendationsService,
              protected catalogueService: CatalogueService,
              protected route: ActivatedRoute,
              public pidHandler: pidHandler,
              public dynamicFormService: FormControlService,
              public router: Router) {
    super(injector, authenticationService, serviceProviderService, recommendationsService, catalogueService, route, pidHandler, dynamicFormService, router);
    this.editMode = false;
  }

  ngOnInit() {
    super.ngOnInit();
  }

  onSuccess(service) {
    this.successMessage = 'Resource uploaded successfully!';
  }

}
