import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Subscription, zip} from 'rxjs';
import {Datasource, LoggingInfo} from '../../../../domain/eic-model';
import {NavigationService} from '../../../../services/navigation.service';
import {environment} from '../../../../../environments/environment';
import {pidHandler} from "../../../../shared/pid-handler/pid-handler.service";
import {DatasourceService} from "../../../../services/datasource.service";

@Component({
    selector: 'app-datasource-history',
    templateUrl: './datasource-history.component.html',
    standalone: false
})

export class DatasourceHistoryComponent implements OnInit, OnDestroy {

  serviceORresource = environment.serviceORresource;

  public datasource: Datasource;
  public errorMessage: string;
  private sub: Subscription;

  datasourceHistory: LoggingInfo[];

  constructor(private route: ActivatedRoute,
              private navigator: NavigationService,
              private datasourceService: DatasourceService,
              public pidHandler: pidHandler) {
  }

  ngOnInit() {
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
            this.navigator.go('/404');
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
