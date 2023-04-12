import {Component, OnInit} from '@angular/core';
import {InteroperabilityRecord, Type} from '../../../domain/eic-model';
import {FormBuilder} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {GuidelinesFormComponent} from "./guidelines-form.component";
import {AuthenticationService} from "../../../services/authentication.service";
import {ServiceProviderService} from "../../../services/service-provider.service";
import {ResourceService} from "../../../services/resource.service";
import {GuidelinesService} from "../../../services/guidelines.service";


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
              public guidelinesService: GuidelinesService,
              public resourceService: ResourceService,
              public router: Router,
              public route: ActivatedRoute) {
    super(fb, authService, serviceProviderService, guidelinesService, resourceService, router, route);
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
            this.nameTypeVocabulary = this.vocabularies[Type.IR_NAME_TYPE];
            this.resourceTypeGeneralVocabulary = this.vocabularies[Type.IR_RESOURCE_TYPE_GENERAL];
            this.statusVocabulary = this.vocabularies[Type.IR_STATUS];
            this.domainVocabulary = this.vocabularies[Type.SCIENTIFIC_DOMAIN];
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
    this.guidelinesService.getInteroperabilityRecordById(this.guidelineId).subscribe(
        guideline => this.guideline = guideline,
        err => {
          console.log(err);
          this.errorMessage = 'Something went wrong.';
        },
        () => {
          ResourceService.removeNulls(this.guideline);

          if (this.guideline.resourceTypesInfo && this.guideline.resourceTypesInfo.length > 1) {
            for (let i = 0; i < this.guideline.resourceTypesInfo.length - 1; i++) {
              this.rightsArray.push(this.newResourceTypeInfo());
            }
          }
          if (this.guideline.rights && this.guideline.rights.length > 1) {
            for (let i = 0; i < this.guideline.rights.length - 1; i++) {
              this.rightsArray.push(this.newRight());
            }
          }
          if (this.guideline.creators && this.guideline.creators.length > 1) {
            for (let i = 0; i < this.guideline.creators.length - 1; i++) {
              this.pushCreator();
            }
          }
          if (this.guideline.eoscRelatedStandards && this.guideline.eoscRelatedStandards.length > 1) {
            for (let i = 0; i < this.guideline.eoscRelatedStandards.length - 1; i++) {
              this.push('eoscRelatedStandards', this.eoscRelatedStandardsDesc.mandatory);
            }
          }
          if (this.guideline.eoscIntegrationOptions && this.guideline.eoscIntegrationOptions.length > 1) {
            for (let i = 0; i < this.guideline.eoscIntegrationOptions.length - 1; i++) {
              this.push('eoscIntegrationOptions', this.eoscIntegrationOptionsDesc.mandatory);
            }
          }
          this.guidelinesForm.patchValue(this.guideline);
          this.guidelinesForm.get('created').setValue(this.timestampToDate(this.guideline.created));
          this.guidelinesForm.get('updated').setValue(this.timestampToDate(this.guideline.updated));
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
