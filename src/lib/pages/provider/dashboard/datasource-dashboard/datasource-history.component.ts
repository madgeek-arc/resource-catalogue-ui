import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Subscription, zip} from 'rxjs';
import {Datasource, LoggingInfo, Service} from '../../../../domain/eic-model';
import {NavigationService} from '../../../../services/navigation.service';
import {ResourceService} from '../../../../services/resource.service';
import {Paging} from '../../../../domain/paging';
import {environment} from '../../../../../environments/environment';
import {DatasourceService} from "../../../../services/datasource.service";

@Component({
  selector: 'app-datasource-history',
  templateUrl: './datasource-history.component.html',
  styleUrls: ['../resource-dashboard/service-stats.component.css']
})

export class DatasourceHistoryComponent implements OnInit, OnDestroy {
// export class DatasourceHistoryComponent {

  serviceORresource = environment.serviceORresource;
  projectName = environment.projectName;

  public catalogueId: string;
  public datasource: Datasource;
  public errorMessage: string;
  private sub: Subscription;

  datasourceHistory: Paging<LoggingInfo>;

  constructor(private route: ActivatedRoute, private router: NavigationService, private resourceService: ResourceService, private datasourceService: DatasourceService) {
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
          this.errorMessage = 'An error occurred while retrieving data for this datasource. ' + err.error;
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
