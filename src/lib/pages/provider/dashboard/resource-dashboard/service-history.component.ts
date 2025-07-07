import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Subscription, zip} from 'rxjs';
import {LoggingInfo, Service} from '../../../../domain/eic-model';
import {NavigationService} from '../../../../services/navigation.service';
import {ResourceService} from '../../../../services/resource.service';
import {Paging} from '../../../../domain/paging';
import {environment} from '../../../../../environments/environment';
import {pidHandler} from "../../../../shared/pid-handler/pid-handler.service";

@Component({
  selector: 'app-service-history',
  templateUrl: './service-history.component.html',
  styleUrls: ['./service-stats.component.css']
})
export class ServiceHistoryComponent implements OnInit, OnDestroy {

  serviceORresource = environment.serviceORresource;
  projectName = environment.projectName;

  public catalogueId: string;
  public service: Service;
  public errorMessage: string;
  private sub: Subscription;
  public pidHandler: pidHandler;

  serviceHistory: Paging<LoggingInfo>;

  constructor(private route: ActivatedRoute, private navigator: NavigationService, private resourceService: ResourceService) {
  }

  ngOnInit() {
    this.catalogueId = window.location.href.split('dashboard/')[1].split('/')[0];
    // this.sub = this.route.params.subscribe(params => {
    this.sub = this.route.parent.params.subscribe(params => {
      zip(
        this.resourceService.getService(params['resourceId'], params['catalogueId'])
      ).subscribe(suc => {
          this.service = <Service>suc[0];
          this.getDataForService();

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

  getDataForService() {
    this.resourceService.getServiceLoggingInfoHistory(this.service.id, this.catalogueId).subscribe(
      res => this.serviceHistory = res,
      err => {
        this.errorMessage = 'An error occurred while retrieving the history of this service. ' + err.error;
      }
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  handleError(error) {
    this.errorMessage = 'System error retrieving service (Server responded: ' + error + ')';
  }

  protected readonly encodeURIComponent = encodeURIComponent;
}
