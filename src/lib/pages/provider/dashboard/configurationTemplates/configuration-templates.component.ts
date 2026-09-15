import {Component, Injector, OnInit, ViewChild, isDevMode, ViewChildren, QueryList} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ConfigService} from "../../../../services/config.service";
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
import {pidHandler} from "../../../../shared/pid-handler/pid-handler.service";

@Component({
    selector: 'app-monitoring-info',
    templateUrl: './configuration-templates.component.html',
    standalone: false
})

export class ConfigurationTemplatesComponent implements OnInit {
  @ViewChildren('survey') children!: QueryList<SurveyComponent>;
  model: Model = null;
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
  // serviceId: string = null;
  // datasourceId: string = null;
  resourceId: string = null;
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
              protected route: ActivatedRoute,
              protected config: ConfigService,
              public pidHandler: pidHandler
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.guidelineId = params['guidelineId'];
      this.ngOnInitWorkaround();
    });
  }

  ngOnInitWorkaround() {
    this.resetVariables();
    const serviceId = this.route.parent.snapshot.paramMap.get('resourceId');
    const datasourceId = this.route.parent.snapshot.paramMap.get('datasourceId');
    this.resourceId = serviceId || datasourceId;
    this.showLoader = true;

    this.guidelinesService.getInteroperabilityRecordById(this.guidelineId, true).subscribe(
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
        // const modelIds = templateIds.map(id => this.transformToModelId(id));

        const allTemplateCalls = templateIds.map((templateId) => {

          // 1. Fetch the form model
          return this.serviceProviderService.getFormModelByConfigurationTemplateId(templateId).pipe(
              catchError(err => {
                console.error(`Model fetch error for ${templateId}`, err);
                this.formModels[templateId] = null;
                return of(null);
              }),

              switchMap(model => {
                this.formModels[templateId] = model;

                if (!model) {
                  return of(null); // Skip instance fetch if model failed
                }
                // 2. Fetch the instance
                return this.guidelinesService.getInstanceOfTemplate(this.resourceId, templateId).pipe(
                    catchError(err => {
                      console.error(`Instance fetch error for ${templateId}`, err);
                      return of(null);
                    }),

                    map(instance => {
                      if (instance?.id) {
                        this.answersByTemplateId[templateId] =
                          this.getAnswerForTemplate(instance);

                        this.payloadAnswer = {
                          answer: {
                            configurationTemplateInstance: instance
                          }
                        };
                      } else {
                        // create empty payload if no instance returned
                        this.answersByTemplateId[templateId] = {
                          answer: {
                            configurationTemplateInstance: {
                              resourceId: decodeURIComponent(this.resourceId),
                              configurationTemplateId: templateId,
                              catalogueId: null,
                              nodePID: this.config.getProperty('nodePidFixed') ? this.config.getProperty('nodePid') : null
                            }
                          }
                        };
                      }

                      return true;
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

  // transformToModelId(templateId: string): string {
  //   return 'm-b-' + templateId.replace('/', '-'); //todo: could simplify ids and remove this
  // }

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
    return { answer: { configurationTemplateInstance: instance } };
  }

  saveForm(submittedEvent: any, templateId: string): void {
    const myFormGroup: FormGroup = submittedEvent;
    const ctiValue = submittedEvent.value.configurationTemplateInstance;
    const isUpdate = !!ctiValue?.id;
    // console.log(submittedEvent.value);
    // const formValue = submittedEvent?.value;
    //
    // console.log('DEBUG formValue:', formValue);
    //
    // const ctiValue =
    //   formValue?.configurationTemplateInstance
    //   ?? formValue?.[this.formModels[templateId]?.name]?.configurationTemplateInstance;
    //
    // if (!ctiValue) {
    //   console.error('CTI VALUE IS MISSING', formValue);
    //   return;
    // }

    this.guidelinesService.saveConfigurationTemplateInstance(ctiValue).subscribe({
      next: (savedInstance) => {
        myFormGroup.patchValue({configurationTemplateInstance: savedInstance}); // fill the form with the response because the id in now generated
        this.saveMessageMap[templateId] = isUpdate ? 'Updated successfully!' : 'Saved successfully!';
        setTimeout(() => this.saveMessageMap[templateId] = '', 5000);
      },
      error: (err) => {
        this.saveMessageMap[templateId] = isUpdate ? 'Update failed. ' + + err.error.detail : 'Save failed. ' + err.error.detail;
        setTimeout(() => this.saveMessageMap[templateId] = '', 5000);
        console.error(`Failed to save template instance for ${templateId}`, err);
      }
    });
  }

}
