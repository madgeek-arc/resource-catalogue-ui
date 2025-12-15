import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Subscription, zip} from 'rxjs';
import {LoggingInfo, Service, TrainingResource} from '../../../../domain/eic-model';
import {NavigationService} from '../../../../services/navigation.service';
import {ResourceService} from '../../../../services/resource.service';
import {Paging} from '../../../../domain/paging';
import {environment} from '../../../../../environments/environment';
import {TrainingResourceService} from "../../../../services/training-resource.service";
import {pidHandler} from "../../../../shared/pid-handler/pid-handler.service";

@Component({
    selector: 'app-training-resource-history',
    templateUrl: './training-resource-history.component.html',
    styleUrls: ['../resource-dashboard/service-stats.component.css'],
    standalone: false
})

export class TrainingResourceHistoryComponent implements OnInit, OnDestroy {

  serviceORresource = environment.serviceORresource;

  public catalogueId: string;
  public trainingResource: TrainingResource;
  public errorMessage: string;
  private sub: Subscription;
  public pidHandler: pidHandler;

  trainingResourceHistory: LoggingInfo[];

  constructor(private route: ActivatedRoute, private navigator: NavigationService, private resourceService: ResourceService, private trainingResourceService: TrainingResourceService) {
  }

  ngOnInit() {
    this.catalogueId = window.location.href.split('dashboard/')[1].split('/')[0];
    // this.sub = this.route.params.subscribe(params => {
    this.sub = this.route.parent.params.subscribe(params => {
      zip(
        this.trainingResourceService.getService(params['trainingResourceId'], params['catalogueId'])
      ).subscribe(suc => {
          this.trainingResource = <TrainingResource>suc[0];
          this.getDataForTrainingResource();

        },
        err => {
          if (err.status === 404) {
            this.navigator.go('/404');
          }
          this.errorMessage = 'An error occurred while retrieving data for this training resource. ' + err.error;
        }
      );
    });
  }

  getDataForTrainingResource() {
    this.trainingResourceService.getServiceLoggingInfoHistory(this.trainingResource.id, this.catalogueId).subscribe(
      res => this.trainingResourceHistory = res,
      err => {
        this.errorMessage = 'An error occurred while retrieving the history of this training resource. ' + err.error;
      }
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  handleError(error) {
    this.errorMessage = 'System error retrieving training resource (Server responded: ' + error + ')';
  }

}
