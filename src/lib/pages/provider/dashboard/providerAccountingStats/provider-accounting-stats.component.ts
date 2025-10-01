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

  selectedRange: string = 'all';
  startDate: string;
  endDate: string;

  constructor(private route: ActivatedRoute,
              private serviceProviderService: ServiceProviderService,
              private accountingStatsService: AccountingStatsService) {
  }

  ngOnInit() {
    this.providerId = this.route.parent.snapshot.paramMap.get('provider');
    this.catalogueId = this.route.parent.snapshot.paramMap.get('catalogueId');

    this.setDateRange('all');

    forkJoin({
      stats: this.accountingStatsService.getAccountingStatsForProvider(this.providerId, this.startDate, this.endDate),
      provider: this.serviceProviderService.getServiceProviderById(this.providerId, this.catalogueId)
    }).subscribe({
      next: ({ stats, provider }) => {
        this.provider = provider;
        this.metricList = stats?.aggregated_metrics || []; //assuming that we need the aggregated metrics
        if (this.metricList.length === 0) {
          this.noDataMessage = stats?.message || 'No data available for this provider.';
        }
      },
      error: (err) => {
        this.errorMessage = 'An error occurred while retrieving data for this provider. ' + err.error;
      }
    });
  }

  onRangeChange() {
    if (this.selectedRange === 'custom') {
      // leave dates as user set them (don’t overwrite)
      return;
    }
    this.setDateRange(this.selectedRange);
    this.reloadStats();
  }

  onCustomDateChange() {
    // when user changes calendars manually force dropdown to "custom"
    this.selectedRange = 'custom';

    if (this.startDate && this.endDate) {
      this.reloadStats();
    }
  }

  setDateRange(range: string) {
    const today = new Date();
    this.endDate = today.toISOString().split('T')[0];

    switch (range) {
      case 'week':
        this.startDate = new Date(today.setDate(today.getDate() - 7))
          .toISOString().split('T')[0];
        break;
      case 'month':
        this.startDate = new Date(today.setMonth(today.getMonth() - 1))
          .toISOString().split('T')[0];
        break;
      case 'year':
        this.startDate = new Date(today.setFullYear(today.getFullYear() - 1))
          .toISOString().split('T')[0];
        break;
      case 'all':
      default:
        this.startDate = '1970-01-01';
        break;
    }
  }

  reloadStats() {
    this.noDataMessage = '';
    this.errorMessage = '';
    this.metricList = [];

    this.accountingStatsService.getAccountingStatsForProvider(this.providerId, this.startDate, this.endDate).subscribe({
      next: (stats) => {
        this.metricList = stats?.aggregated_metrics || [];
        if (this.metricList.length === 0) {
          this.noDataMessage = stats?.message || 'No data available for this provider.';
        }
      },
      error: (err) => {
        this.errorMessage = 'An error occurred while retrieving data for this provider. ' + err.error;
      }
    });
  }

  getColor(metricName: string): string {
    let hash = 0;
    for (let i = 0; i < metricName?.length; i++) {
      hash = metricName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 70%)`;
  }

}
