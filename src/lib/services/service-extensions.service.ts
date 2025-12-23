import {Injectable} from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {environment} from '../../environments/environment';
import {Monitoring, Helpdesk, MonitoringBundle, HelpdeskBundle, MonitoringStatus} from '../domain/eic-model';
import {Observable, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';

@Injectable()
export class ServiceExtensionsService {

  constructor(public http: HttpClient, public authenticationService: AuthenticationService) {
  }
  base = environment.API_ENDPOINT;
  private options = {withCredentials: true};

  //native catlogue call only
  getMonitoringByServiceId(serviceId: string) {
    serviceId = decodeURIComponent(serviceId);
    return this.http.get<Monitoring>(this.base + `/service-extensions/monitoring/byService/${serviceId}`, this.options);
  }

  //native catlogue call only
  getHelpdeskByServiceId(serviceId: string) {
    serviceId = decodeURIComponent(serviceId);
    return this.http.get<Helpdesk>(this.base + `/service-extensions/helpdesk/byService/${serviceId}`, this.options);
  }

  getMonitoringService(id: string) {
    id = decodeURIComponent(id);
    return this.http.get<Monitoring>(this.base + `/service-extensions/monitoring/${id}`, this.options);
  }

  getHelpdeskService(id: string) {
    id = decodeURIComponent(id);
    return this.http.get<Helpdesk>(this.base + `/service-extensions/helpdesk/${id}`, this.options);
  }

  uploadMonitoringService(monitoringService: Monitoring, shouldPut: boolean, catalogueId: string, resourceType: string) {
    // console.log(JSON.stringify(service));
    // console.log(`knocking on: ${this.base}/service`);
    if (shouldPut) {
      return this.http.put<Monitoring>(this.base + `/service-extensions/monitoring?catalogue_id=${catalogueId}&resourceType=${resourceType}`, monitoringService, this.options);
    } else {
      return this.http.post<Monitoring>(this.base + `/service-extensions/monitoring?catalogue_id=${catalogueId}&resourceType=${resourceType}`, monitoringService, this.options);
    }
  }

  uploadHelpdeskService(helpdeskService: Helpdesk, shouldPut: boolean, catalogueId: string, resourceType: string) {
    // console.log(JSON.stringify(service));
    // console.log(`knocking on: ${this.base}/service`);
    if (shouldPut) {
      return this.http.put<Helpdesk>(this.base + `/service-extensions/helpdesk?catalogue_id=${catalogueId}&resourceType=${resourceType}`, helpdeskService, this.options);
    } else {
      return this.http.post<Helpdesk>(this.base + `/service-extensions/helpdesk?catalogue_id=${catalogueId}&resourceType=${resourceType}`, helpdeskService, this.options);
    }
  }

  getServiceTypes() {
    return this.http.get<any>(this.base + `/service-extensions/monitoring/serviceTypes`);
  }

  getMonitoringStatus(serviceId: string, showAllStatuses?: boolean) {
    serviceId = decodeURIComponent(serviceId);
    if (showAllStatuses) return this.http.get<MonitoringStatus[]>(this.base + `/service-extensions/monitoring/monitoringStatus/${serviceId}?allStatuses=true`, this.options);
      return null
    // return this.http.get<MonitoringStatus[]>(this.base + `/service-extensions/monitoring/monitoringStatus/${serviceId}`, this.options); //current status
  }

  getMonitoringAvailability(serviceId: string) {
    serviceId = decodeURIComponent(serviceId);
    const end_time = new Date().toISOString();
    const start_time = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    return this.http.get<MonitoringStatus[]>(this.base + `/service-extensions/monitoring/monitoringAvailability/${serviceId}?start_time=${start_time}&end_time=${end_time}`, this.options);
  }

}
