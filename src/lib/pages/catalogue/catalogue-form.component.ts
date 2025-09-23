import {Component, isDevMode, OnInit, ViewChild} from '@angular/core';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import * as dm from '../../shared/description.map';
import {AuthenticationService} from '../../services/authentication.service';
import {ServiceProviderService} from '../../services/service-provider.service';
import {CatalogueService} from "../../services/catalogue.service";
import {ResourceService} from '../../services/resource.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Vocabulary, Type} from '../../domain/eic-model';
import {ConfigService} from '../../services/config.service';
import {environment} from '../../../environments/environment';
import {Model} from "../../../dynamic-catalogue/domain/dynamic-form-model";
import {FormControlService} from "../../../dynamic-catalogue/services/form-control.service";
import {SurveyComponent} from "../../../dynamic-catalogue/pages/dynamic-form/survey.component";

declare var UIkit: any;

@Component({
  selector: 'app-catalogue-form',
  templateUrl: './catalogue-form.component.html',
  // styleUrls: ['./service-provider-form.component.css']
  providers: [FormControlService]
})
export class CatalogueFormComponent implements OnInit {
  @ViewChild(SurveyComponent) child: SurveyComponent
  model: Model = null;
  vocabulariesMap: Map<string, object[]> = null;
  subVocabulariesMap: Map<string, object[]> = null
  payloadAnswer: object = null;
  formDataToSubmit: any = null;

  protected readonly isDevMode = isDevMode;
  catalogueName: string | null = null;
  protected readonly environment = environment;
  _hasUserConsent = environment.hasUserConsent;
  serviceORresource = environment.serviceORresource;
  privacyPolicyURL = environment.privacyPolicyURL;
  onboardingAgreementURL = environment.onboardingAgreementURL;
  catalogueId: string = null;
  errorMessage = '';
  userInfo = {sub:'', family_name: '', given_name: '', email: ''};
  vocabularies: Map<string, Vocabulary[]> = null;
  subVocabularies: Map<string, Vocabulary[]> = null;
  editMode = false;
  hasChanges = false;
  pendingCatalogue = false;
  disable = false;
  showLoader = false;
  isPortalAdmin = false;

  codeOfConduct = false;
  privacyPolicy = false;
  authorizedRepresentative = false;
  onboardingAgreement = false;
  agreedToTerms: boolean;

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

  placesVocabulary: Vocabulary[] = null;
  providerTypeVocabulary: Vocabulary[] = null;
  domainsVocabulary: Vocabulary[] = null;
  categoriesVocabulary: Vocabulary[] = null;
  legalStatusVocabulary: Vocabulary[] = null;
  networksVocabulary: Vocabulary[] = null;
  hostingLegalEntityVocabulary: Vocabulary[] = null;
  nodeVocabulary: Vocabulary[] = null;

  constructor(public fb: UntypedFormBuilder,
              public authService: AuthenticationService,
              public serviceProviderService: ServiceProviderService,
              public catalogueService: CatalogueService,
              public resourceService: ResourceService,
              public router: Router,
              public route: ActivatedRoute,
              public dynamicFormService: FormControlService,
              public config: ConfigService) {
  }

