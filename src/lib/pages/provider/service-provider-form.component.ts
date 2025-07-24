import {Component, isDevMode, OnInit, ViewChild} from '@angular/core';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import * as dm from '../../shared/description.map';
import {AuthenticationService} from '../../services/authentication.service';
import {ServiceProviderService} from '../../services/service-provider.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Vocabulary} from '../../domain/eic-model';
import {ResourceService} from '../../services/resource.service';
import {environment} from '../../../environments/environment';
import {CatalogueService} from "../../services/catalogue.service";
import {pidHandler} from "../../shared/pid-handler/pid-handler.service";
import {NavigationService} from "../../services/navigation.service";
import {Model} from "../../../dynamic-catalogue/domain/dynamic-form-model";
import {FormControlService} from "../../../dynamic-catalogue/services/form-control.service";
import {SurveyComponent} from "../../../dynamic-catalogue/pages/dynamic-form/survey.component";
import {zip} from "rxjs";

declare var UIkit: any;

@Component({
  selector: 'app-new-service-provider',
  templateUrl: './service-provider-form.component.html',
  styleUrls: ['./service-provider-form.component.css'],
  providers: [FormControlService]
})
export class ServiceProviderFormComponent implements OnInit {
  @ViewChild(SurveyComponent) child: SurveyComponent
  model: Model = null;
  vocabulariesMap: Map<string, object[]> = null;
  subVocabulariesMap: Map<string, object[]> = null;
  payloadAnswer: object = null;
  formDataToSubmit: any = null;

  protected readonly isDevMode = isDevMode;
  protected readonly environment = environment;
  _hasUserConsent = environment.hasUserConsent;
  serviceORresource = environment.serviceORresource;
  projectName = environment.projectName;
  projectMail = environment.projectMail;
  privacyPolicyURL = environment.privacyPolicyURL;
  catalogueId: string = environment.CATALOGUE;
  providerId: string = null;
  displayedCatalogueName: string;
  providerName = '';
  errorMessage = '';
  userInfo = {sub:'', family_name: '', given_name: '', email: ''};
  vocabularies: Map<string, Vocabulary[]> = null;
  subVocabularies: Map<string, Vocabulary[]> = null;
  submitMode: 'draft' | 'submit' = 'submit';
  edit = false;
  hasChanges = false;
  pendingProvider = false;
  saveAsDraftAvailable = false;
  disable = false;
  showLoader = false;
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

  placesVocabulary: Vocabulary[] = null;
  providerTypeVocabulary: Vocabulary[] = null;
  providerLCSVocabulary: Vocabulary[] = null;
  domainsVocabulary: Vocabulary[] = null;
  categoriesVocabulary: Vocabulary[] = null;
  merilDomainsVocabulary: Vocabulary[] = null;
  merilCategoriesVocabulary: Vocabulary[] = null;
  esfriDomainVocabulary: Vocabulary[] = null;
  legalStatusVocabulary: Vocabulary[] = null;
  esfriVocabulary: Vocabulary[] = null;
  areasOfActivityVocabulary: Vocabulary[] = null;
  networksVocabulary: Vocabulary[] = null;
  societalGrandChallengesVocabulary: Vocabulary[] = null;
  hostingLegalEntityVocabulary: Vocabulary[] = null;
  nodeVocabulary: Vocabulary[] = null;

  constructor(public fb: UntypedFormBuilder,
              public authService: AuthenticationService,
              public serviceProviderService: ServiceProviderService,
              public resourceService: ResourceService,
              public catalogueService: CatalogueService,
              public router: Router,
              public route: ActivatedRoute,
              public navigator: NavigationService,
              public pidHandler: pidHandler,
              public dynamicFormService: FormControlService) {
  }

