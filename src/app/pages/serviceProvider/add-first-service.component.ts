import {Component, Injector, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DatePipe} from '@angular/common';
import {ServiceFormComponent} from '../eInfraServices/service-form.component';
import {AuthenticationService} from '../../services/authentication.service';
import {ResourceService} from '../../services/resource.service';
import {RichService, Service} from '../../domain/eic-model';
import {Paging} from '../../domain/paging';

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
    // console.log(this.serviceId);
    this.getFieldAsFormArray('providers').get([0]).setValue(this.providerId);
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
    this.successMessage = 'Service uploaded successfully!';
  }

  formPrepare(richService: RichService) {

    this.removeCategory(0);
    for (let i = 0; i < richService.service.subcategories.length; i++) {
      this.categoryArray.push(this.newCategory());
      this.categoryArray.controls[this.categoryArray.length - 1].get('supercategory').setValue(richService.categories[i].superCategory.id);
      this.categoryArray.controls[this.categoryArray.length - 1].get('category').setValue(richService.categories[i].category.id);
      this.categoryArray.controls[this.categoryArray.length - 1].get('subcategory').setValue(richService.categories[i].subCategory.id);
    }
    this.removeScientificDomain(0);
    for (let i = 0; i < richService.service.scientificSubdomains.length; i++) {
      this.scientificDomainArray.push(this.newScientificDomain());
      this.scientificDomainArray.controls[this.scientificDomainArray.length - 1]
        .get('scientificDomain').setValue(richService.domains[i].domain.id);
      this.scientificDomainArray.controls[this.scientificDomainArray.length - 1]
        .get('scientificSubDomain').setValue(richService.domains[i].subdomain.id);
    }

    for (let i = 0; i < richService.service.resourceProviders.length - 1; i++) {
      this.push('providers', true);
    }
    for (let i = 0; i < richService.service.targetUsers.length - 1; i++) {
      this.push('targetUsers', true);
    }
    for (let i = 0; i < richService.service.geographicalAvailabilities.length - 1; i++) {
      this.push('places', true);
    }
    for (let i = 0; i < richService.service.languageAvailabilities.length - 1; i++) {
      this.push('languageAvailabilities', true);
    }
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
    if (richService.service.requiredResources) {
      for (let i = 0; i < richService.service.requiredResources.length - 1; i++) {
        this.push('requiredServices', false);
      }
    }
    if (richService.service.relatedResources) {
      for (let i = 0; i < richService.service.relatedResources.length - 1; i++) {
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

  onSubmit(service: Service, tempSave: boolean) {
    if (this.serviceId) {
      service.id = this.serviceId;
    }
    super.onSubmit(service, tempSave);
  }
}
