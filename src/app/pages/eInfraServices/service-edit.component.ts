import {Component, Injector, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DatePipe} from '@angular/common';
import {ServiceFormComponent} from './service-form.component';
import {AuthenticationService} from '../../services/authentication.service';
import {Subscription} from 'rxjs';
import {MeasurementsPage} from '../../domain/indicators';
import {Service} from '../../domain/eic-model';
import {ResourceService} from '../../services/resource.service';

@Component({
  selector: 'app-service-edit',
  templateUrl: './service-form.component.html'
})
export class ServiceEditComponent extends ServiceFormComponent implements OnInit {
  private sub: Subscription;
  // private serviceID: string;

  constructor(public route: ActivatedRoute, public authenticationService: AuthenticationService,
              protected injector: Injector, public datePipe: DatePipe) {
    super(injector, authenticationService);
    this.editMode = true;
  }

  ngOnInit() {
    super.ngOnInit();
    this.sub = this.route.params.subscribe(params => {
      this.serviceID = params['id'];
      this.resourceService.getService(this.serviceID).subscribe(service => {

        /*if (this.userService.canEditService(service)) {*/
        ResourceService.removeNulls(service);
        this.formPrepare(service);
        this.serviceForm.patchValue(service);
        for (const i in this.serviceForm.controls) {
          if (this.serviceForm.controls[i].value === null) {
            this.serviceForm.controls[i].setValue('');
          }
        }
        const lastUpdate = new Date(this.serviceForm.get('lastUpdate').value);
        const date = this.datePipe.transform(lastUpdate, 'yyyy-MM-dd');
        this.serviceForm.get('lastUpdate').setValue(date);
        if (this.serviceForm.get('validFor').value) {
          const validFor = new Date(this.serviceForm.get('validFor').value);
          const validForDate = this.datePipe.transform(validFor, 'yyyy-MM-dd');
          this.serviceForm.get('validFor').setValue(validForDate);
        }
        this.serviceForm.markAsPristine();
        /*} else {
            this.location.back();
        }*/
      },
        err => this.errorMessage = 'Could not get the data for the requested service. ' + err.error
      );
    });
    this.resourceService.getServiceMeasurements(this.serviceID).subscribe(measurements => {
      this.measurementsFormPatch(measurements);
      if (this.measurements.length === 0) {
        this.pushToMeasurements();
      }
    },
      err => this.errorMessage = 'Could not get the measurements for this service. ' + err.error
    );
    this.serviceForm.markAsPristine();
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

  onSuccess(service) {
    this.successMessage = 'Service edited successfully!';
    this.router.service(service.id);
  }

  onSubmit(service: Service, isValid: boolean) {
    // service.id = this.serviceID;

    /** For feature use if admin changes the values **/
    // for ( const i in this.serviceForm.controls) {
    //     if (this.serviceForm.controls[i].dirty) {
    //         console.log('There was a change in field ' + i);
    //         if (this.serviceForm.controls[i].value.constructor === Array) {
    //             for (let j = 0; j < this.serviceForm.controls[i].value.length; j++) {
    //                 let str = JSON.stringify(this.serviceForm.controls[i].value[j]).split(':', -1);
    //                 str = str[1].split('"', -1);
    //                 console.log(str[1]);
    //             }
    //         } else { console.log(this.serviceForm.controls[i].value); }
    //     }
    // }
    /** **/
    super.onSubmit(service, isValid);
  }
}
