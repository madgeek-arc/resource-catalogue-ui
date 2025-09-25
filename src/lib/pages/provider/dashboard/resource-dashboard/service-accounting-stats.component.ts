import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {forkJoin, Subscription} from 'rxjs';
import {ResourceService} from '../../../../services/resource.service';
import {AccountingStatsService} from "../../../../services/accounting-stats.service";
import {Service} from "../../../../domain/eic-model";


@Component({
  selector: 'app-service-accounting-stats',
  templateUrl: './service-accounting-stats.component.html'
})

export class ServiceAccountingStatsComponent implements OnInit {

  service: Service;
  loadingMessage: string = '';
  errorMessage: string;
  noDataMessage: string = '';
  private sub: Subscription;
  metricList: any[] = [];

  constructor(private route: ActivatedRoute,
              private resourceService: ResourceService,
              private accountingStatsService: AccountingStatsService) {
  }

  ngOnInit() {
    this.sub = this.route.parent.params.subscribe(params => {
      const resourceId = params['resourceId'];
      const catalogueId = params['catalogueId'];

      forkJoin({
        stats: this.accountingStatsService.getAccountingStatsForService(resourceId),
        service: this.resourceService.getService(resourceId, catalogueId)
      }).subscribe({
        next: ({ stats, service }) => {
          this.service = service;
          this.metricList = stats?.data || [];
        },
        error: (err) => {
          this.errorMessage = 'An error occurred while retrieving data for this service. ' + err.error;
        },
        complete: () => {
          if (this.metricList.length === 0) { this.noDataMessage = 'No data available for this service.' }
        }
      });
    });
  }

  getColor(metricName: string): string {
    let hash = 0;
    for (let i = 0; i < metricName.length; i++) {
      hash = metricName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 70%)`;
  }

}
