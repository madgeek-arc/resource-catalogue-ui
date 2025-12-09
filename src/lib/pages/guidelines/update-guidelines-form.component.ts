import {Component, OnInit} from '@angular/core';
import {InteroperabilityRecord, Type} from '../../domain/eic-model';
import {UntypedFormBuilder} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {GuidelinesFormComponent} from "./guidelines-form.component";
import {AuthenticationService} from "../../services/authentication.service";
import {ServiceProviderService} from "../../services/service-provider.service";
import {ResourceService} from "../../services/resource.service";
import {GuidelinesService} from "../../services/guidelines.service";
import {pidHandler} from "../../shared/pid-handler/pid-handler.service";
import {ConfigService} from "../../services/config.service";


@Component({
    selector: 'app-update-guidelines-form',
    templateUrl: './guidelines-form.component.html',
    standalone: false
})
export class UpdateGuidelinesFormComponent extends GuidelinesFormComponent implements OnInit {
  errorMessage: string;
  guideline: InteroperabilityRecord;
  guidelineId: string;

  constructor(public fb: UntypedFormBuilder,
              public authService: AuthenticationService,
              public serviceProviderService: ServiceProviderService,
              public guidelinesService: GuidelinesService,
              public resourceService: ResourceService,
              public router: Router,
              public route: ActivatedRoute,
              public pidHandler: pidHandler,
              public config: ConfigService) {
    super(fb, authService, serviceProviderService, guidelinesService, resourceService, router, route, pidHandler, config);
  }

  ngOnInit() {
    this.editMode = true;
    this.guidelineId = this.route.snapshot.paramMap.get('guidelineId');
    const path = this.route.snapshot.routeConfig.path;
    if (path === 'info/:guidelineId') {
      this.disable = true;
    }
    super.ngOnInit();
    if (sessionStorage.getItem('guideline')) {
      sessionStorage.removeItem('guideline');
    } else {
      this.getGuideline();
    }
  }

  onSubmit() {
    super.onSubmit();
  }

  getGuideline() {
    this.errorMessage = '';
    const path = this.route.snapshot.routeConfig.path;
    this.guidelinesService.getInteroperabilityRecordById(this.guidelineId).subscribe(
        guideline => {
          this.guideline = guideline,
          this.payloadAnswer = {'answer': {Guidelines: guideline}};
        },
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
              this.pushRight();
            }
          }
          if (this.guideline.relatedStandards && this.guideline.relatedStandards.length > 1) {
            for (let i = 0; i < this.guideline.relatedStandards.length - 1; i++) {
              this.pushRelatedStandard();
            }
          }
          if (this.guideline.creators && this.guideline.creators.length > 1) {
            for (let i = 0; i < this.guideline.creators.length - 1; i++) {
              this.pushCreator();
            }
          }
          if (this.guideline.eoscIntegrationOptions && this.guideline.eoscIntegrationOptions.length > 1) {
            for (let i = 0; i < this.guideline.eoscIntegrationOptions.length - 1; i++) {
              this.push('eoscIntegrationOptions', this.eoscIntegrationOptionsDesc.mandatory);
            }
          }
          if (this.guideline.alternativeIdentifiers) {
            for (let i = 0; i < this.guideline.alternativeIdentifiers.length - 1; i++) {
              this.pushAlternativeIdentifier();
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
