import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {forkJoin, Subscription} from 'rxjs';
import {AccountingStatsService} from "../../../../services/accounting-stats.service";
import {Provider} from "../../../../domain/eic-model";
import {ServiceProviderService} from "../../../../services/service-provider.service";

@Component({
  selector: 'app-provider-accounting-stats',
  templateUrl: './provider-accounting-stats.component.html'
})

export class ProviderAccountingStatsComponent implements OnInit {

  providerId: string;
  catalogueId: string;
  provider: Provider;
  loadingMessage: string = '';
  errorMessage: string;
  noDataMessage: string = '';
  private sub: Subscription;
  metricList: any[] = [];

  constructor(private route: ActivatedRoute,
              private serviceProviderService: ServiceProviderService,
              private accountingStatsService: AccountingStatsService) {
  }

  ngOnInit() {
    this.providerId = this.route.parent.snapshot.paramMap.get('provider');
    this.catalogueId = this.route.parent.snapshot.paramMap.get('catalogueId');
    forkJoin({
      stats: this.accountingStatsService.getAccountingStatsForProvider(this.providerId),
      provider: this.serviceProviderService.getServiceProviderById(this.providerId, this.catalogueId)
    }).subscribe({
      next: ({ stats, provider }) => {
        this.provider = provider;
        this.metricList = stats?.aggregated_metrics || []; //assuming that we need the aggregated metrics
      },
      error: (err) => {
        this.errorMessage = 'An error occurred while retrieving data for this service. ' + err.error;
      },
      complete: () => {
        if (this.metricList.length === 0) { this.noDataMessage = 'No data available for this service.' }
      }
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