  ngOnInit() {
    this.catalogueName = this.config.getProperty('catalogueName');

    this.showLoader = true;

    this.serviceProviderService.getFormModelById('m-b-catalogue').subscribe(
      res => this.model = res,
      err => console.log(err),
      () =>  {
        if (!this.editMode) { //prefill field(s)
          const currentUser = this.getCurrentUserInfo();
          this.payloadAnswer = {
            'answer': {
              Catalogue: {
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
      }
    )

    const path = this.route.snapshot.routeConfig.path;
    if (path.includes('add/:catalogueId')) {
      this.pendingCatalogue = true;
    }
    // if (path.includes('info/:catalogueId')) {
    //   this.pendingCatalogue = true;
    // }
    this.setVocabularies();

    if (this._hasUserConsent) {
      if (this.editMode) {
        this.catalogueService.hasAdminAcceptedTerms(this.catalogueId, this.pendingCatalogue).subscribe(
          boolean => { this.agreedToTerms = boolean; },
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

  submitForm(value: any, tempSave: boolean) {
    let catalogueValue = value[0].value.Catalogue;
    window.scrollTo(0, 0);

    this.errorMessage = '';
    // this.trimFormWhiteSpaces();
    const path = this.route.snapshot.routeConfig.path;
    let method;
    if (path === 'add/:catalogueId') {
      method = 'updateAndPublishPendingProvider';
    } else {
      method = this.editMode ? 'updateCatalogue' : 'createNewCatalogue';
    }

    this.cleanArrayProperty(catalogueValue, 'multimedia');
    this.cleanArrayProperty(catalogueValue, 'scientificDomains');

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
            this.errorMessage = 'Something went wrong. ' + JSON.stringify(err.error.message);
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
        },
        err => {
          this.showLoader = false;
          window.scrollTo(0, 0);
          this.errorMessage = 'Something went wrong. ' + JSON.stringify(err.error.message);
        },
        () => {
          this.showLoader = false;
          if (this.editMode) {
            this.router.navigate(['/catalogue/my']);
          } else {
            this.router.navigate(['/catalogue/my']);
            // this.authService.refreshLogin('/catalogue/my'); // fixme: not redirecting
          }
        }
      );
    }

  }

  /** get and set vocabularies **/
  setVocabularies() {
    this.resourceService.getAllVocabulariesByType().subscribe(
      res => {
        this.vocabulariesMap = res;
        let subVocs: Vocabulary[] = this.vocabulariesMap['SCIENTIFIC_SUBDOMAIN'].concat(this.vocabulariesMap['PROVIDER_MERIL_SCIENTIFIC_SUBDOMAIN']);
        this.subVocabulariesMap = this.groupByKey(subVocs, 'parentId');

        this.vocabularies = res;
        this.nodeVocabulary = this.vocabularies[Type.NODE];
        this.placesVocabulary = this.vocabularies[Type.COUNTRY];
        this.domainsVocabulary = this.vocabularies[Type.SCIENTIFIC_DOMAIN];
        this.categoriesVocabulary = this.vocabularies[Type.SCIENTIFIC_SUBDOMAIN];
        this.legalStatusVocabulary = this.vocabularies[Type.PROVIDER_LEGAL_STATUS];
        this.networksVocabulary = this.vocabularies[Type.PROVIDER_NETWORK];
        this.hostingLegalEntityVocabulary = this.vocabularies[Type.PROVIDER_HOSTING_LEGAL_ENTITY];
        return this.vocabularies;
      },
      error => console.log(JSON.stringify(error.error)),
      () => {
        let voc: Vocabulary[] = this.vocabularies[Type.SCIENTIFIC_SUBDOMAIN].concat(this.vocabularies[Type.PROVIDER_MERIL_SCIENTIFIC_SUBDOMAIN]);
        this.subVocabularies = this.groupByKey(voc, 'parentId');
        this.showLoader = false;
        return this.vocabularies;
      }
    );
  }

  getSortedChildrenCategories(childrenCategory: Vocabulary[], parentId: string) {
    return this.sortVocabulariesByName(childrenCategory.filter(entry => entry.parentId === parentId));
  }

  sortVocabulariesByName(vocabularies: Vocabulary[]): Vocabulary[] {
    return vocabularies.sort((vocabulary1, vocabulary2) => {
      if (vocabulary1.name > vocabulary2.name) {
        return 1;
      }
      if (vocabulary1.name < vocabulary2.name) {
        return -1;
      }
      return 0;
    });
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
    } else if (term === 'onboardingAgreement') {
      this.onboardingAgreement = !this.onboardingAgreement;
    }
    this.checkTerms();
  }

  checkTerms() {
    this.agreedToTerms = this.privacyPolicy && this.authorizedRepresentative && this.onboardingAgreement;
  }

  acceptTerms() {
    if (this._hasUserConsent && this.editMode) {
      this.catalogueService.adminAcceptedTerms(this.catalogueId, this.pendingCatalogue).subscribe(
        res => {},
        error => { console.log(error); },
        () => {}
      );
    }
  }

  /** <--Terms Modal **/

  /** Submit Comment Modal--> **/
  showCommentModal(formData: any) {
    if (this.editMode && !this.pendingCatalogue) {
      this.formDataToSubmit = formData;
      UIkit.modal('#commentModal').show();
    } else {
      this.submitForm(formData, false);
    }
  }

  /** <--Submit Comment Modal **/

  submitSuggestion(entryValueName, vocabulary, parent) {
    if (entryValueName.trim() !== '') {
      this.serviceProviderService.submitVocabularyEntry(entryValueName, vocabulary, parent, 'provider', this.catalogueId, null).subscribe(
        res => {
        },
        error => {
          console.log(error);
          this.vocabularyEntryForm.get('errorMessage').setValue(error.error.message);
        },
        () => {
          this.vocabularyEntryForm.reset();
          this.vocabularyEntryForm.get('successMessage').setValue('Suggestion submitted!');
        }
      );
    }
  }

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

  cleanArrayProperty(obj: any, property: string): void {
    if (obj && Array.isArray(obj[property])) {
      // Filter out elements that are entirely empty:
      const cleaned = obj[property].filter((element: any) => {
        if (element && typeof element === 'object') {
          // Keep the element if at least one property has a non-empty value.
          return Object.keys(element).some(key => element[key] !== null && element[key] !== '');
        }
        // For non-objects, keep the element if it's not null or ''.
        return element !== null && element !== '';
      });
      // If the cleaned array is empty, set the property to null. Otherwise, update it.
      obj[property] = cleaned.length ? cleaned : null;
    }
  }

  getCurrentUserInfo(): { firstname: string; lastname: string; email: string } {
    return {
      firstname: this.authService.getUserName(),
      lastname: this.authService.getUserSurname(),
      email: this.authService.getUserEmail()
    };
  }
}
