import {Component, OnInit} from '@angular/core';
import {Provider, VocabularyType} from '../../domain/eic-model';
import {ServiceProviderFormComponent} from './service-provider-form.component';
import {ResourceService} from '../../services/resource.service';
import {FormBuilder} from '@angular/forms';
import {AuthenticationService} from '../../services/authentication.service';
import {ServiceProviderService} from '../../services/service-provider.service';
import {ActivatedRoute, Router} from '@angular/router';

declare var UIkit: any;

@Component({
  selector: 'app-update-service-provider',
  templateUrl: './service-provider-form.component.html',
  styleUrls: ['./service-provider-form.component.css']
})
export class UpdateServiceProviderComponent extends ServiceProviderFormComponent implements OnInit {
  errorMessage: string;
  provider: Provider;

  constructor(public fb: FormBuilder,
              public authService: AuthenticationService,
              public serviceProviderService: ServiceProviderService,
              public resourceService: ResourceService,
              public router: Router,
              public route: ActivatedRoute) {
    super(fb, authService, serviceProviderService, resourceService, router, route);
  }

  ngOnInit() {
    this.edit = true;
    const path = this.route.snapshot.routeConfig.path;
    if (path === 'serviceProviderInfo/:id') {
      this.disable = true;
    }
    super.ngOnInit();
    if (sessionStorage.getItem('service')) {
      sessionStorage.removeItem('service');
    } else {
      if (this.vocabularies === null) {
        this.resourceService.getAllVocabulariesByType().subscribe(
          res => {
            this.vocabularies = res;
            this.placesVocabulary = this.vocabularies[VocabularyType.PLACE];
            this.providerTypeVocabulary = this.vocabularies[VocabularyType.PROVIDER_TYPE];
            this.providerTRLVocabulary = this.vocabularies[VocabularyType.PROVIDER_LIFE_CYCLE_STATUS];
            this.domainsVocabulary =  this.vocabularies[VocabularyType.PROVIDER_DOMAIN];
            this.categoriesVocabulary =  this.vocabularies[VocabularyType.PROVIDER_CATEGORY];
            this.esfriDomainVocabulary =  this.vocabularies[VocabularyType.PROVIDER_ESFRI_DOMAIN];
            this.legalStatusVocabulary =  this.vocabularies[VocabularyType.PROVIDER_LEGAL_STATUS];
            this.esfriVocabulary =  this.vocabularies[VocabularyType.PROVIDER_ESFRI];
            this.areasOfActivityVocabulary =  this.vocabularies[VocabularyType.PROVIDER_AREA_OF_ACTIVITY];
            this.networksVocabulary =  this.vocabularies[VocabularyType.PROVIDER_NETWORKS];
            this.societalGrandChallengesVocabulary =  this.vocabularies[VocabularyType.PROVIDER_SOCIETAL_GRAND_CHALLENGES];
          },
          error => console.log(error),
          () => {
            this.getProvider();
          }
        );
      } else {
        this.getProvider();
      }
    }
  }

  registerProvider() {
    super.registerProvider();
  }

  getProvider() {
    const id = this.route.snapshot.paramMap.get('id');
    this.errorMessage = '';
    const path = this.route.snapshot.routeConfig.path;
    this.serviceProviderService[(path === 'registerServiceProvider/:id' ? 'getPendingProviderById' : 'getServiceProviderById')](id)
      .subscribe(
      provider => this.provider = provider,
      err => {
        console.log(err);
        this.errorMessage = 'Something went wrong.';
      },
      () => {
        // console.log(Object.keys(this.provider));
        ResourceService.removeNulls(this.provider);
        // TODO: get it done this way
        // const keys = Object.keys(this.provider);
        // for (const key of keys) {
        //   if (key === 'id' || key === 'active' || key === 'status') { continue; }
        //   if (this.newProviderForm.controls[key].value.constructor === Array) {
        //     for (let i = 0; i < this.provider[key].length - 1; i++) {
        //       console.log(key);
        //       if (key === 'users') {
        //         this.addUser();
        //       } else {
        //         if (this.provider[key] && this.provider[key].length > 1) {
        //           for (let j = 0; j < this.provider[key].length - 1; j++) {
        //             this.push(key, false);
        //           }
        //         }
        //       }
        //     }
        //   }
        // }
        if (this.provider.users && this.provider.users.length > 1) {
          for (let i = 0; i < this.provider.users.length - 1; i++) {
            this.addUser();
          }
        } else if (path === 'registerServiceProvider/:id') {
          this.addDefaultUser();
        }
        if (this.provider.multimedia && this.provider.multimedia.length > 1) {
          for (let i = 0; i < this.provider.multimedia.length - 1; i++) {
            this.push('multimedia', this.providerMultimediaDesc.mandatory);
          }
        }
        if (this.provider.types && this.provider.types.length > 1) {
          for (let i = 0; i < this.provider.types.length - 1; i++) {
            this.push('types', this.typeDesc.mandatory);
          }
        }

        if (this.provider.categories) {
          // this.removeDomain(0);
          for (let i = 0; i < this.provider.categories.length; i++) {
            this.domainArray.push(this.newScientificDomain());

            for (let j = 0; j < this.categoriesVocabulary.length; j++) {
              if (this.categoriesVocabulary[j].id === this.provider.categories[i]) {
                this.domainArray.controls[this.domainArray.length - 1].get('domain').setValue(this.categoriesVocabulary[j].parentId);
                this.domainArray.controls[this.domainArray.length - 1].get('category').setValue(this.categoriesVocabulary[j].id);
              }
            }
          }
        }
        if (this.provider.esfriDomains && this.provider.esfriDomains.length > 1) {
          for (let i = 0; i < this.provider.esfriDomains.length - 1; i++) {
            this.push('esfriDomains', this.ESFRIDomainDesc.mandatory);
          }
        }
        if (this.provider.contacts && this.provider.contacts.length > 1) {
          for (let i = 0; i < this.provider.contacts.length - 1; i++) {
            this.pushContact();
          }
        }
        if (this.provider.tags && this.provider.tags.length > 1) {
          for (let i = 0; i < this.provider.tags.length - 1; i++) {
            this.push('tags', this.providerTagsDesc.mandatory);
          }
        }
        if (this.provider.networks && this.provider.networks.length > 1) {
          for (let i = 0; i < this.provider.networks.length - 1; i++) {
            this.push('networks', this.networksDesc.mandatory);
          }
        }
        if (this.provider.areasOfActivity && this.provider.areasOfActivity.length > 1) {
          for (let i = 0; i < this.provider.areasOfActivity.length - 1; i++) {
            this.push('areasOfActivity', this.areasOfActivityDesc.mandatory);
          }
        }
        if (this.provider.societalGrandChallenges && this.provider.societalGrandChallenges.length > 1) {
          for (let i = 0; i < this.provider.societalGrandChallenges.length - 1; i++) {
            this.push('societalGrandChallenges', this.societalGrandChallengesDesc.mandatory);
          }
        }
        this.newProviderForm.patchValue(this.provider);
        this.newProviderForm.updateValueAndValidity();
        if (this.disable) {
          this.newProviderForm.disable();
        }
      }
    );
  }

  toggleDisable() {
    this.disable = !this.disable;
    this.newProviderForm.enable();
  }

}
