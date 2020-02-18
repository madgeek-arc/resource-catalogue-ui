import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {InfraService, Provider, ProviderBundle, ProviderRequest, Service} from '../domain/eic-model';
import {environment} from '../../environments/environment';
import {Observable, throwError} from 'rxjs';
import {Pagination} from '../domain/pagination';

declare var UIkit: any;

@Injectable()
export class ServiceProviderService {

  constructor(public http: HttpClient, public authenticationService: AuthenticationService) {
  }
  private base = environment.API_ENDPOINT;
  private httpOption = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json;charset=UTF-8',
      'Accept': 'application/json;charset=UTF-8'
    })
  };

  private options = {withCredentials: true};

  static checkUrl(url: string) {
    if (url !== '') {
      if (!url.match(/^(https?:\/\/.+)?$/)) {
        url = 'http://' + url;
      }
    }
    return url;
  }

  createNewServiceProvider(newProvider: any) {
    return this.http.post(this.base + '/provider', newProvider, this.options);
  }

  updateServiceProvider(updatedFields: any): Observable<Provider> {
    return this.http.put<Provider>(this.base + '/provider', updatedFields, this.options);
  }

  updateAndPublishPendingProvider(updatedFields: any): Observable<Provider> {
    return this.http.put<Provider>(this.base + '/pendingProvider/transform/active', updatedFields, this.options);
  }

  verifyServiceProvider(id: string, active: boolean, status: string) {
    return this.http.patch(this.base + `/provider/verifyProvider/${id}?active=${active}&status=${status}`, {}, this.options);
  }

  getMyServiceProviders() {
    return this.http.get<ProviderBundle[]>(this.base + '/provider/getMyServiceProviders', this.options);
  }

  getServiceProviderBundleById(id: string) {
    return this.http.get<ProviderBundle>(this.base + `/provider/bundle/${id}`, this.options);
  }

  getServiceProviderById(id: string) {
    return this.http.get<Provider>(this.base + `/provider/${id}`, this.options);
  }

  getPendingProviderById(id: string) {
    return this.http.get<Provider>(this.base + `/pendingProvider/provider/${id}`, this.options);
  }

  getServicesOfProvider(id: string) {
    return this.http.get<Pagination<InfraService>>(this.base + `/service/byProvider/${id}?order=ASC&orderField=name`);
  }

  getPendingServicesOfProvider(id: string) {
    return this.http.get<Service[]>(this.base + `/provider/services/pending/${id}`);
  }

  getPendingServicesByProvider(id: string) {
    return this.http.get<Pagination<InfraService>>(this.base + `/pendingService/byProvider/${id}?order=ASC&orderField=name`);
  }

  publishService(id: string, version: string, active: boolean) {
    if (version === null) {
      return this.http.patch(this.base + `/service/publish/${id}?active=${active}`, this.options);
    }
    return this.http.patch(this.base + `/service/publish/${id}?active=${active}&version=${version}`, this.options);
  }

  getProviderRequests(id: string) {
    return this.http.get<ProviderRequest[]>(this.base + `/request/allProviderRequests?providerId=${id}`);
  }

  private handleError(error: HttpErrorResponse) {
    // const message = 'Server error';
    const message = error.error.error;
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