  ngOnInit() {
    this.showLoader = true;

    this.serviceProviderService.getFormModelById('m-b-provider').subscribe(
      res => this.model = res,
      err => console.log(err),
      () => {
        if (!this.edit) { //prefill field(s)
          const currentUser = this.getCurrentUserInfo();
          this.payloadAnswer = {
            'answer': {
              Provider: {
                'catalogueId': environment.CATALOGUE,
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
    // if (path.includes('view/:providerId')) {
    //   this.pendingProvider = true;
    // }
    if ( !this.router.url.includes('/update/') ) {
      this.saveAsDraftAvailable = true;
    }
    this.setVocabularies();

    if (this._hasUserConsent && path !== 'view/:catalogueId/:providerId') {
      if (this.edit) {
        this.serviceProviderService.hasAdminAcceptedTerms(this.providerId, this.pendingProvider).subscribe(
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

    if(this.catalogueId == environment.CATALOGUE) this.displayedCatalogueName = `| Catalogue: ${environment.projectName}`
    else if(this.catalogueId) this.showCatalogueName(this.catalogueId)

    this.vocabularyEntryForm = this.fb.group(this.suggestionsForm);
  }

  submitForm(value: any){
    let providerValue = value[0].value.Provider;
    window.scrollTo(0, 0);

    this.errorMessage = '';
    // this.trimFormWhiteSpaces();
    const path = this.route.snapshot.routeConfig.path;
    let method;
    if (path === 'add/:providerId') {
      method = 'updateAndPublishPendingProvider';
    } else {
      method = this.edit ? 'updateServiceProvider' : 'createNewServiceProvider';
    }

    this.cleanArrayProperty(providerValue, 'multimedia');
    this.cleanArrayProperty(providerValue, 'scientificDomains');
    this.cleanArrayProperty(providerValue, 'merilScientificDomains');
    // console.log(providerValue);

    if (this.submitMode === 'draft') {
      this.showLoader = true;
      this.serviceProviderService.temporarySaveProvider(providerValue, (path !== 'provider/add/:providerId' && this.edit))
        .subscribe(
          res => {
            this.showLoader = false;
            this.router.navigate([`/provider/add/${this.pidHandler.customEncodeURIComponent(res.id)}`]);
          },
          err => {
            this.showLoader = false;
            this.errorMessage = 'Something went wrong. ' + JSON.stringify(err.error.message);
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
          this.errorMessage = 'Something went wrong. ' + JSON.stringify(err.error.message);
        },
        () => {
          this.showLoader = false;
          this.router.navigate(['/provider/my']);
        }
      );
    }
  }

  /** get and set vocabularies **/
  setVocabularies() {
    zip(
      this.resourceService.getAllVocabulariesByType(),
      this.resourceService.getProvidersAsVocs(this.catalogueId ? this.catalogueId : environment.CATALOGUE)
    ).subscribe(data => {
      this.vocabularies = <Map<string, Vocabulary[]>>data[0]; //old
      this.vocabulariesMap = data[0];
      let subVocs: Vocabulary[] = this.vocabulariesMap['SCIENTIFIC_SUBDOMAIN'].concat(this.vocabulariesMap['PROVIDER_MERIL_SCIENTIFIC_SUBDOMAIN']);
      this.subVocabulariesMap = this.groupByKey(subVocs, 'parentId');
      Object.keys(data[1]).forEach(key => {
        const newItems = data[1][key];
        const existingItems = this.vocabulariesMap[key] || [];
        this.vocabulariesMap[key] = [...existingItems, ...newItems];
      });
    },
      error => {
        this.errorMessage = 'Error during vocabularies loading.';
      },
      () => this.showLoader = false
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
    }
    this.checkTerms();
  }

  checkTerms() {
    this.agreedToTerms = this.privacyPolicy && this.authorizedRepresentative;
  }

  acceptTerms() {
    if (this._hasUserConsent && this.edit) {
      this.serviceProviderService.adminAcceptedTerms(this.providerId, this.pendingProvider).subscribe(
        res => {},
        error => { console.log(error); },
        () => {}
      );
    }
  }

  /** <--Terms Modal **/

  /** Submit Comment Modal--> **/
  showCommentModal(formData: any) {
    if (this.edit && !this.pendingProvider) {
      this.formDataToSubmit = formData;
      UIkit.modal('#commentModal').show();
    } else {
      this.submitForm(formData);
    }
  }

  /** <--Submit Comment Modal **/

  /*submitSuggestion(entryValueName, vocabulary, parent) {
    if (entryValueName.trim() !== '') {
      this.serviceProviderService.submitVocabularyEntry(entryValueName, vocabulary, parent, 'provider', this.providerId, null).subscribe(
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

  showCatalogueName(catalogueId: string) {
    this.catalogueService.getCatalogueById(catalogueId).subscribe(
      catalogue => this.displayedCatalogueName = `| Catalogue: ${catalogue.name}`,
      error => console.log(error)
    );
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
