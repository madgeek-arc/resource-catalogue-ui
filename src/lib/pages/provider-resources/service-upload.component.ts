import {Component, Injector, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {ServiceFormComponent} from './service-form.component';
import {AuthenticationService} from '../../services/authentication.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ServiceProviderService} from '../../services/service-provider.service';
import {CatalogueService} from "../../services/catalogue.service";
import {pidHandler} from "../../shared/pid-handler/pid-handler.service";
import {FormControlService} from "../../../dynamic-catalogue/services/form-control.service";
import {ConfigService} from "../../services/config.service";
import {DeduplicationService} from "../../services/deduplication.service";

@Component({
    selector: 'app-service-upload',
    templateUrl: './service-form.component.html',
    standalone: false
})
export class ServiceUploadComponent extends ServiceFormComponent implements OnInit {
  private sub: Subscription;

  constructor(protected injector: Injector,
              protected authenticationService: AuthenticationService,
              protected serviceProviderService: ServiceProviderService,
              protected catalogueService: CatalogueService,
              protected route: ActivatedRoute,
              public pidHandler: pidHandler,
              public dynamicFormService: FormControlService,
              public router: Router,
              public config: ConfigService,
              public deduplicationService: DeduplicationService) {
    super(injector, authenticationService, serviceProviderService, catalogueService, route, pidHandler, dynamicFormService, router, config, deduplicationService);
    this.editMode = false;
  }

  ngOnInit() {
    super.ngOnInit();
  }

  onSuccess(service) {
    this.successMessage = 'Resource uploaded successfully!';
  }

}
