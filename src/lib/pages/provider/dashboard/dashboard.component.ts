import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AuthenticationService} from '../../../services/authentication.service';
import {NavigationService} from '../../../services/navigation.service';
import {ResourceService} from '../../../services/resource.service';
import {ConfigService} from "../../../services/config.service";
import {environment} from '../../../../environments/environment';
import {ServiceProviderService} from '../../../services/service-provider.service';
import {ProviderBundle} from '../../../domain/eic-model';
import {pidHandler} from '../../../shared/pid-handler/pid-handler.service';

declare let UIkit: any;

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    standalone: false
})
export class DashboardComponent implements OnInit {

  showResourcesSubmenu = false;
  showAddNewSubmenu = false;
  showAddFirstSubmenu = false;

  // the resource types an Organisation adds from the dashboard; policyType is the name the back end uses
  // for the type in the onboarding policy (GET /config)
  readonly addableResources = [
    {policyType: 'service', label: environment.serviceORresource, firstRoute: 'add-first-service/', newRoute: 'resource/add/'},
    {policyType: 'datasource', label: 'Datasource', firstRoute: 'datasource/select-first/', newRoute: 'datasource/select/'},
    {policyType: 'training_resource', label: 'Training Resource', firstRoute: 'add-first-training-resource/', newRoute: 'training-resource/add/'},
    {policyType: 'deployable_application', label: 'Deployable Application', firstRoute: 'add-first-deployable-service/', newRoute: 'deployable-service/add/'},
    {policyType: 'adapter', label: 'Adapter', firstRoute: 'adapter/add/', newRoute: 'adapter/add/'},
    {policyType: 'interoperability_record', label: 'Guideline', firstRoute: null, newRoute: null}
  ];

  catalogueId: string;
  providerId: string;
  providerStatus: string;
  providerBundle: ProviderBundle;
  serviceORresource = environment.serviceORresource;
  protected readonly environment = environment;

  constructor(public authenticationService: AuthenticationService,
              public resourceService: ResourceService,
              public serviceProviderService: ServiceProviderService,
              public navigator: NavigationService,
              private route: ActivatedRoute,
              public pidHandler: pidHandler,
              public config: ConfigService) {
  }

  ngOnInit() {
    // this.activeTab = this.route.firstChild.snapshot.routeConfig.path;
    this.providerId = this.route.snapshot.paramMap.get('provider');
    this.getProvider();
  }

  getProvider() {
    this.serviceProviderService.getServiceProviderBundleById(this.providerId).subscribe(
      providerBundle => {
        this.providerBundle = providerBundle,
        this.catalogueId = this.providerBundle.catalogueId;
        console.log('catalogueId:', this.catalogueId);
      },
      error =>  console.log(error),
      () => this.providerStatus = this.providerBundle.status
    );
  }

  /**
   * Whether the Organisation can submit the given type as its first resource, which the back end reviews as the
   * Organisation's template. Only types with the 'review-first' policy have a template.
   */
  canAddFirst(policyType: string): boolean {
    return this.providerBundle?.status === 'approved' && this.config.isReviewFirst(policyType) &&
      (this.providerBundle.templateStatus === 'no template status' || this.providerBundle.templateStatus === 'rejected template');
  }

  /**
   * Whether the Organisation can add one more resource of the given type: any approved Organisation for the types
   * that are not 'review-first', and only after the template is approved for the types that are.
   */
  canAddNew(policyType: string): boolean {
    return this.providerBundle?.status === 'approved' &&
      (!this.config.isReviewFirst(policyType) || this.providerBundle.templateStatus === 'approved template');
  }

  anyCanAddFirst(): boolean {
    return this.addableResources.some(r => this.canAddFirst(r.policyType));
  }

  anyCanAddNew(): boolean {
    return this.addableResources.some(r => this.canAddNew(r.policyType));
  }

  addFirstLink(r: {policyType: string, firstRoute: string}): any[] {
    return r.policyType === 'interoperability_record' ? ['/guidelines/' + this.providerId + '/add/'] :
      ['/provider/' + (r.policyType === 'adapter' ? this.providerId : this.pidHandler.customEncodeURIComponent(this.providerId)) + '/' + r.firstRoute];
  }

  addNewLink(r: {policyType: string, newRoute: string}): any[] {
    return r.policyType === 'interoperability_record' ? ['/guidelines/' + this.providerId + '/add/'] :
      ['/provider/' + this.providerId + '/' + r.newRoute];
  }

  showRequestDeletionModal() {
      UIkit.modal('#requestDeletionModal').show();
  }

  requestProviderDeletion(providerId) {
    this.serviceProviderService.requestProviderDeletion(providerId)
      .subscribe(
        res => {
          UIkit.modal('#requestDeletionModal').hide();
        },
        err => {
          UIkit.modal('#requestDeletionModal').hide();
          console.log(err);
        },
        () => {}
      );
  }

  showPendingNotification(): void {
    UIkit.notification({
      message: 'Disabled until provider gets approved.',
      status: 'warning',
      pos: 'bottom-right',
      timeout: 3000
    });
  }

}
