import {Component, OnInit} from '@angular/core';
import {InteroperabilityRecord, Type} from '../../../domain/eic-model';
import {FormBuilder} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {GuidelinesFormComponent} from "./guidelines-form.component";
import {AuthenticationService} from "../../../services/authentication.service";
import {ServiceProviderService} from "../../../services/service-provider.service";
import {ResourceExtrasService} from "../../../services/resource-extras.service";
import {ResourceService} from "../../../services/resource.service";


@Component({
  selector: 'app-update-guidelines-form',
  templateUrl: './guidelines-form.component.html',
})
export class UpdateGuidelinesFormComponent extends GuidelinesFormComponent implements OnInit {
  errorMessage: string;
  guideline: InteroperabilityRecord;
  guidelineId: string;

  constructor(public fb: FormBuilder,
              public authService: AuthenticationService,
              public serviceProviderService: ServiceProviderService,
              public resourceExtrasService: ResourceExtrasService,
              public resourceService: ResourceService,
              public router: Router,
              public route: ActivatedRoute) {
    super(fb, authService, serviceProviderService, resourceExtrasService, resourceService, router, route);
  }

  ngOnInit() {
    this.edit = true;
    this.guidelineId = this.route.snapshot.paramMap.get('guidelineId');
    const path = this.route.snapshot.routeConfig.path;
    if (path === 'info/:guidelineId') {
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
            this.identifierTypeVocabulary = this.vocabularies[Type.IR_IDENTIFIER_TYPE];
            this.nameTypeTypeVocabulary = this.vocabularies[Type.IR_NAME_TYPE];
            this.resourceTypeGeneralVocabulary = this.vocabularies[Type.IR_RESOURCE_TYPE_GENERAL];
            // this.resourceTypeGeneralVocabulary = this.vocabularies[Type.SCIENTIFIC_SUBDOMAIN];
            this.statusVocabulary = this.vocabularies[Type.IR_STATUS];
            this.domainVocabulary = this.vocabularies[Type.IR_DOMAIN];
            this.eoscGuidelineTypeVocabulary = this.vocabularies[Type.IR_EOSC_GUIDELINE_TYPE];
          },
          error => console.log(error),
          () => {
            this.getGuideline();
          }
        );
      } else {
        this.getGuideline();
      }
    }
  }

  onSubmit() {
    super.onSubmit();
  }

  getGuideline() {
    this.errorMessage = '';
    const path = this.route.snapshot.routeConfig.path;
    this.resourceExtrasService.getInteroperabilityRecordById(this.guidelineId).subscribe(
        guideline => this.guideline = guideline,
        err => {
          console.log(err);
          this.errorMessage = 'Something went wrong.';
        },
        () => {
          ResourceService.removeNulls(this.guideline);

          // if (this.guideline.users && this.guideline.users.length > 1) {
          //   for (let i = 0; i < this.guideline.users.length - 1; i++) {
          //     this.addUser();
          //   }
          // } else if (path === 'add/:providerId') {
          //   this.addDefaultUser();
          // }
          //
          //
          // if (this.guideline.multimedia && this.guideline.multimedia.length > 1) {
          //   for (let i = 0; i < this.guideline.multimedia.length - 1; i++) {
          //     this.multimediaArray.push(this.newMultimedia());
          //   }
          // }
          //
          // if (this.guideline.scientificDomains) {
          //   // this.removeDomain(0);
          //   for (let i = 0; i < this.guideline.scientificDomains.length; i++) {
          //     this.domainArray.push(this.newScientificDomain());
          //
          //     // for (let j = 0; j < this.categoriesVocabulary.length; j++) {
          //     //   if (this.categoriesVocabulary[j].id === this.guideline.scientificDomains[i]) {
          //     //     this.domainArray.controls[this.domainArray.length - 1].get('domain').setValue(this.categoriesVocabulary[j].parentId);
          //     //     this.domainArray.controls[this.domainArray.length - 1].get('scientificSubdomain').setValue(this.categoriesVocabulary[j].id);
          //     //   }
          //     // }
          //   }
          // } else this.domainArray.push(this.newScientificDomain());
          //
          // if (this.guideline.publicContacts && this.guideline.publicContacts.length > 1) {
          //   for (let i = 0; i < this.guideline.publicContacts.length - 1; i++) {
          //     this.pushPublicContact();
          //   }
          // }
          // if (this.guideline.tags && this.guideline.tags.length > 1) {
          //   for (let i = 0; i < this.guideline.tags.length - 1; i++) {
          //     this.push('tags', this.tagsDesc.mandatory);
          //   }
          // }
          // if (this.guideline.participatingCountries && this.guideline.participatingCountries.length > 1) {
          //   for (let i = 0; i < this.guideline.participatingCountries.length - 1; i++) {
          //     this.push('participatingCountries', this.participatingCountriesDesc.mandatory);
          //   }
          // }
          // if (this.guideline.affiliations && this.guideline.affiliations.length > 1) {
          //   for (let i = 0; i < this.guideline.affiliations.length - 1; i++) {
          //     this.push('affiliations', this.affiliationDesc.mandatory);
          //   }
          // }
          // if (this.guideline.networks && this.guideline.networks.length > 1) {
          //   for (let i = 0; i < this.guideline.networks.length - 1; i++) {
          //     this.push('networks', this.networksDesc.mandatory);
          //   }
          // }
          this.guidelinesForm.patchValue(this.guideline);
          // this.guidelinesForm.updateValueAndValidity();
          // if (this.disable) {
          //   this.guidelinesForm.disable();
          // }


          // this.initCatalogueBitSets();
        }
      );
  }

  toggleDisable() {
    this.disable = !this.disable;
    this.guidelinesForm.enable();
  }

  initCatalogueBitSets() {
    // this.handleBitSets(0, 0, 'name');
    // this.handleBitSets(0, 1, 'abbreviation');
    // this.handleBitSets(0, 2, 'website');
    // this.handleBitSets(0, 16, 'legalEntity');
    // this.handleBitSets(1, 3, 'description');
    // this.handleBitSets(1, 4, 'logo');
    // this.handleBitSetsOfGroups(3, 5, 'streetNameAndNumber', 'location');
    // this.handleBitSetsOfGroups(3, 6, 'postalCode', 'location');
    // this.handleBitSetsOfGroups(3, 7, 'city', 'location');
    // this.handleBitSetsOfGroups(3, 8, 'country', 'location');
    // this.handleBitSetsOfGroups(4, 9, 'firstName', 'mainContact');
    // this.handleBitSetsOfGroups(4, 10, 'lastName', 'mainContact');
    // this.handleBitSetsOfGroups(4, 11, 'email', 'mainContact');
    // this.handleBitSetsOfPublicContact(4, 15, 'email', 'publicContacts');
    // this.initUserBitSets();
  }

}
