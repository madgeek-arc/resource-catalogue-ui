import {UntypedFormArray, UntypedFormBuilder, FormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {Component, Injector, OnInit, ViewChild, isDevMode} from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {NavigationService} from '../../services/navigation.service';
import {ResourceService} from '../../services/resource.service';
import {Provider, Service, Type, Adapter, Vocabulary} from '../../domain/eic-model';
import {Paging} from '../../domain/paging';
import {environment} from '../../../environments/environment';
import {ActivatedRoute, Router} from '@angular/router';
import {Model} from "../../../dynamic-catalogue/domain/dynamic-form-model";
import {FormControlService} from "../../../dynamic-catalogue/services/form-control.service";
import {SurveyComponent} from "../../../dynamic-catalogue/pages/dynamic-form/survey.component";
import {zip} from "rxjs";
import {AdaptersService} from "../../services/adapters.service";

@Component({
  selector: 'app-resource-adapters-form',
  templateUrl: './adapters-form.component.html',
  styleUrls: ['../provider/service-provider-form.component.css'],
  providers: [FormControlService]
})
export class AdaptersFormComponent implements OnInit {
  @ViewChild(SurveyComponent) child: SurveyComponent
  model: Model = null;
  vocabulariesMap: Map<string, object[]> = null;
  subVocabulariesMap: Map<string, object[]> = null;
  payloadAnswer: object = null;

  serviceORresource = environment.serviceORresource;
  projectName = environment.projectName;
  projectMail = environment.projectMail;
  serviceName = '';
  firstServiceForm = false;
  showLoader = false;
  pendingService = false;
  editMode = false;
  hasChanges = false;
  serviceForm: UntypedFormGroup;
  provider: Provider;
  service: Service;
  adapter: Adapter;
  typeDescriptions = [];
  errorMessage = '';
  successMessage: string = null;
  weights: string[] = [];
  tabs: boolean[] = [false];
  fb: UntypedFormBuilder = this.injector.get(UntypedFormBuilder);
  disable = false;
  isPortalAdmin = false;
  adapterId: string = null;
  resourceType = '';
  //only one of these 2 ids will be filled from URL
  resourceId: string = null;
  trainingResourceId: string = null;

  providersPage: Paging<Provider>;
  serviceTypesVoc: any;
  resourceService: ResourceService = this.injector.get(ResourceService);
  navigator: NavigationService = this.injector.get(NavigationService);

  protected readonly isDevMode = isDevMode;

  constructor(protected injector: Injector,
              protected authenticationService: AuthenticationService,
              protected adaptersService: AdaptersService,
              protected route: ActivatedRoute,
              protected router: Router
  ) {
    this.resourceService = this.injector.get(ResourceService);
    this.fb = this.injector.get(UntypedFormBuilder);
    this.navigator = this.injector.get(NavigationService);
    this.weights[0] = this.authenticationService.user.email.split('@')[0];
  }

  submitForm(value) {
    window.scrollTo(0, 0);
    if (!value[0].value.Adapter.serviceId) value[0].value.Adapter.serviceId = decodeURIComponent(this.adapterId);
    this.adaptersService.uploadAdapter(value[0].value.Adapter, this.editMode).subscribe(
      _service => {
        this.showLoader = false;
        this.router.navigate(['/adapters/my']);
      },
      err => {
        this.showLoader = false;
        window.scrollTo(0, 0);
        console.log(err);
        this.errorMessage = 'Something went bad, server responded: ' + JSON.stringify(err.error.message);
      }
    );
  }

  ngOnInit() {
    this.showLoader = true;
    this.getIdsFromCurrentPath();
    this.getVocs();

    this.adaptersService.getFormModelById('m-b-adapter').subscribe(
      res => this.model = res,
      err => console.log(err)
    )

    if(this.adapterId){
      this.adaptersService.getAdapterById(this.adapterId).subscribe(
        res => { if(res!=null) {
          this.adapter = res;
          this.editMode = true;
          this.payloadAnswer = {'answer': {Adapter: res}};
        }
        },
        err => { console.log(err); }
      );
    }
  }

  getIdsFromCurrentPath(){
    if (this.route.snapshot.paramMap.get('adapterId')) {
      this.adapterId = this.route.snapshot.paramMap.get('adapterId');
    }
  }

  getVocs(){
    this.resourceService.getAllVocabulariesByType().subscribe(
      res => this.vocabulariesMap = res,
      err => console.log(err),
      () => {
          zip(//get vocs for linkedResource
            this.adaptersService.getLinkedGuidelinesForAdapter(),
            this.adaptersService.getLinkedServicesForAdapter()
          ).subscribe(data => {
              const unifiedResponse = {
                LINKED_RESOURCE_VOCS_UNIFIED: [
                  ...data[0].GUIDELINES_VOC,
                  ...data[1].SERVICES_VOC
                ]
              };
              let subVocs: Vocabulary[] = unifiedResponse.LINKED_RESOURCE_VOCS_UNIFIED.map(item => ({
                id: item.id,
                name: item.name,
                description: null,
                parentId: item.parentId,
                type: null,
                extras: {}
              }));
              this.subVocabulariesMap = this.groupByKey(subVocs, 'parentId');
              const vocMap = <{ [key: string]: object[] }>(<unknown>this.vocabulariesMap);
              vocMap['LINKED_RESOURCE_VOCS_UNIFIED'] = subVocs;
              this.vocabulariesMap = <Map<string, object[]>>(<unknown>vocMap);
            },
            error => {
              this.errorMessage = 'Error during vocabularies loading.';
              this.showLoader = false;
            },
            () => this.showLoader = false
          );
      }
    )
  }

  groupByKey(array, key) {
    return array.reduce((hash, obj) => {
      if (obj[key] === undefined) {
        return hash;
      }
      return Object.assign(hash, {[obj[key]]: (hash[obj[key]] || []).concat(obj)});
    }, {});
  }

}
