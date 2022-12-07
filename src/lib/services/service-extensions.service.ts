import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {environment} from '../../environments/environment';
import {Monitoring, Helpdesk, MonitoringBundle, HelpdeskBundle} from '../domain/eic-model';
import {URLParameter} from '../domain/url-parameter';
import {Observable, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';

declare var UIkit: any;

@Injectable()
export class ServiceExtensionsService {

  constructor(public http: HttpClient, public authenticationService: AuthenticationService) {
  }
  base = environment.API_ENDPOINT;
  private options = {withCredentials: true};
  ACCESS_TYPES;
  ORDER_TYPE;

  static removeNulls(obj) {
    const isArray = obj instanceof Array;
    for (const k in obj) {
      if (obj[k] === null || obj[k] === '') {
        isArray ? obj.splice(k, 1) : delete obj[k];
      } else if (typeof obj[k] === 'object') {
        if (typeof obj[k].value !== 'undefined' && typeof obj[k].lang !== 'undefined') {
          if (obj[k].value === '' && obj[k].lang === 'en') {
            obj[k].lang = '';
          }
        }
        ServiceExtensionsService.removeNulls(obj[k]);
      }
      if (obj[k] instanceof Array && obj[k].length === 0) {
        delete obj[k];
      } else if (obj[k] instanceof Array) {
        for (const l in obj[k]) {
          if (obj[k][l] === null || obj[k][l] === '') {
            delete obj[k][l];
          }
        }
      }
    }
  }

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

  public handleError(error: HttpErrorResponse) {
    // const message = 'Server error';
    const message = error.error;
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    UIkit.notification.closeAll();
    UIkit.notification({message: message, status: 'danger', pos: 'top-center', timeout: 5000});
    return throwError(error);
  }
}
