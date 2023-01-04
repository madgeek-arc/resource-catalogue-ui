import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Subscription, Observable} from 'rxjs';
import {Service, Datasource, LoggingInfo} from '../../../../domain/eic-model';
import {NavigationService} from '../../../../services/navigation.service';
import {ResourceService} from '../../../../services/resource.service';
import {Paging} from '../../../../domain/paging';
import {zip} from 'rxjs';
import {environment} from '../../../../../environments/environment';
import {DatasourceService} from "../../../../services/datasource.service";

@Component({
  selector: 'app-datasource-full-history',
  templateUrl: './datasource-full-history.component.html',
  styleUrls: ['../resource-dashboard/service-stats.component.css']
})

export class DatasourceFullHistoryComponent implements OnInit, OnDestroy {

  projectName = environment.projectName;

  public catalogueId: string;
  public datasource: Datasource;
  public errorMessage: string;
  private sub: Subscription;

  datasourceHistory: Paging<LoggingInfo>;

  constructor(private route: ActivatedRoute, private router: NavigationService, private datasourceService: DatasourceService) {
  }

  ngOnInit() {
    this.catalogueId = window.location.href.split('dashboard/')[1].split('/')[0];
    // this.sub = this.route.params.subscribe(params => {
    this.sub = this.route.parent.params.subscribe(params => {
      zip(
        this.datasourceService.getDatasource(params['datasourceId'], params['catalogueId'])
      ).subscribe(suc => {
          this.datasource = <Datasource>suc[0];
          this.getDataForDatasource();

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

  getDataForDatasource() {
    this.datasourceService.getDatasourceLoggingInfoHistory(this.datasource.id).subscribe(
      res => this.datasourceHistory = res,
      err => {
        this.errorMessage = 'An error occurred while retrieving the history of this datasource. ' + err.error;
      }
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  handleError(error) {
    this.errorMessage = 'System error retrieving datasource (Server responded: ' + error + ')';
  }
}
