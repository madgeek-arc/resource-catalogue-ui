import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {environment} from '../../environments/environment';
import {Datasource, DatasourceBundle, OpenAIREMetrics} from '../domain/eic-model';
import {Paging} from '../domain/paging';

@Injectable()
export class DatasourceService {

  constructor(public http: HttpClient, public authenticationService: AuthenticationService) {
  }
  base = environment.API_ENDPOINT;
  private options = {withCredentials: true};

  getDatasource(id: string, catalogueId?: string) {
    id = decodeURIComponent(id);
    // if version becomes optional this should be reconsidered
    // return this.http.get<Service>(this.base + `/service/${version === undefined ? id : [id, version].join('/')}`, this.options);
    if (!catalogueId) catalogueId = 'eosc';
    return this.http.get<Datasource>(this.base + `/datasource/${id}?catalogue_id=${catalogueId}`, this.options);
  }

  deleteDatasource(id: string) {
    id = decodeURIComponent(id);
    return this.http.delete(this.base + '/datasource/' + id, this.options);
  }

  deleteDatasourceWithoutAdminRights(catalogueId: string, serviceId: string) {
    serviceId = decodeURIComponent(serviceId);
    return this.http.delete(this.base + `/datasource/${catalogueId}/${serviceId}`, this.options);
  }

  getDatasourceBundles(from: string, quantity: string, sort: string, order: string, query: string,
                       status: string, catalogue_id: string[], service_id: string[]) {
    let params = new HttpParams();
    params = params.append('from', from);
    params = params.append('quantity', quantity);
    params = params.append('sort', sort);
    params = params.append('order', order);
    if (status && status !== '') {
      params = params.append('status', status);
    }
    if (query && query !== '') {
      params = params.append('keyword', query);
    }
    if (catalogue_id && catalogue_id.length > 0) {
      for (const catalogueValue of catalogue_id) {
        params = params.append('catalogue_id', catalogueValue);
      }
    }
    // } else params = params.append('catalogue_id', 'all');
    if (service_id && service_id.length > 0) {
      for (const serviceValue of service_id) {
        params = params.append('service_id', decodeURIComponent(serviceValue));
      }
    }
    return this.http.get(this.base + `/datasource/adminPage/all`, {params});
  }

  getDatasourceBundleById(id: string, catalogueId: string) {
    id = decodeURIComponent(id);
    return this.http.get<DatasourceBundle>(this.base + `/datasource/bundle/${id}?catalogue_id=${catalogueId}`, this.options);
  }

  getOpenAIREDatasources(from: string, quantity: string, sort: string, order: string, query: string) {
    let params = new HttpParams();
    params = params.append('from', from);
    params = params.append('quantity', quantity);
    params = params.append('sort', sort);
    params = params.append('order', order);
    params = params.append('keyword', query);
    return this.http.get<Paging<Datasource>>(this.base + '/datasource/getAllOpenAIREDatasources', {params});
  }

  getOpenAIREDatasourcesById(OAid: string) {
    return this.http.get<Datasource>(this.base + `/datasource/getOpenAIREDatasourceById?datasourceId=${OAid}`, this.options);
  }

  isDatasourceRegisteredOnOpenAIRE(datasourceId: string) {
    datasourceId = decodeURIComponent(datasourceId);
    return this.http.get<boolean>(this.base + `/datasource/isDatasourceRegisteredOnOpenAIRE/${datasourceId}`);
  }

  submitDatasource(datasource: Datasource, shouldPut: boolean) {
    // console.log(JSON.stringify(datasource));
    // console.log(`knocking on: ${this.base}/datasource`);
    // return this.http[shouldPut ? 'put' : 'post']<Datasource>(this.base + '/datasource', datasource, this.options);
    return this.http[shouldPut ? 'put' : 'post']<Datasource>(this.base + '/datasource', datasource, this.options); //comment param can be used on update
  }

  verifyDatasource(id: string, active: boolean, status: string) {
    id = decodeURIComponent(id);
    return this.http.patch(this.base + `/datasource/verifyDatasource/${id}?active=${active}&status=${status}`, {}, this.options);
  }

  publishDatasource(id: string, version: string, active: boolean) { // toggles active/inactive datasource
    id = decodeURIComponent(id);
    if (version === null) {
      return this.http.patch(this.base + `/datasource/publish/${id}?active=${active}`, this.options);
    }
    return this.http.patch(this.base + `/datasource/publish/${id}?active=${active}&version=${version}`, this.options); // copy for provider without version
  }

  auditDatasource(id: string, action: string, comment: string) {
    id = decodeURIComponent(id);
    return this.http.patch(this.base + `/datasource/auditDatasource/${id}?actionType=${action}&comment=${comment}`, this.options);
  }

  getDatasourceByServiceId(serviceId: string, catalogueId?:string){
    serviceId = decodeURIComponent(serviceId);
    if (!catalogueId) catalogueId = 'eosc';
    return this.http.get<Datasource>(this.base + `/datasource/byService/${serviceId}?catalogue_id=${catalogueId}`, this.options);
    // return this.http.get<Datasource>(this.base + `/datasource/${serviceId}`, this.options);
  }

  getOpenAIREMetrics(datasourceId: string) {
    datasourceId = decodeURIComponent(datasourceId);
    return this.http.get<OpenAIREMetrics>(this.base + `/datasource/isMetricsValid/${datasourceId}`);
  }

}
