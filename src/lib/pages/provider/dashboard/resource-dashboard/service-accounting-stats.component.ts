import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {forkJoin, Subscription} from 'rxjs';
import {ResourceService} from '../../../../services/resource.service';
import {AccountingStatsService} from "../../../../services/accounting-stats.service";
import {Service} from "../../../../domain/eic-model";


@Component({
    selector: 'app-service-accounting-stats',
    templateUrl: './service-accounting-stats.component.html',
    standalone: false
})
export class ServiceAccountingStatsComponent implements OnInit {

  service: Service;
  resourceId: string;
  catalogueId: string;
  loadingMessage: string = '';
  errorMessage: string;
  noDataMessage: string = '';
  private sub: Subscription;
  metricList: any[] = [];

  selectedRange: string = 'all';
  startDate: string;
  endDate: string;

  constructor(
    private route: ActivatedRoute,
    private resourceService: ResourceService,
    private accountingStatsService: AccountingStatsService) {}

  ngOnInit() {
    this.sub = this.route.parent.params.subscribe(params => {
      this.resourceId = params['resourceId'];
      this.catalogueId = params['catalogueId'];

      this.setDateRange('all');

      forkJoin({
        stats: this.accountingStatsService.getAccountingStatsForService(this.resourceId, this.startDate, this.endDate),
        service: this.resourceService.getService(this.resourceId, this.catalogueId)
      }).subscribe({
        next: ({ stats, service }) => {
          this.service = service;
          this.metricList = stats?.data || [];

          this.metricList.sort((a, b) => a.metric_name.localeCompare(b.metric_name));

          if (this.metricList.length === 0) {
            this.noDataMessage = stats?.message || 'No data available for this service.';
          }
        },
        error: (err) => {
          this.errorMessage = 'An error occurred while retrieving data for this service: ' + err.error.message;
        }
      });
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
        this.startDate = new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0];
        break;
      case 'month':
        this.startDate = new Date(today.setMonth(today.getMonth() - 1)).toISOString().split('T')[0];
        break;
      case 'year':
        this.startDate = new Date(today.setFullYear(today.getFullYear() - 1)).toISOString().split('T')[0];
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

    this.accountingStatsService.getAccountingStatsForService(this.resourceId, this.startDate, this.endDate).subscribe({
      next: (stats) => {
        this.metricList = stats?.data || [];

        this.metricList.sort((a, b) => a.metric_name.localeCompare(b.metric_name));

        if (this.metricList.length === 0) {
          this.noDataMessage = stats?.message || 'No data available for this service.';
        }
      },
      error: (err) => {
        this.errorMessage = 'An error occurred while retrieving data for this service: ' + err.error.message;
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
