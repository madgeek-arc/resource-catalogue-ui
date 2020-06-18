import {Component, Injector, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DatePipe} from '@angular/common';
import {ServiceFormComponent} from './service-form.component';
import {AuthenticationService} from '../../services/authentication.service';
import {Subscription} from 'rxjs';
import {Service} from '../../domain/eic-model';
import {ResourceService} from '../../services/resource.service';

@Component({
  selector: 'app-service-edit',
  templateUrl: './service-form.component.html',
  styleUrls: ['../serviceProvider/service-provider-form.component.css']
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
    if (sessionStorage.getItem('service')) {
      sessionStorage.removeItem('service');
    } else {
      this.sub = this.route.params.subscribe(params => {
        this.serviceID = params['id'];
        const pathName = window.location.pathname;
        if (pathName.includes('editPendingService')) {
          this.pendingService = true;
        }
        // this.resourceService.getService(this.serviceID).subscribe(service => {
        this.resourceService[this.pendingService ? 'getPendingService' : 'getRichService'](this.serviceID).subscribe(richService => {
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
          err => this.errorMessage = 'Could not get the data for the requested service. ' + err.error
        );
      });
    }
  }

  onSubmit(service: Service, tempSave: boolean) {
    super.onSubmit(service, tempSave, this.pendingService);
  }

}
