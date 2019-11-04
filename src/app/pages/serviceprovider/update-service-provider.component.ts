import {Component, OnInit} from '@angular/core';
import {Provider} from '../../domain/eic-model';
import {ServiceProviderFormComponent} from './service-provider-form.component';
import {ResourceService} from '../../services/resource.service';

declare var UIkit: any;

@Component({
  selector: 'app-update-service-provider',
  templateUrl: './service-provider-form.component.html'
})
export class UpdateServiceProviderComponent extends ServiceProviderFormComponent implements OnInit {
  errorMessage: string;
  provider: Provider;

  ngOnInit() {
    this.edit = true;
    super.ngOnInit();
    this.getProvider();
  }

  registerProvider() {
    super.registerProvider();
  }

  getProvider() {
    const id = this.route.snapshot.paramMap.get('id');
    this.errorMessage = '';
    this.serviceProviderService.getServiceProviderById(id).subscribe(
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
        for (let i = 0; i < this.provider.users.length - 1; i++) {
          this.addUser();
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
        if (this.provider.categories && this.provider.categories.length > 0) {
          this.removeDomain(0);
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
      }
    );
  }

}
