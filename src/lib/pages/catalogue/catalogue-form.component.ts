import {Component, isDevMode, OnInit, ViewChild} from '@angular/core';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {AuthenticationService} from '../../services/authentication.service';
import {ServiceProviderService} from '../../services/service-provider.service';
import {CatalogueService} from "../../services/catalogue.service";
import {ResourceService} from '../../services/resource.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfigService} from '../../services/config.service';
import {environment} from '../../../environments/environment';
import {Model} from "../../../dynamic-catalogue/domain/dynamic-form-model";
import {FormControlService} from "../../../dynamic-catalogue/services/form-control.service";
import {SurveyComponent} from "../../../dynamic-catalogue/pages/dynamic-form/survey.component";
import {pidHandler} from "../../shared/pid-handler/pid-handler.service";
import {DeduplicationService, SimilarResource} from '../../services/deduplication.service';

declare var UIkit: any;

@Component({
    selector: 'app-catalogue-form',
    templateUrl: './catalogue-form.component.html',
    providers: [FormControlService],
    standalone: false
})
export class CatalogueFormComponent implements OnInit {
  @ViewChild(SurveyComponent) child: SurveyComponent
  model: Model = null;
  payloadAnswer: object = null;
  formDataToSubmit: any = null;

  protected readonly isDevMode = isDevMode;
  protected readonly environment = environment;
  serviceORresource = environment.serviceORresource;
  catalogueId: string = null;
  providerId: string = null;
  errorMessage = '';
  viewOnlyMode = false;
  editMode = false;
  hasChanges = false;
  pendingCatalogue = false;
  similarResources: SimilarResource[] = [];
  disable = false;
  showLoader = false;
  isPortalAdmin = false;

  vocabularyEntryForm: UntypedFormGroup;
  suggestionsForm = {
    domainsVocabularyEntryValueName: '',
    categoriesVocabularyEntryValueName: '',
    placesVocabularyEntryValueName: '',
    networksVocabularyEntryValueName: '',
    providerTypeVocabularyEntryValueName: '',
    vocabulary: '',
    errorMessage: '',
    successMessage: ''
  };

  commentControl = new UntypedFormControl();

  constructor(public fb: UntypedFormBuilder,
              public authService: AuthenticationService,
              public serviceProviderService: ServiceProviderService,
              public catalogueService: CatalogueService,
              public resourceService: ResourceService,
              public router: Router,
              public route: ActivatedRoute,
              public dynamicFormService: FormControlService,
              public config: ConfigService,
              public pidHandler: pidHandler,
              public deduplicationService: DeduplicationService) {
  }

  ngOnInit() {
    this.showLoader = true;
    this.providerId = this.route.snapshot.paramMap.get('providerId');
    this.serviceProviderService.getFormModelById('m-b-catalogue').subscribe(
      res => this.model = res,
      err => {
        console.log(err);
        this.showLoader = false;
      },
      () =>  {
        if (!this.editMode) { //prefill field(s)
          this.payloadAnswer = {
            'answer': {
              catalogue: {
                'resourceOwner': decodeURIComponent(this.providerId),
                'type': "Catalogue",
                'nodePID': (this.config.getProperty('nodePidFixed')) ? this.config.getProperty('nodePid') : null
              }
            }
          };
        }
        this.showLoader = false;
      }
    )

    const path = this.route.snapshot.routeConfig.path;
    if (path.includes('add/:catalogueId')) {
      this.pendingCatalogue = true;
    }
    // if (path.includes('info/:catalogueId')) {
    //   this.pendingCatalogue = true;
    // }

    this.isPortalAdmin = this.authService.isAdmin();

    this.vocabularyEntryForm = this.fb.group(this.suggestionsForm);
  }

  submitForm(formData: any, tempSave: boolean) {
    let catalogueValue = formData.value.catalogue;
    window.scrollTo(0, 0);

    this.errorMessage = '';
    // this.trimFormWhiteSpaces();
    const path = this.route.snapshot.routeConfig.path;
    let method;
    if (path === 'add/:catalogueId') {
      method = 'updateAndActivatePendingProvider';
    } else {
      method = this.editMode ? 'updateCatalogue' : 'createNewCatalogue';
    }

    catalogueValue = FormControlService.cleanObjectInPlace(catalogueValue);

    if (tempSave) {//TODO
      this.showLoader = true;
      window.scrollTo(0, 0);
      this.serviceProviderService.temporarySaveProvider(catalogueValue, (path !== 'add/:catalogueId' && this.editMode))
        .subscribe(
          res => {
            this.showLoader = false;
            this.router.navigate([`/provider/add/${res.id}`]);
          },
          err => {
            this.showLoader = false;
            window.scrollTo(0, 0);
                    this.errorMessage =
          (err?.status >= 500 && err?.status < 600)
            ? `Something went wrong. If the issue persists, please contact support and provide the following error code: ${err?.error?.traceId}`
            : `Something went bad, server responded: ${err?.error?.detail}`;
          },
          () => {
            this.showLoader = false;
          }
        );
    } else {
      this.showLoader = true;
      window.scrollTo(0, 0);

      this.catalogueService[method](catalogueValue, this.commentControl.value).subscribe(
        res => {
          this.catalogueId = res.id;
        },
        err => {
          this.showLoader = false;
          window.scrollTo(0, 0);
                  this.errorMessage =
          (err?.status >= 500 && err?.status < 600)
            ? `Something went wrong. If the issue persists, please contact support and provide the following error code: ${err?.error?.traceId}`
            : `Something went bad, server responded: ${err?.error?.detail}`;
        },
        () => {
          this.showLoader = false;
          this.router.navigate(['/catalogue-dashboard/' + this.pidHandler.customEncodeURIComponent(this.catalogueId) +'/info']);
        }
      );
    }

  }

  unsavedChangesPrompt() {
    this.hasChanges = true;
  }

  timeOut(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /** Submit Comment Modal--> **/
  handleSubmit(formData: any) {
    if (this.editMode && !this.pendingCatalogue) {
      this.formDataToSubmit = formData;
      UIkit.modal('#commentModal').show();
    } else {
      this.checkDuplicatesAndProceed(formData);
    }
  }

  checkDuplicatesAndProceed(formData: any) {
    const value = FormControlService.cleanObjectInPlace({...formData.value?.catalogue ?? formData});
    this.deduplicationService.checkBeforeAdd('catalogue', value).subscribe({
      next: similar => {
        if (similar && similar.length > 0) {
          this.similarResources = similar;
          this.formDataToSubmit = formData;
          UIkit.modal('#dupWarningModal').show();
        } else {
          this.submitForm(formData, false);
        }
      },
      error: () => this.submitForm(formData, false)
    });
  }

  proceedDespiteSimilar() {
    UIkit.modal('#dupWarningModal').hide();
    this.submitForm(this.formDataToSubmit, false);
  }
  /** <--Submit Comment Modal **/

  copy = window.navigator.clipboard.writeText.bind(window.navigator.clipboard);
}
