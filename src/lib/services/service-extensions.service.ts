import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {environment} from '../../environments/environment';
import {Monitoring, Helpdesk, MonitoringBundle, HelpdeskBundle, MonitoringStatus} from '../domain/eic-model';
import {URLParameter} from '../domain/url-parameter';
import {Observable, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';

@Injectable()
export class ServiceExtensionsService {

  constructor(public http: HttpClient, public authenticationService: AuthenticationService) {
  }
  base = environment.API_ENDPOINT;
  private options = {withCredentials: true};

  getMonitoringByServiceId(serviceId: string) {
    return this.http.get<Monitoring>(this.base + `/service-extensions/monitoring/byService/${serviceId}`, this.options);
  }

  getHelpdeskByServiceId(serviceId: string) {
    return this.http.get<Helpdesk>(this.base + `/service-extensions/helpdesk/byService/${serviceId}`, this.options);
  }

  getMonitoringService(id: string) {
    return this.http.get<Monitoring>(this.base + `/service-extensions/monitoring/${id}`, this.options);
  }

  getHelpdeskService(id: string) {
    return this.http.get<Helpdesk>(this.base + `/service-extensions/helpdesk/${id}`, this.options);
  }

  uploadMonitoringService(monitoringService: Monitoring, shouldPut: boolean, catalogueId: string, resourceType: string) {
    // console.log(JSON.stringify(service));
    // console.log(`knocking on: ${this.base}/service`);
    return this.http[shouldPut ? 'put' : 'post']<Monitoring>(this.base + `/service-extensions/monitoring?catalogueId=${catalogueId}&resourceType=${resourceType}`, monitoringService, this.options);
  }

  uploadHelpdeskService(helpdeskService: Helpdesk, shouldPut: boolean, catalogueId: string, resourceType: string) {
    // console.log(JSON.stringify(service));
    // console.log(`knocking on: ${this.base}/service`);
    return this.http[shouldPut ? 'put' : 'post']<Helpdesk>(this.base + `/service-extensions/helpdesk?catalogueId=${catalogueId}&resourceType=${resourceType}`, helpdeskService, this.options);
  }

  getServiceTypes() {
    return this.http.get<any>(this.base + `/service-extensions/monitoring/serviceTypes`);
  }

  getMonitoringStatus(serviceId: string, showAllStatuses?: boolean) {
    if (showAllStatuses) return this.http.get<MonitoringStatus[]>(this.base + `/service-extensions/monitoring/monitoringStatus/${serviceId}?allStatuses=true`, this.options);
    return this.http.get<MonitoringStatus[]>(this.base + `/service-extensions/monitoring/monitoringStatus/${serviceId}`, this.options); //current status
  }

  getMonitoringAvailability(serviceId: string) {
    return this.http.get<MonitoringStatus[]>(this.base + `/service-extensions/monitoring/monitoringAvailability/${serviceId}`, this.options);
  }

}
