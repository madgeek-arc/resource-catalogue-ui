import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Subscription, Observable} from 'rxjs';
import {Service, LoggingInfo} from '../../../../domain/eic-model';
import {NavigationService} from '../../../../services/navigation.service';
import {ResourceService} from '../../../../services/resource.service';
import {Paging} from '../../../../domain/paging';
import {zip} from 'rxjs';
import {environment} from '../../../../../environments/environment';

@Component({
  selector: 'app-service-dashboard',
  templateUrl: './service-full-history.component.html',
  styleUrls: ['./service-stats.component.css']
})
export class ServiceFullHistoryComponent implements OnInit, OnDestroy {

  serviceORresource = environment.serviceORresource;
  projectName = environment.projectName;

  public service: Service;
  public errorMessage: string;
  private sub: Subscription;

  serviceHistory: Paging<LoggingInfo>;

  constructor(private route: ActivatedRoute, private router: NavigationService, private resourceService: ResourceService) {
  }

  ngOnInit() {
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
            this.router.go('/404');
          }
          this.errorMessage = 'An error occurred while retrieving data for this service. ' + err.error;
        }
      );
    });
  }

  getDataForService() {
    this.resourceService.getServiceLoggingInfoHistory(this.service.id).subscribe(
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
}
