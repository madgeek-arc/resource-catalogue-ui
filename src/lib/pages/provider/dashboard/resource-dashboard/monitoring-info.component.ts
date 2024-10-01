import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {environment} from '../../../../../environments/environment';
import {MonitoringStatus, Service} from '../../../../domain/eic-model';
import {Subscription} from 'rxjs';
import {NavigationService} from '../../../../services/navigation.service';
import {ResourceService} from '../../../../services/resource.service';
import {ServiceExtensionsService} from '../../../../services/service-extensions.service';
import * as Highcharts from 'highcharts';


@Component({
  selector: 'app-monitoring-info',
  templateUrl: './monitoring-info.component.html'
})

export class MonitoringInfoComponent implements OnInit {

  serviceORresource = environment.serviceORresource;
  monitoringURL = environment.MONITORING_URL;

  public service: Service;
  public errorMessage: string;
  private sub: Subscription;

  currentMonitoringStatus: string;
  monitoringData: MonitoringStatus[] = []; //for availability and reliability
  // availabilityData: any;
  // reliabilityData: any;
  // minimum = 90;
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: any = null;
  loadingMessage = '';

  constructor(private route: ActivatedRoute,
              private navigator: NavigationService,
              private resourceService: ResourceService,
              private serviceExtensionsService: ServiceExtensionsService) {
  }

  ngOnInit() {
    this.sub = this.route.parent.params.subscribe(params => {
      this.resourceService.getService(params['resourceId'], params['catalogueId']).subscribe(
        suc => { this.service = suc },
        err => { this.errorMessage = 'An error occurred while retrieving data for this service. ' + err.error; },
        () => {
          this.getCurrentMonitoringStatus(this.service.id);
          this.getAvailabilityAndReliability(this.service.id);
        }
      );
    });
  }

  getCurrentMonitoringStatus(serviceId: string){
    this.serviceExtensionsService.getMonitoringStatus(serviceId).subscribe(
      monitoringStatus => { if(monitoringStatus){this.currentMonitoringStatus = monitoringStatus[0].value} else {this.currentMonitoringStatus = 'NA'} },
      err => { this.errorMessage = 'An error occurred while retrieving data for this service. ' + err.error; },
      // () => {console.log(this.currentMonitoringStatus)}
    );
  }

  getAvailabilityAndReliability(serviceId: string){
    this.loadingMessage = 'Loading...';
    this.serviceExtensionsService.getMonitoringAvailability(serviceId).subscribe(
      data => { this.monitoringData = data },
      err => { this.errorMessage = 'An error occurred while retrieving data for this service. ' + err.error; this.loadingMessage = '';},
      () => {
        // console.log(this.monitoringData);
        // this.availabilityData = this.monitoringData.map(item => parseInt(item.availability));
        // this.reliabilityData = this.monitoringData.map(item => parseInt(item.reliability));
        this.loadingMessage = '';
        if (this.monitoringData) {this.drawChart()}
      }
    );
  }

  drawChart(){
    this.chartOptions = {
      chart: {
        type: 'column'
      },
      credits: {
        enabled: false
      },
      title: {
        text: 'Availability and Reliability'
      },
      xAxis: {
        categories: this.monitoringData.map(item => item.date)
      },
      yAxis: {
        title: {
          text: 'Percentage'
        },
        max: 100,
        // min: this.minimum,
      },
      series: [{
        name: 'Availability',
        data: this.monitoringData.map(item => parseInt(item.availability)),
        color: '#3e95cd'
      }, {
        name: 'Reliability',
        data: this.monitoringData.map(item => parseInt(item.reliability)),
        color: '#8e5ea2'
      }]
    };
  }


}
