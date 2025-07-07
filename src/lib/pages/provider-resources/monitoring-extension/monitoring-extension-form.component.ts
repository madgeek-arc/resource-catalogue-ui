import {UntypedFormArray, UntypedFormBuilder, FormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {Component, Injector, OnInit, ViewChild} from '@angular/core';
import {AuthenticationService} from '../../../services/authentication.service';
import {NavigationService} from '../../../services/navigation.service';
import {ResourceService} from '../../../services/resource.service';
import {ServiceExtensionsService} from '../../../services/service-extensions.service';
import {Provider, Service, Type, Monitoring, Vocabulary} from '../../../domain/eic-model';
import {Paging} from '../../../domain/paging';
import {URLValidator} from '../../../shared/validators/generic.validator';
import {environment} from '../../../../environments/environment';
import {ActivatedRoute} from '@angular/router';
import {ServiceProviderService} from '../../../services/service-provider.service';
import {Model} from "../../../../dynamic-catalogue/domain/dynamic-form-model";
import {FormControlService} from "../../../../dynamic-catalogue/services/form-control.service";
import {SurveyComponent} from "../../../../dynamic-catalogue/pages/dynamic-form/survey.component";
import {zip} from "rxjs";

@Component({
  selector: 'app-resource-monitoring-extension-form',
  templateUrl: './monitoring-extension-form.component.html',
  styleUrls: ['../../provider/service-provider-form.component.css'],
  providers: [FormControlService]
})
export class MonitoringExtensionFormComponent implements OnInit {
  @ViewChild(SurveyComponent) child: SurveyComponent
  model: Model = null;
  vocabulariesMap: Map<string, object[]> = null;
  // vocabulariesMap: { [name: string]: { id: string, name: string }[]; } = {}
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
  monitoring: Monitoring;
  typeDescriptions = [];
  errorMessage = '';
  successMessage: string = null;
  weights: string[] = [];
  tabs: boolean[] = [false];
  fb: UntypedFormBuilder = this.injector.get(UntypedFormBuilder);
  disable = false;
  isPortalAdmin = false;
  providerId: string = null;
  serviceId: string = null; //filled for all types (service, training)
  resourceType = '';
  //only one of these 2 ids will be filled from URL
  resourceId: string = null;
  trainingResourceId: string = null;

  providersPage: Paging<Provider>;
  resourceService: ResourceService = this.injector.get(ResourceService);
  serviceExtensionsService: ServiceExtensionsService = this.injector.get(ServiceExtensionsService);
  navigator: NavigationService = this.injector.get(NavigationService);

  constructor(protected injector: Injector,
              protected authenticationService: AuthenticationService,
              protected serviceProviderService: ServiceProviderService,
              protected route: ActivatedRoute,
              public formService: FormControlService
  ) {
    this.resourceService = this.injector.get(ResourceService);
    this.fb = this.injector.get(UntypedFormBuilder);
    this.navigator = this.injector.get(NavigationService);
    this.weights[0] = this.authenticationService.user.email.split('@')[0];
  }

  submitForm(value) {
    window.scrollTo(0, 0);
    if (!value[0].value.Monitoring.serviceId) value[0].value.Monitoring.serviceId = decodeURIComponent(this.serviceId);
    this.serviceExtensionsService.uploadMonitoringService(value[0].value.Monitoring, this.editMode, 'eosc', this.resourceType).subscribe(
      _service => {
        this.showLoader = false;
        if (this.resourceType==='service') return this.navigator.resourceDashboard(this.providerId, this.serviceId); // navigate to resource-dashboard
        if (this.resourceType==='training_resource') return this.navigator.trainingResourceDashboard(this.providerId, this.serviceId); // navigate to training-resource-dashboard
      },
      err => {
        this.showLoader = false;
        window.scrollTo(0, 0);
        console.log(err);
        this.errorMessage = 'Something went bad, server responded: ' + JSON.stringify(err.error);
      }
    );
  }

  ngOnInit() {
    this.getIdsFromCurrentPath();

    this.getServiceTypesAndNode();

    this.serviceProviderService.getFormModelById('m-b-monitoring').subscribe(
      res => this.model = res,
      err => console.log(err)
    )

    this.serviceExtensionsService.getMonitoringByServiceId(this.serviceId).subscribe(
      res => { if(res!=null) {
        this.monitoring = res;
        this.editMode = true;
        this.payloadAnswer = {'answer': {Monitoring: res}};
        }
      },
      err => { console.log(err); }
    );
  }

  getIdsFromCurrentPath(){
    if (this.route.snapshot.paramMap.get('providerId')) {
      this.providerId = this.route.snapshot.paramMap.get('providerId');
    }
    if (this.route.snapshot.paramMap.get('resourceId')) {
      this.serviceId = this.route.snapshot.paramMap.get('resourceId');
      this.resourceType = 'service';
    }
    if (this.route.snapshot.paramMap.get('trainingResourceId')) {
      this.serviceId = this.route.snapshot.paramMap.get('trainingResourceId');
      this.resourceType = 'training_resource';
    }
  }

  getServiceTypesAndNode() {
    this.serviceExtensionsService.getServiceTypes().subscribe(
      res => {
        const map: { [name: string]: { id: string, name: string }[];  } = {'serviceTypesVoc': []};
        res.forEach(item => {
          map['serviceTypesVoc'].push({id: item.id, name: item.name})
        })
        this.vocabulariesMap = <Map<string, object[]>><unknown>map;
      },
      error => console.log('getServiceTypes error:', JSON.stringify(error.error)),
      () => {
        this.resourceService.getVocabularyByType('NODE').subscribe(
          nodeRes => {
            const vocMap = <{ [key: string]: object[] }>(<unknown>this.vocabulariesMap);
            vocMap['NODE'] = nodeRes;
            this.vocabulariesMap = <Map<string, object[]>><unknown>vocMap;
          },
          nodeErr => console.log('NODE fetch error:', JSON.stringify(nodeErr.error))
        );
      }
    );
  }

}
