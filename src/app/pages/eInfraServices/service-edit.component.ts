import {Component, Injector, OnInit} from '@angular/core';
import {DatePipe} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {AuthenticationService} from '../../services/authentication.service';
import {ServiceFormComponent} from './service-form.component';
import {Service} from '../../domain/eic-model';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-service-edit',
  templateUrl: './service-form.component.html'
})
export class ServiceEditComponent extends ServiceFormComponent implements OnInit {
  private sub: Subscription;
  private serviceID: string;

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
        // ResourceService.removeNulls(service);
        this.formPrepare(service);
        this.serviceForm.patchValue(service);
        for ( const i in this.serviceForm.controls) {
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

        /*} else {
            this.location.back();
        }*/
      });
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
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
    for (let i = 0; i < service.tags.length - 1; i++) {
      this.push('tags', false);
    }
    for (let i = 0; i < service.requiredServices.length - 1; i++) {
      this.push('requiredServices', false);
    }
    for (let i = 0; i < service.relatedServices.length - 1; i++) {
      this.push('relatedServices', false);
    }
    for (let i = 0; i < service.termsOfUse.length - 1; i++) {
      this.push('termsOfUse', false, true);
    }
  }

  onSuccess(service) {
    this.successMessage = 'Service edited successfully!';
    this.router.service(service.id);
  }

  onSubmit(service: Service, isValid: boolean) {
    service.id = this.serviceID;

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
