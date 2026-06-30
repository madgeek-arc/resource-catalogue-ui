import {Component, isDevMode, OnInit, ViewChild} from '@angular/core';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {AuthenticationService} from '../../services/authentication.service';
import {ServiceProviderService} from '../../services/service-provider.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Vocabulary} from '../../domain/eic-model';
import {ResourceService} from '../../services/resource.service';
import {ConfigService} from '../../services/config.service';
import {environment} from '../../../environments/environment';
import {CatalogueService} from "../../services/catalogue.service";
import {pidHandler} from "../../shared/pid-handler/pid-handler.service";
import {NavigationService} from "../../services/navigation.service";
import {Model} from "../../../dynamic-catalogue/domain/dynamic-form-model";
import {FormControlService} from "../../../dynamic-catalogue/services/form-control.service";
import {SurveyComponent} from "../../../dynamic-catalogue/pages/dynamic-form/survey.component";
import {DeduplicationService, SimilarResource} from '../../services/deduplication.service';

declare var UIkit: any;

@Component({
  selector: 'app-new-service-provider',
  templateUrl: './service-provider-form.component.html',
  providers: [FormControlService],
  standalone: false
})
export class ServiceProviderFormComponent implements OnInit {
  @ViewChild(SurveyComponent) child: SurveyComponent
  model: Model = null;
  payloadAnswer: object = null;
  formDataToSubmit: any = null;

  protected readonly isDevMode = isDevMode;
  catalogueName: string | null = null;
  protected readonly environment = environment;
  _hasUserConsent = environment.hasUserConsent;
  serviceORresource = environment.serviceORresource;
  privacyPolicyURL = environment.privacyPolicyURL;
  catalogueId: string = null;
  providerId: string = null;
  displayedCatalogueName: string;
  providerName = '';
  errorMessage = '';
  userInfo = {sub: '', family_name: '', given_name: '', email: ''};
  vocabularies: Map<string, Vocabulary[]> = null;
  subVocabularies: Map<string, Vocabulary[]> = null;
  viewOnlyMode = false;
  submitMode: 'draft' | 'submit' = 'submit';
  editMode = false;
  hasChanges = false;
  pendingProvider = false;
  saveAsDraftAvailable = false;
  disable = false;
  showLoader = false;
  similarResources: SimilarResource[] = [];
  tabs: boolean[] = [false, false, false, false, false, false, false, false];
  isPortalAdmin = false;

  codeOfConduct = false;
  privacyPolicy = false;
  authorizedRepresentative = false;
  agreedToTerms: boolean;

  vocabularyEntryForm: UntypedFormGroup;
  suggestionsForm = {
    domainsVocabularyEntryValueName: '',
    categoriesVocabularyEntryValueName: '',
    placesVocabularyEntryValueName: '',
    providerLCSVocabularyEntryValueName: '',
    networksVocabularyEntryValueName: '',
    providerTypeVocabularyEntryValueName: '',
    esfriDomainVocabularyEntryValueName: '',
    esfriVocabularyEntryValueName: '',
    merilDomainsVocabularyEntryValueName: '',
    merilCategoriesVocabularyEntryValueName: '',
    areasOfActivityVocabularyEntryValueName: '',
    societalGrandChallengesVocabularyEntryValueName: '',
    vocabulary: '',
    errorMessage: '',
    successMessage: ''
  };

  commentControl = new UntypedFormControl();

  constructor(public fb: UntypedFormBuilder,
              public authService: AuthenticationService,
              public serviceProviderService: ServiceProviderService,
              public resourceService: ResourceService,
              public catalogueService: CatalogueService,
              public router: Router,
              public route: ActivatedRoute,
              public navigator: NavigationService,
              public pidHandler: pidHandler,
              public dynamicFormService: FormControlService,
              public config: ConfigService,
              public deduplicationService: DeduplicationService) {
  }

  ngOnInit() {
    this.catalogueName = this.config.getProperty('catalogueName');

    this.showLoader = true;

    this.serviceProviderService.getFormModelById('m-b-organisation').subscribe(
      res => this.model = res,
      err => console.log(err),
      () => {
        if (!this.editMode) { //prefill field(s)
          const currentUser = this.getCurrentUserInfo();
          console.log(currentUser);
          this.payloadAnswer = {
            'answer': {
              organisation: {
                'catalogueId': this.catalogueId,
                'nodePID': (this.config.getProperty('nodePidFixed')) ? this.config.getProperty('nodePid') : null,
                'users': [
                  {
                    name: currentUser.firstname,
                    surname: currentUser.lastname,
                    email: currentUser.email
                  }
                ]
              }
            }
          };
        }
        this.showLoader = false;
      }
    )

    const path = this.route.snapshot.routeConfig.path;
    if (path.includes('add/:providerId')) {
      this.pendingProvider = true;
    }
    if (path.includes('view/:catalogueId/:providerId')) {
      this.viewOnlyMode = true;
    }
    if (!this.router.url.includes('/update/')) {
      this.saveAsDraftAvailable = true;
    }

    if (this._hasUserConsent && path !== 'view/:catalogueId/:providerId') {
      if (this.editMode) {
        this.serviceProviderService.hasAdminAcceptedTerms(this.providerId).subscribe(
          boolean => {
            this.agreedToTerms = boolean;
          },
          error => console.log(error),
          () => {
            if (!this.agreedToTerms) {
              UIkit.modal('#modal-consent').show();
            }
          }
        );
      } else {
        if (!this.agreedToTerms) {
          UIkit.modal('#modal-consent').show();
        }
      }
    }

    this.isPortalAdmin = this.authService.isAdmin();

    this.vocabularyEntryForm = this.fb.group(this.suggestionsForm);
  }

