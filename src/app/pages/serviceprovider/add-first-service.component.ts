import {Component, Injector, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DatePipe} from '@angular/common';
import {ServiceFormComponent} from '../eInfraServices/service-form.component';
import {AuthenticationService} from '../../services/authentication.service';
import {ResourceService} from '../../services/resource.service';
import {MeasurementsPage} from '../../domain/indicators';
import {Service} from '../../domain/eic-model';

@Component({
  selector: 'app-add-first-service',
  templateUrl: '../eInfraServices/service-form.component.html'
})
export class AddFirstServiceComponent extends ServiceFormComponent implements OnInit {

  pendingServices: Service[] = [];
  serviceId: string;

  constructor(protected injector: Injector,
              protected authenticationService: AuthenticationService,
              private route: ActivatedRoute,
              private datePipe: DatePipe) {
    super(injector, authenticationService);
    this.editMode = false;
  }

  ngOnInit() {
    super.ngOnInit();
    this.firstServiceForm = true;
    this.providerId = this.route.snapshot.paramMap.get('id');
    this.serviceId = this.route.snapshot.paramMap.get('serviceId');
    console.log(this.serviceId);
    this.getFieldAsFormArray('providers').get([0]).setValue(this.providerId);
    if (this.serviceId) {
      this.editMode = true;
      this.resourceService.getService(this.serviceId).subscribe(service => {

        /*if (this.userService.canEditService(service)) {*/
        ResourceService.removeNulls(service);
        this.formPrepare(service);
        this.serviceForm.patchValue(service);
        const lastUpdate = new Date(this.serviceForm.get('lastUpdate').value);
        const date = this.datePipe.transform(lastUpdate, 'yyyy-MM-dd');
        this.serviceForm.get('lastUpdate').setValue(date);
        if (this.serviceForm.get('validFor').value) {
          const validFor = new Date(this.serviceForm.get('validFor').value);
          const validForDate = this.datePipe.transform(validFor, 'yyyy-MM-dd');
          this.serviceForm.get('validFor').setValue(validForDate);
        }
        /*} else {
            this.location.back();
        }*/
      },
      err => this.errorMessage = 'Something went bad, server responded: ' + err.error);
      this.resourceService.getServiceMeasurements(this.serviceId).subscribe(measurements => {
        this.measurementsFormPatch(measurements);
        if (this.measurements.length === 0) {
          this.pushToMeasurements();
        }
      },
        err => this.errorMessage = 'Could not get the measurements for this service. ' + err.error
      );
    }
  }

  onSuccess(service) {
    this.successMessage = 'Service uploaded successfully!';
  }

  formPrepare(service: Service) {
    for (let i = 0; i < service.providers.length - 1; i++) {
      this.push('providers', true);
    }
    for (let i = 0; i < service.places.length - 1; i++) {
      this.push('places', true);
    }
    for (let i = 0; i < service.languages.length - 1; i++) {
      this.push('languages', true);
    }
    if (service.tags) {
      for (let i = 0; i < service.tags.length - 1; i++) {
        this.push('tags', false);
      }
    }
    if (service.requiredServices) {
      for (let i = 0; i < service.requiredServices.length - 1; i++) {
        this.push('requiredServices', false);
      }
    }
    if (service.relatedServices) {
      for (let i = 0; i < service.relatedServices.length - 1; i++) {
        this.push('relatedServices', false);
      }
    }
    if (service.termsOfUse) {
      for (let i = 0; i < service.termsOfUse.length - 1; i++) {
        this.push('termsOfUse', false, true);
      }
    }
  }

  measurementsFormPatch(measurements: MeasurementsPage) {
    for (let i = 0; i < measurements.results.length; i++) {
      this.pushToMeasurements();
      for (const j in measurements.results[i]) {
        // console.log(j);
        // console.log(measurements.results[i][j]);
        if (measurements.results[i][j] !== null) {
          this.measurements.controls[i].get(j).enable();
          if (this.measurements.controls[i].get(j).value.constructor === Array) {
            // console.log(this.measurements.controls[i].get(j).value);
            for (let k = 0; k < measurements.results[i][j].length - 1; k++) {
              this.pushToLocations(i);
            }
          }
          if (j === 'valueIsRange') { // forms/html cooperate better with strings instead of boolean
            this.measurements.controls[i].get(j).setValue(measurements.results[i][j] + '');
          } else {
            this.measurements.controls[i].get(j).setValue(measurements.results[i][j]);
          }
        } else {
          this.measurements.controls[i].get(j).disable();
        }
      }
      const time = new Date(this.measurements.controls[i].get('time').value);
      const date = this.datePipe.transform(time, 'yyyy-MM-dd');
      this.measurements.controls[i].get('time').setValue(date);
    }
    // console.log(measurements.results);
  }

  onSubmit(service: Service, isValid: boolean) {
    if (this.serviceId) {
      service.id = this.serviceId;
    }
    super.onSubmit(service, isValid);
  }
}
