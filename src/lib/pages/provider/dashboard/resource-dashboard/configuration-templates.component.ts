import {Component, Injector, OnInit, ViewChild, isDevMode, ViewChildren, QueryList} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {environment} from '../../../../../environments/environment';
import {InteroperabilityRecord, ResourceInteroperabilityRecord} from "../../../../domain/eic-model";
import {AuthenticationService} from "../../../../services/authentication.service";
import {ServiceProviderService} from "../../../../services/service-provider.service";
import {GuidelinesService} from "../../../../services/guidelines.service";
import {SurveyComponent} from "../../../../../dynamic-catalogue/pages/dynamic-form/survey.component";
import {Model} from "../../../../../dynamic-catalogue/domain/dynamic-form-model";
import {FormGroup} from "@angular/forms";
import { forkJoin, of } from 'rxjs';
import {catchError, switchMap, map, finalize} from 'rxjs/operators';
import {ServiceExtensionsService} from "../../../../services/service-extensions.service";

@Component({
  selector: 'app-monitoring-info',
  templateUrl: './configuration-templates.component.html'
})

export class ConfigurationTemplatesComponent implements OnInit {
  @ViewChildren('survey') children!: QueryList<SurveyComponent>;
  model: Model = null;
  vocabulariesMap: Map<string, object[]> = null;
  subVocabulariesMap: Map<string, object[]> = null;
  payloadAnswer: object = null;
  templates: any = null; // stores templates found for a specific guideline
  formModels: Record<string, any> = {}; // stores each template's form model
  answersByTemplateId: { [templateId: string]: any } = {}; // Store answers by template ID

  protected readonly isDevMode = isDevMode;

  serviceORresource = environment.serviceORresource;
  // projectMail = environment.projectMail;
  showLoader = false;
  ready = false;
  hasChanges = false;
  serviceId: string = null;
  guidelineId: string = null;
  currentResourceGuideline: InteroperabilityRecord;
  displayMessage = '';
  errorMessage = '';
  loadingMessage = '';
  saveMessageMap: { [templateId: string]: string } = {};

  constructor(protected injector: Injector,
              protected authenticationService: AuthenticationService,
              protected serviceProviderService: ServiceProviderService,
              protected guidelinesService: GuidelinesService,
              protected serviceExtensionsService: ServiceExtensionsService,
              protected route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.guidelineId = params['guidelineId'];
      this.ngOnInitWorkaround();
    });
  }

  ngOnInitWorkaround() {
    this.resetVariables();
    this.getServiceTypesAndSetVocabulariesMap();
    this.serviceId = this.route.parent.snapshot.paramMap.get('resourceId');
    this.showLoader = true;

    this.guidelinesService.getInteroperabilityRecordById(this.guidelineId).subscribe(
      res => this.currentResourceGuideline = res,
      err => console.log(err)
    )

    this.guidelinesService.getTemplatesForGuideline(this.guidelineId).pipe(
      switchMap(response => {
        if (!response.results?.length) {
          this.displayMessage = 'No templates found for this guideline.';
          return of([]); // early exit: no templates
        }

        this.templates = response.results;
        this.displayMessage = '';

        const templateIds = this.templates.map(t => t.id);
        const modelIds = templateIds.map(id => this.transformToModelId(id));

        const allTemplateCalls = modelIds.map((modelId, index) => {
          const templateId = templateIds[index];

          // 1. Fetch the form model
          return this.serviceProviderService.getFormModelById(modelId).pipe(
            catchError(err => {
              console.error(`Model fetch error for ${modelId}`, err);
              this.formModels[templateId] = null;
              return of(null); // Continue chain with null
            }),
            switchMap(model => {
              this.formModels[templateId] = model;

              if (!model) {
                return of(null); // Skip instance fetch if model failed
              }

              // 2. Fetch the instance
              return this.guidelinesService.getInstanceOfTemplate(this.serviceId, templateId).pipe(
                catchError(err => {
                  console.error(`Instance fetch error for ${templateId}`, err);
                  return of(null);
                }),
                map(instance => {
                  if (instance?.id) {
                    this.answersByTemplateId[templateId] = this.getAnswerForTemplate(instance);
                    this.payloadAnswer = { answer: { ConfigurationTemplate: instance } };
                  } else {
                    // create empty payload if no instance returned
                    this.answersByTemplateId[templateId] = {
                      'answer': {
                        ConfigurationTemplate: {
                          resourceId: decodeURIComponent(this.serviceId),
                          configurationTemplateId: modelId.split("-").slice(2).join("/"),
                          catalogueId: environment.CATALOGUE
                        }
                      }
                    };
                  }

                  return true; // Success marker
                })
              );
            })
          );
        });

        // Wait for all model + instance pairs to complete
        return forkJoin(allTemplateCalls);
      }),
      finalize(() => {
        this.showLoader = false; // fallback guarantee
      })
    ).subscribe({
      next: () => {
        this.ready = true; // ready to render forms
        this.showLoader = false;
        console.log('All templates and instances processed.');
      },
      error: (err) => {
        console.error('Unhandled error during initialization', err);
        this.ready = true; // still mark as ready to avoid hanging
        this.showLoader = false;
      }
    });
  }

  transformToModelId(templateId: string): string {
      return 'm-b-' + templateId.replace('/', '-');
    }

  resetVariables() {
    this.ready = false;
    this.hasChanges = false;
    this.currentResourceGuideline = null;
    this.displayMessage = '';
    this.errorMessage = '';
    this.templates = null;
    this.formModels = {};
    this.answersByTemplateId = {};
  }

  getAnswerForTemplate(instance): any {
    return { answer: { ConfigurationTemplate: instance } };
  }

  saveForm(submittedEvent: any, templateId: string): void {
    let myFormGroup: FormGroup = submittedEvent[0];
    const ctiValue = submittedEvent[0].value.ConfigurationTemplate;
    const isUpdate = !!ctiValue.id;

    this.guidelinesService.saveConfigurationTemplateInstance(ctiValue).subscribe({
      next: (savedInstance) => {
        myFormGroup.patchValue({ConfigurationTemplate: savedInstance}); // fill the form with the response because the id in now generated
        this.saveMessageMap[templateId] = isUpdate ? 'Updated successfully!' : 'Saved successfully!';
        setTimeout(() => this.saveMessageMap[templateId] = '', 3000);
      },
      error: (err) => {
        this.saveMessageMap[templateId] = isUpdate ? 'Update failed.' : 'Save failed.';
        setTimeout(() => this.saveMessageMap[templateId] = '', 3000);
        console.error(`Failed to save template instance for ${templateId}`, err);
      }
    });
  }

  getServiceTypesAndSetVocabulariesMap() { // adds Vocabulary for Monitoring
    this.serviceExtensionsService.getServiceTypes().subscribe(
      res => {
        const map: { [name: string]: { id: string, name: string }[];  } = {'serviceTypesVoc': []};
        res.forEach(item => {
          map['serviceTypesVoc'].push({id: item.id, name: item.name})
        })
        this.vocabulariesMap = <Map<string, object[]>><unknown>map;
      },
      error => console.log('getServiceTypes error:', JSON.stringify(error.error))
    );
  }

}