  submitForm(formData: any) {
    let providerValue = formData.value.organisation;
    window.scrollTo(0, 0);

    this.errorMessage = '';
    // this.trimFormWhiteSpaces();
    const path = this.route.snapshot.routeConfig.path;
    let method;
    if (path === 'add/:providerId') {
      method = 'updateAndActivatePendingProvider';
    } else {
      method = this.editMode ? 'updateServiceProvider' : 'createNewServiceProvider';
    }

    providerValue = FormControlService.cleanObjectInPlace(providerValue);

    if (this.submitMode === 'draft') {
      this.showLoader = true;
      this.serviceProviderService.temporarySaveProvider(providerValue, (path !== 'provider/add/:providerId' && this.editMode))
        .subscribe(
          res => {
            this.showLoader = false;
            this.router.navigate([`/provider/add/${this.pidHandler.customEncodeURIComponent(res.id)}`]);
          },
          err => {
            this.showLoader = false;
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
      this.serviceProviderService[method](providerValue, this.commentControl.value).subscribe(
        res => {
        },
        err => {
          this.showLoader = false;
                  this.errorMessage =
          (err?.status >= 500 && err?.status < 600)
            ? `Something went wrong. If the issue persists, please contact support and provide the following error code: ${err?.error?.traceId}`
            : `Something went bad, server responded: ${err?.error?.detail}`;
        },
        () => {
          this.showLoader = false;
          this.router.navigate(['/provider/my']);
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

  /** Terms Modal--> **/
  toggleTerm(term) {
    if (term === 'privacyPolicy') {
      this.privacyPolicy = !this.privacyPolicy;
    } else if (term === 'authorizedRepresentative') {
      this.authorizedRepresentative = !this.authorizedRepresentative;
    }
    this.checkTerms();
  }

  checkTerms() {
    this.agreedToTerms = this.privacyPolicy && this.authorizedRepresentative;
  }

  acceptTerms() {
    if (this._hasUserConsent && this.editMode) {
      this.serviceProviderService.adminAcceptedTerms(this.providerId).subscribe(
        res => {
        },
        error => {
          console.log(error);
        },
        () => {
        }
      );
    }
  }

  /** <--Terms Modal **/

  /** Submit Comment Modal--> **/
  showCommentModal(formData: any) {
    if (this.editMode && !this.pendingProvider) {
      this.formDataToSubmit = formData;
      UIkit.modal('#commentModal').show();
    } else {
      this.checkDuplicatesAndProceed(formData);
    }
  }

  checkDuplicatesAndProceed(formData: any) {
    const providerValue = FormControlService.cleanObjectInPlace({...formData.value?.organisation ?? formData});
    this.deduplicationService.checkBeforeAdd('organisation', providerValue).subscribe({
      next: similar => {
        if (similar && similar.length > 0) {
          this.similarResources = similar;
          this.formDataToSubmit = formData;
          UIkit.modal('#dupWarningModal').show();
        } else {
          this.submitForm(formData);
        }
      },
      error: () => this.submitForm(formData)
    });
  }

  proceedDespiteSimilar() {
    UIkit.modal('#dupWarningModal').hide();
    this.submitForm(this.formDataToSubmit);
  }

  /** <--Submit Comment Modal **/

  /*submitSuggestion(entryValueName, vocabulary, parent) {
    if (entryValueName.trim() !== '') {
      this.serviceProviderService.submitVocabularyEntry(entryValueName, vocabulary, parent, 'provider', this.providerId, null).subscribe(
        res => {
        },
        error => {
          console.log(error);
          this.vocabularyEntryForm.get('errorMessage').setValue(error.error.detail);
        },
        () => {
          this.vocabularyEntryForm.reset();
          this.vocabularyEntryForm.get('successMessage').setValue('Suggestion submitted!');
        }
      );
    }
  }*/

  showNotification() {
    UIkit.notification({
      message: 'Please remove duplicate entries.',
      status: 'danger',
      pos: 'top-center',
      timeout: 7000
    });
  }

  groupByKey(array, key) {
    return array.reduce((hash, obj) => {
      if (obj[key] === undefined) {
        return hash;
      }
      return Object.assign(hash, {[obj[key]]: (hash[obj[key]] || []).concat(obj)});
    }, {});
  }

  getCurrentUserInfo(): { firstname: string; lastname: string; email: string } {
    return {
      firstname: this.authService.getUserName(),
      lastname: this.authService.getUserSurname(),
      email: this.authService.getUserEmail()
    };
  }

}
