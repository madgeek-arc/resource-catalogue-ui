import {Component, Injector, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DatePipe} from '@angular/common';
import {ServiceFormComponent} from '../provider-resources/service-form.component';
import {AuthenticationService} from '../../services/authentication.service';
import {ResourceService} from '../../services/resource.service';
import {Service} from '../../domain/eic-model';
import {ServiceProviderService} from '../../services/service-provider.service';

@Component({
  selector: 'app-add-first-service',
  templateUrl: '../provider-resources/service-form.component.html'
})
export class AddFirstServiceComponent extends ServiceFormComponent implements OnInit {

  pendingServices: Service[] = [];
  serviceId: string;

  constructor(protected injector: Injector,
              protected authenticationService: AuthenticationService,
              protected serviceProviderService: ServiceProviderService,
              protected route: ActivatedRoute,
              private datePipe: DatePipe) {
    super(injector, authenticationService, serviceProviderService, route);
    this.editMode = false;
  }

  ngOnInit() {
    super.ngOnInit();
    this.firstServiceForm = true;
    // this.providerId = this.route.snapshot.paramMap.get('providerId');
    // this.serviceForm.get('resourceOrganisation').setValue(this.providerId);
    this.serviceId = this.route.snapshot.paramMap.get('resourceId');
    if (this.serviceId) {
      this.editMode = true;
      this.resourceService.getRichService(this.serviceId).subscribe(
        richService => {
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
        err => this.errorMessage = 'Something went bad, server responded: ' + err.error);
    }
  }

  onSuccess(service) {
    this.successMessage = 'Resource uploaded successfully!';
  }

  onSubmit(service: Service, tempSave: boolean) {
    if (this.serviceId) {
      service.id = this.serviceId;
    }
    super.onSubmit(service, tempSave);
  }
}
