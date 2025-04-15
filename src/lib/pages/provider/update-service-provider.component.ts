import {Component, OnInit} from '@angular/core';
import {Provider, Type} from '../../domain/eic-model';
import {ServiceProviderFormComponent} from './service-provider-form.component';
import {ResourceService} from '../../services/resource.service';
import {UntypedFormBuilder} from '@angular/forms';
import {AuthenticationService} from '../../services/authentication.service';
import {ServiceProviderService} from '../../services/service-provider.service';
import {ActivatedRoute, Router} from '@angular/router';
import {CatalogueService} from "../../services/catalogue.service";
import {NavigationService} from "../../services/navigation.service";
import {pidHandler} from "../../shared/pid-handler/pid-handler.service";

declare var UIkit: any;

@Component({
  selector: 'app-update-service-provider',
  templateUrl: './service-provider-form.component.html',
  styleUrls: ['./service-provider-form.component.css']
})
export class UpdateServiceProviderComponent extends ServiceProviderFormComponent implements OnInit {
  errorMessage: string;
  provider: Provider;

  constructor(public fb: UntypedFormBuilder,
              public authService: AuthenticationService,
              public serviceProviderService: ServiceProviderService,
              public resourceService: ResourceService,
              public catalogueService: CatalogueService,
              public router: Router,
              public route: ActivatedRoute,
              public navigator: NavigationService,
              public pidHandler: pidHandler) {
    super(fb, authService, serviceProviderService, resourceService, catalogueService, router, route, navigator, pidHandler);
  }

