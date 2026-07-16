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
import {DeduplicationService} from "../../services/deduplication.service";


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
              public config: ConfigService,
              public deduplicationService: DeduplicationService) {
    super(fb, authService, serviceProviderService, guidelinesService, resourceService, router, route, pidHandler, config, deduplicationService);
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

  getGuideline() {
    this.errorMessage = '';
    this.guidelinesService.getInteroperabilityRecordById(this.guidelineId).subscribe(
        guideline => {
          this.guideline = guideline;
          this.payloadAnswer = {'answer': {interoperabilityRecord: guideline}};
        },
        err => {
          console.log(err);
          this.errorMessage = 'Something went wrong.';
        },
        () => {
          ResourceService.removeNulls(this.guideline);

          // this.guidelinesForm.patchValue(this.guideline);
          // this.guidelinesForm.get('created').setValue(this.timestampToDate(this.guideline.created));
          // this.guidelinesForm.get('updated').setValue(this.timestampToDate(this.guideline.updated));
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

}
