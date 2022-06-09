import {Component, OnInit} from '@angular/core';
import {Catalogue, Provider, Type} from '../../domain/eic-model';
import {ServiceProviderFormComponent} from '../provider/service-provider-form.component';
import {ResourceService} from '../../services/resource.service';
import {FormBuilder} from '@angular/forms';
import {AuthenticationService} from '../../services/authentication.service';
import {ServiceProviderService} from '../../services/service-provider.service';
import {ActivatedRoute, Router} from '@angular/router';
import {CatalogueFormComponent} from "./catalogue-form.component";
import {CatalogueService} from "../../services/catalogue.service";

declare var UIkit: any;

@Component({
  selector: 'app-update-catalogue',
  templateUrl: './catalogue-form.component.html',
  // styleUrls: ['./service-provider-form.component.css']
})
export class UpdateCatalogueComponent extends CatalogueFormComponent implements OnInit {
  errorMessage: string;
  catalogue: Catalogue;

  constructor(public fb: FormBuilder,
              public authService: AuthenticationService,
              public serviceProviderService: ServiceProviderService,
              public catalogueService: CatalogueService,
              public resourceService: ResourceService,
              public router: Router,
              public route: ActivatedRoute) {
    super(fb, authService, serviceProviderService, catalogueService, resourceService, router, route);
  }

  ngOnInit() {
    this.edit = true;
    this.catalogueId = this.route.snapshot.paramMap.get('catalogueId');
    const path = this.route.snapshot.routeConfig.path;
    if (path === 'info/:catalogueId') {
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
            this.domainsVocabulary = this.vocabularies[Type.SCIENTIFIC_DOMAIN];
            this.categoriesVocabulary = this.vocabularies[Type.SCIENTIFIC_SUBDOMAIN];
            this.legalStatusVocabulary = this.vocabularies[Type.PROVIDER_LEGAL_STATUS];
            this.networksVocabulary = this.vocabularies[Type.PROVIDER_NETWORK];
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

  registerCatalogue(tempSave: boolean) {
    super.registerCatalogue(tempSave);
  }

  getProvider() {
    this.errorMessage = '';
    const path = this.route.snapshot.routeConfig.path;
    this.catalogueService[(path === 'add/:catalogueId' ? 'getPendingProviderById' : 'getCatalogueById')](this.catalogueId)
      .subscribe(
        catalogue => this.catalogue = catalogue,
        err => {
          console.log(err);
          this.errorMessage = 'Something went wrong.';
        },
        () => {
          if(this.catalogue.users===null && this.catalogue.mainContact===null) //in case of unauthorized access backend will not show sensitive info
            this.router.navigateByUrl('/forbidden')
          // console.log(Object.keys(this.catalogue));
          ResourceService.removeNulls(this.catalogue);
          // TODO: get it done this way
          // const keys = Object.keys(this.catalogue);
          // for (const key of keys) {
          //   if (key === 'id' || key === 'active' || key === 'status') { continue; }
          //   if (this.catalogueForm.controls[key].value.constructor === Array) {
          //     for (let i = 0; i < this.catalogue[key].length - 1; i++) {
          //       console.log(key);
          //       if (key === 'users') {
          //         this.addUser();
          //       } else {
          //         if (this.catalogue[key] && this.catalogue[key].length > 1) {
          //           for (let j = 0; j < this.catalogue[key].length - 1; j++) {
          //             this.push(key, false);
          //           }
          //         }
          //       }
          //     }
          //   }
          // }
          if (this.catalogue.users && this.catalogue.users.length > 1) {
            for (let i = 0; i < this.catalogue.users.length - 1; i++) {
              this.addUser();
            }
          } else if (path === 'add/:providerId') {
            this.addDefaultUser();
          }

          // if (this.catalogue.multimedia && this.catalogue.multimedia.length > 1) {
          //   for (let i = 0; i < this.catalogue.multimedia.length - 1; i++) {
          //     this.push('multimedia', this.multimediaURLDesc.mandatory, true);
          //   }
          // }

          if (this.catalogue.multimedia && this.catalogue.multimedia.length > 1) {
            for (let i = 0; i < this.catalogue.multimedia.length - 1; i++) {
              this.multimediaArray.push(this.newMultimedia());
            }
          }

          if (this.catalogue.scientificDomains) {
            // this.removeDomain(0);
            for (let i = 0; i < this.catalogue.scientificDomains.length; i++) {
              this.domainArray.push(this.newScientificDomain());

              // for (let j = 0; j < this.categoriesVocabulary.length; j++) {
              //   if (this.categoriesVocabulary[j].id === this.catalogue.scientificDomains[i]) {
              //     this.domainArray.controls[this.domainArray.length - 1].get('domain').setValue(this.categoriesVocabulary[j].parentId);
              //     this.domainArray.controls[this.domainArray.length - 1].get('scientificSubdomain').setValue(this.categoriesVocabulary[j].id);
              //   }
              // }
            }
          } else this.domainArray.push(this.newScientificDomain());

          if (this.catalogue.publicContacts && this.catalogue.publicContacts.length > 1) {
            for (let i = 0; i < this.catalogue.publicContacts.length - 1; i++) {
              this.pushPublicContact();
            }
          }
          if (this.catalogue.tags && this.catalogue.tags.length > 1) {
            for (let i = 0; i < this.catalogue.tags.length - 1; i++) {
              this.push('tags', this.tagsDesc.mandatory);
            }
          }
          if (this.catalogue.participatingCountries && this.catalogue.participatingCountries.length > 1) {
            for (let i = 0; i < this.catalogue.participatingCountries.length - 1; i++) {
              this.push('participatingCountries', this.participatingCountriesDesc.mandatory);
            }
          }
          if (this.catalogue.affiliations && this.catalogue.affiliations.length > 1) {
            for (let i = 0; i < this.catalogue.affiliations.length - 1; i++) {
              this.push('affiliations', this.affiliationDesc.mandatory);
            }
          }
          if (this.catalogue.networks && this.catalogue.networks.length > 1) {
            for (let i = 0; i < this.catalogue.networks.length - 1; i++) {
              this.push('networks', this.networksDesc.mandatory);
            }
          }
          this.catalogueForm.patchValue(this.catalogue);
          this.catalogueForm.updateValueAndValidity();
          if (this.disable) {
            this.catalogueForm.disable();
          }
          this.initCatalogueBitSets();
        }
      );
  }

  toggleDisable() {
    this.disable = !this.disable;
    this.catalogueForm.enable();
  }

  initCatalogueBitSets() {
    this.handleBitSets(0, 0, 'name');
    this.handleBitSets(0, 1, 'abbreviation');
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
