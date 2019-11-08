import {Component, Injector, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {Service} from '../../domain/eic-model';
import {ServiceFormComponent} from './service-form.component';
import {AuthenticationService} from '../../services/authentication.service';
import {FunderService} from '../../services/funder.service';

@Component({
  selector: 'app-service-upload',
  templateUrl: './service-form.component.html'
})
export class ServiceUploadComponent extends ServiceFormComponent implements OnInit {
  private sub: Subscription;

  constructor(protected injector: Injector,
              protected authenticationService: AuthenticationService,
              protected funderService: FunderService) {
    super(injector, authenticationService, funderService);
    this.editMode = false;
  }

  ngOnInit() {
    super.ngOnInit();
    if (this.measurements.length === 0) {
      this.pushToMeasurements();
    }
  }

  onSuccess(service) {
    this.successMessage = 'Service uploaded successfully!';
  }

  onSubmit(service: Service, isValid: boolean) {
    super.onSubmit(service, isValid);
  }

}
