import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Subscription, zip} from 'rxjs';
import {DeployableService, LoggingInfo} from '../../../../domain/eic-model';
import {NavigationService} from '../../../../services/navigation.service';
import {Paging} from '../../../../domain/paging';
import {environment} from '../../../../../environments/environment';
import {pidHandler} from "../../../../shared/pid-handler/pid-handler.service";
import {DeployableServiceService} from "../../../../services/deployable-service.service";

@Component({
    selector: 'app-deployable-service-history',
    templateUrl: './deployable-service-history.component.html',
    styleUrls: ['../resource-dashboard/service-stats.component.css'],
    standalone: false
})

export class DeployableServiceHistoryComponent implements OnInit, OnDestroy {

  serviceORresource = environment.serviceORresource;

  public catalogueId: string;
  public deployableService: DeployableService;
  public errorMessage: string;
  private sub: Subscription;
  public pidHandler: pidHandler;

  deployableServiceHistory: Paging<LoggingInfo>;

  constructor(private route: ActivatedRoute,
              private navigator: NavigationService,
              private deployableServiceService: DeployableServiceService) {
  }

  ngOnInit() {
    this.catalogueId = window.location.href.split('dashboard/')[1].split('/')[0];
    // this.sub = this.route.params.subscribe(params => {
    this.sub = this.route.parent.params.subscribe(params => {
      zip(
        this.deployableServiceService.getService(params['deployableServiceId'], params['catalogueId'])
      ).subscribe(suc => {
          this.deployableService = <DeployableService>suc[0];
          this.getDataForDeployableService();

        },
        err => {
          if (err.status === 404) {
            this.navigator.go('/404');
          }
          this.errorMessage = 'An error occurred while retrieving data for this deployable service. ' + err.error;
        }
      );
    });
  }

  getDataForDeployableService() {
    this.deployableServiceService.getServiceLoggingInfoHistory(this.deployableService.id, this.catalogueId).subscribe(
      res => this.deployableServiceHistory = res,
      err => {
        this.errorMessage = 'An error occurred while retrieving the history of this deployable service. ' + err.error;
      }
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  handleError(error) {
    this.errorMessage = 'System error retrieving deployable service (Server responded: ' + error + ')';
  }

}
