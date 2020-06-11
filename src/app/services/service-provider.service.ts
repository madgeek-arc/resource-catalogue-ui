import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {InfraService, Provider, ProviderBundle, ProviderRequest, Service} from '../domain/eic-model';
import {environment} from '../../environments/environment';
import {Observable} from 'rxjs';
import {Paging} from '../domain/paging';

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
    const url = `${this.base}createNewServiceProvider/provider/....`;
    console.log(`knocking on: ${url}`);
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

  getMyPendingProviders() {
    return this.http.get<ProviderBundle[]>(this.base + '/pendingProvider/getMyPendingProviders', this.options);
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
    return this.http.get<Paging<InfraService>>(this.base + `/service/byProvider/${id}?order=ASC&orderField=name`);
  }

  getPendingServicesOfProvider(id: string) {
    return this.http.get<Service[]>(this.base + `/provider/services/pending/${id}`);
  }

  getPendingServicesByProvider(id: string) {
    return this.http.get<Paging<InfraService>>(this.base + `/pendingService/byProvider/${id}?order=ASC&orderField=name`);
  }

  publishService(id: string, version: string, active: boolean) {
    if (version === null) {
      return this.http.patch(this.base + `/service/publish/${id}?active=${active}`, this.options);
    }
    return this.http.patch(this.base + `/service/publish/${id}?active=${active}&version=${version}`, this.options);
  }

  temporarySaveProvider(provider: Provider, providerExists: boolean) {
    console.log(providerExists);
    if (providerExists) {
      return this.http.put<Provider>(this.base + '/pendingProvider/provider', provider, this.options);
    }
    return this.http.put<Provider>(this.base + '/pendingProvider/pending', provider, this.options);
  }

  getProviderRequests(id: string) {
    return this.http.get<ProviderRequest[]>(this.base + `/request/allProviderRequests?providerId=${id}`);
  }

}
