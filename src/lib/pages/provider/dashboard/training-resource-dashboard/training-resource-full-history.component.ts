import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Subscription, Observable} from 'rxjs';
import {Service, LoggingInfo, TrainingResource} from '../../../../domain/eic-model';
import {NavigationService} from '../../../../services/navigation.service';
import {Paging} from '../../../../domain/paging';
import {zip} from 'rxjs';
import {environment} from '../../../../../environments/environment';
import {TrainingResourceService} from "../../../../services/training-resource.service";

@Component({
  selector: 'app-training-resource-full-history',
  templateUrl: './training-resource-full-history.component.html',
  styleUrls: ['../resource-dashboard/service-stats.component.css']
})

export class TrainingResourceFullHistoryComponent implements OnInit, OnDestroy {

  projectName = environment.projectName;

  public catalogueId: string;
  public trainingResource: TrainingResource;
  public errorMessage: string;
  private sub: Subscription;

  trainingResourceHistory: Paging<LoggingInfo>;

  constructor(private route: ActivatedRoute, private router: NavigationService, private trainingResourceService: TrainingResourceService) {
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
            this.router.go('/404');
          }
          this.errorMessage = 'An error occurred while retrieving data for this service. ' + err.error;
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
