import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';
import {LoggingInfo, DeployableService} from '../../../../domain/eic-model';
import {NavigationService} from '../../../../services/navigation.service';
import {Paging} from '../../../../domain/paging';
import {zip} from 'rxjs';
import {environment} from '../../../../../environments/environment';
import {pidHandler} from "../../../../shared/pid-handler/pid-handler.service";
import {DeployableServiceService} from "../../../../services/deployable-service.service";

@Component({
    selector: 'app-deployable-service-full-history',
    templateUrl: './deployable-service-full-history.component.html',
    standalone: false
})

export class DeployableServiceFullHistoryComponent implements OnInit, OnDestroy {

  public deployableApplication: DeployableService;
  public errorMessage: string;
  private sub: Subscription;

  deployableServiceHistory: LoggingInfo[];

  constructor(private route: ActivatedRoute,
              private navigator: NavigationService,
              private deployableServiceService: DeployableServiceService,
              public pidHandler: pidHandler) {
  }

  ngOnInit() {
    // this.sub = this.route.params.subscribe(params => {
    this.sub = this.route.parent.params.subscribe(params => {
      zip(
        this.deployableServiceService.getService(params['deployableServiceId'])
      ).subscribe(suc => {
          this.deployableApplication = <DeployableService>suc[0];
          this.getDataForDeployableService();

        },
        err => {
          if (err.status === 404) {
            this.navigator.go('/404');
          }
          this.errorMessage = 'An error occurred while retrieving data for this service. ' + err.error;
        }
      );
    });
  }

  getDataForDeployableService() {
    this.deployableServiceService.getServiceLoggingInfoHistory(this.deployableApplication.id).subscribe(
      res => this.deployableServiceHistory = res,
      err => {
        this.errorMessage = 'An error occurred while retrieving the history of this Deployable Application. ' + err.error;
      }
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  handleError(error) {
    this.errorMessage = 'System error retrieving Deployable Application (Server responded: ' + error + ')';
  }

}