  ngOnInit() {
    this.edit = true;
    const path = this.route.snapshot.routeConfig.path;
    this.providerId = this.route.snapshot.paramMap.get('providerId');
    if (path.includes(':catalogueId')) {
      this.catalogueId = this.route.snapshot.paramMap.get('catalogueId');
    }
    if (path === 'view/:catalogueId/:providerId') {
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
            this.placesVocabulary = this.vocabularies[Type.COUNTRY];
            this.providerTypeVocabulary = this.vocabularies[Type.PROVIDER_STRUCTURE_TYPE];
            this.providerLCSVocabulary = this.vocabularies[Type.PROVIDER_LIFE_CYCLE_STATUS];
            this.domainsVocabulary = this.vocabularies[Type.SCIENTIFIC_DOMAIN];
            this.categoriesVocabulary = this.vocabularies[Type.SCIENTIFIC_SUBDOMAIN];
            this.esfriDomainVocabulary = this.vocabularies[Type.PROVIDER_ESFRI_DOMAIN];
            this.legalStatusVocabulary = this.vocabularies[Type.PROVIDER_LEGAL_STATUS];
            this.esfriVocabulary = this.vocabularies[Type.PROVIDER_ESFRI_TYPE];
            this.areasOfActivityVocabulary = this.vocabularies[Type.PROVIDER_AREA_OF_ACTIVITY];
            this.networksVocabulary = this.vocabularies[Type.PROVIDER_NETWORK];
            this.societalGrandChallengesVocabulary = this.vocabularies[Type.PROVIDER_SOCIETAL_GRAND_CHALLENGE];
            this.hostingLegalEntityVocabulary = this.vocabularies[Type.PROVIDER_HOSTING_LEGAL_ENTITY];
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

  registerProvider(tempSave: boolean) {
    super.registerProvider(tempSave);
  }

  getProvider() {
    this.errorMessage = '';
    const path = this.route.snapshot.routeConfig.path;
    this.serviceProviderService[(path === 'add/:providerId' ? 'getPendingProviderById' : 'getServiceProviderById')](this.providerId, this.catalogueId)
      .subscribe(
        provider => this.provider = provider,
        err => {
          console.log(err);
          this.errorMessage = 'Something went wrong.';
        },
        () => {
          if(this.provider.users===null && this.provider.mainContact===null && path!=='add/:providerId') //in case of unauthorized access backend will not show sensitive info (drafts excluded)
            this.router.navigateByUrl('/forbidden')
          // console.log(Object.keys(this.provider));
          ResourceService.removeNulls(this.provider);
          // TODO: get it done this way
          // const keys = Object.keys(this.provider);
          // for (const key of keys) {
          //   if (key === 'id' || key === 'active' || key === 'status') { continue; }
          //   if (this.providerForm.controls[key].value.constructor === Array) {
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
          } else if (path === 'add/:providerId') {
            this.addDefaultUser();
          }
          // if (this.provider.multimedia && this.provider.multimedia.length > 1) {
          //   for (let i = 0; i < this.provider.multimedia.length - 1; i++) {
          //     this.push('multimedia', this.multimediaURLDesc.mandatory, true);
          //   }
          // }
          if (this.provider.alternativeIdentifiers) {
            for (let i = 0; i < this.provider.alternativeIdentifiers.length - 1; i++) {
              this.pushAlternativeIdentifier();
            }
          }

          if (this.provider.multimedia && this.provider.multimedia.length > 1) {
            for (let i = 0; i < this.provider.multimedia.length - 1; i++) {
              this.multimediaArray.push(this.newMultimedia());
            }
          }

          if (this.provider.structureTypes && this.provider.structureTypes.length > 1) {
            for (let i = 0; i < this.provider.structureTypes.length - 1; i++) {
              this.push('structureTypes', this.structureTypesDesc.mandatory);
            }
          }

          if (this.provider.scientificDomains) {
            // this.removeDomain(0);
            for (let i = 0; i < this.provider.scientificDomains.length; i++) {
              this.domainArray.push(this.newScientificDomain());

              // for (let j = 0; j < this.categoriesVocabulary.length; j++) {
              //   if (this.categoriesVocabulary[j].id === this.provider.scientificDomains[i]) {
              //     this.domainArray.controls[this.domainArray.length - 1].get('domain').setValue(this.categoriesVocabulary[j].parentId);
              //     this.domainArray.controls[this.domainArray.length - 1].get('scientificSubdomain').setValue(this.categoriesVocabulary[j].id);
              //   }
              // }
            }
          } else this.domainArray.push(this.newScientificDomain());

          if (this.provider.merilScientificDomains) {
            // this.removeDomain(0);
            for (let i = 0; i < this.provider.merilScientificDomains.length; i++) {
              this.merilDomainArray.push(this.newMerilScientificDomain());

              // for (let j = 0; j < this.merilCategoriesVocabulary.length; j++) {
              //   if (this.merilCategoriesVocabulary[j].id === this.provider.merilScientificDomains[i]) {
              //     this.merilDomainArray.controls[this.merilDomainArray.length - 1].get('merilDomain').setValue(this.merilCategoriesVocabulary[j].parentId);
              //     this.merilDomainArray.controls[this.merilDomainArray.length - 1].get('merilScientificSubdomain').setValue(this.merilCategoriesVocabulary[j].id);
              //   }
              // }
            }
          } else this.merilDomainArray.push(this.newMerilScientificDomain());

          if (this.provider.esfriDomains && this.provider.esfriDomains.length > 1) {
            for (let i = 0; i < this.provider.esfriDomains.length - 1; i++) {
              this.push('esfriDomains', this.ESFRIDomainDesc.mandatory);
            }
          }
          if (this.provider.publicContacts && this.provider.publicContacts.length > 1) {
            for (let i = 0; i < this.provider.publicContacts.length - 1; i++) {
              this.pushPublicContact();
            }
          }
          if (this.provider.tags && this.provider.tags.length > 1) {
            for (let i = 0; i < this.provider.tags.length - 1; i++) {
              this.push('tags', this.tagsDesc.mandatory);
            }
          }
          if (this.provider.certifications && this.provider.certifications.length > 1) {
            for (let i = 0; i < this.provider.certifications.length - 1; i++) {
              this.push('certifications', this.certificationsDesc.mandatory);
            }
          }
          if (this.provider.participatingCountries && this.provider.participatingCountries.length > 1) {
            for (let i = 0; i < this.provider.participatingCountries.length - 1; i++) {
              this.push('participatingCountries', this.participatingCountriesDesc.mandatory);
            }
          }
          if (this.provider.affiliations && this.provider.affiliations.length > 1) {
            for (let i = 0; i < this.provider.affiliations.length - 1; i++) {
              this.push('affiliations', this.affiliationDesc.mandatory);
            }
          }
          if (this.provider.networks && this.provider.networks.length > 1) {
            for (let i = 0; i < this.provider.networks.length - 1; i++) {
              this.push('networks', this.networksDesc.mandatory);
            }
          }
          if (this.provider.nationalRoadmaps && this.provider.nationalRoadmaps.length > 1) {
            for (let i = 0; i < this.provider.nationalRoadmaps.length - 1; i++) {
              this.push('nationalRoadmaps', this.nationalRoadmapsDesc.mandatory);
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
          this.providerForm.patchValue(this.provider);
          this.providerForm.updateValueAndValidity();
          if (this.disable) {
            this.providerForm.disable();
          }
          this.initProviderBitSets();
        }
      );
  }

  toggleDisable() { // is used to toggle form from view to edit mode
    this.disable = !this.disable;
    this.providerForm.enable();
  }

  initProviderBitSets() {
    this.handleBitSets(0, 0, 'name');
    this.handleBitSets(0, 1, 'abbreviation');
    this.handleBitSets(0, 17, 'node');
    this.handleBitSets(0, 2, 'website');
    this.handleBitSets(0, 16, 'legalEntity');
    this.handleBitSets(1, 3, 'description');
    this.handleBitSets(1, 4, 'logo');
    this.handleBitSetsOfGroups(3, 5, 'streetNameAndNumber', 'location');
    this.handleBitSetsOfGroups(3, 6, 'postalCode', 'location');
    this.handleBitSetsOfGroups(3, 7, 'city', 'location');
    this.handleBitSetsOfGroups(3, 8, 'country', 'location');
    this.handleBitSetsOfGroups(4, 9, 'firstName', 'mainContact');
    this.handleBitSetsOfGroups(4, 10, 'lastName', 'mainContact');
    this.handleBitSetsOfGroups(4, 11, 'email', 'mainContact');
    this.handleBitSetsOfPublicContact(4, 15, 'email', 'publicContacts');
    this.initUserBitSets();
  }

}
