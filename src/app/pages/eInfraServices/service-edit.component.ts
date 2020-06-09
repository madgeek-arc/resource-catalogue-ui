import {Component, Injector, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DatePipe} from '@angular/common';
import {ServiceFormComponent} from './service-form.component';
import {AuthenticationService} from '../../services/authentication.service';
import {Subscription} from 'rxjs';
import {MeasurementsPage} from '../../domain/indicators';
import {RichService, Service} from '../../domain/eic-model';
import {ResourceService} from '../../services/resource.service';

@Component({
  selector: 'app-service-edit',
  templateUrl: './service-form.component.html',
  styleUrls: ['../serviceprovider/service-provider-form.component.css']
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
    this.resourceService.getServiceMeasurements(this.serviceID).subscribe(measurements => {
        this.measurementsFormPatch(measurements);
        if (this.measurements.length === 0) {
          this.pushToMeasurements();
        }
      },
      err => this.errorMessage = 'Could not get the measurements for this service. ' + err.error
    );
  }

  formPrepare(richService: RichService) {

    this.removeCategory(0);
    if (richService.service.subcategories) {
      for (let i = 0; i < richService.service.subcategories.length; i++) {
        this.categoryArray.push(this.newCategory());
        // this.categoryArray.controls[this.categoryArray.length - 1].get('supercategory').setValue(richService.categories[i].superCategory.id);
        this.categoryArray.controls[this.categoryArray.length - 1].get('category').setValue(richService.categories[i].category.id);
        this.categoryArray.controls[this.categoryArray.length - 1].get('subcategory').setValue(richService.categories[i].subCategory.id);
      }
    }
    this.removeScientificDomain(0);
    if (richService.service.scientificSubdomains) {
      for (let i = 0; i < richService.service.scientificSubdomains.length; i++) {
        this.scientificDomainArray.push(this.newScientificDomain());
        this.scientificDomainArray.controls[this.scientificDomainArray.length - 1]
          .get('scientificDomain').setValue(richService.domains[i].domain.id);
        this.scientificDomainArray.controls[this.scientificDomainArray.length - 1]
          .get('scientificSubDomain').setValue(richService.domains[i].subdomain.id);
      }
    }

    if (richService.service.resourceProviders) {
      for (let i = 0; i < richService.service.resourceProviders.length - 1; i++) {
        this.push('providers', true);
      }
    }
    if (richService.service.targetUsers) {
      for (let i = 0; i < richService.service.targetUsers.length - 1; i++) {
        this.push('targetUsers', true);
      }
    }
    if (richService.service.geographicalAvailabilities) {
      for (let i = 0; i < richService.service.geographicalAvailabilities.length - 1; i++) {
        this.push('places', true);
        // TODO: 211 replace places with geographicalAvailabilities (same for all similar cases)
        // this.push('geographicalAvailabilities', true);
      }
    }
    if (richService.service.geographicalAvailabilities) {
      for (let i = 0; i < richService.service.languageAvailabilities.length - 1; i++) {
        this.push('languages', true);
      }
    }
    // if (richService.service.userBaseList) {
    //   for (let i = 0; i < richService.service.userBaseList.length - 1; i++) {
    //     this.push('userBaseList', false);
    //   }
    // }
    if (richService.service.useCases) {
      for (let i = 0; i < richService.service.useCases.length - 1; i++) {
        this.push('useCases', false);
      }
    }
    if (richService.service.multimedia) {
      for (let i = 0; i < richService.service.multimedia.length - 1; i++) {
        this.push('multimediaUrls', false);
      }
    }
    // if (richService.service.options) {
    //   for (let i = 0; i < richService.service.options.length - 1; i++) {
    //     this.pushOption();
    //   }
    // }
    if (richService.service.requiredServices) {
      for (let i = 0; i < richService.service.requiredServices.length - 1; i++) {
        this.push('requiredServices', false);
      }
    }
    if (richService.service.relatedServices) {
      for (let i = 0; i < richService.service.relatedServices.length - 1; i++) {
        this.push('relatedServices', false);
      }
    }
    if (richService.service.accessTypes) {
      for (let i = 0; i < richService.service.accessTypes.length - 1; i++) {
        this.push('accessTypes', false);
      }
    }
    if (richService.service.accessModes) {
      for (let i = 0; i < richService.service.accessModes.length - 1; i++) {
        this.push('accessModes', false);
      }
    }
    if (richService.service.fundingBody) {
      for (let i = 0; i < richService.service.fundingBody.length - 1; i++) {
        this.push('funders', false);
      }
    }
    if (richService.service.tags) {
      for (let i = 0; i < richService.service.tags.length - 1; i++) {
        this.push('tags', false);
      }
    }
    if (richService.service.certifications) {
      for (let i = 0; i < richService.service.certifications.length - 1; i++) {
        this.push('certifications', false);
      }
    }
    if (richService.service.standards) {
      for (let i = 0; i < richService.service.standards.length - 1; i++) {
        this.push('standards', false);
      }
    }
  }

  measurementsFormPatch(measurements: MeasurementsPage) {
    this.removeFroMeasurements(0);
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
          if (j === 'valueIsRange') { // forms/html cooperates better with strings instead of boolean
            this.measurements.controls[i].get(j).setValue(measurements.results[i][j] + '');
          } else {
            this.measurements.controls[i].get(j).setValue(measurements.results[i][j]);
          }
        } else {
          this.measurements.controls[i].get(j).disable();
        }
      }
      if (this.measurements.controls[i].get('time').value) {
        const time = new Date(this.measurements.controls[i].get('time').value);
        const date = this.datePipe.transform(time, 'yyyy-MM-dd');
        this.measurements.controls[i].get('time').setValue(date);
      }
    }
    // console.log(measurements.results);
  }

  onSubmit(service: Service, tempSave: boolean) {
    super.onSubmit(service, tempSave, this.pendingService);
  }

}
