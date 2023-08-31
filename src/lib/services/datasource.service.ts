import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {environment} from '../../environments/environment';
import { Service,  Datasource, ServiceBundle, DatasourceBundle } from '../domain/eic-model';
import {Paging} from '../domain/paging';
import {Observable, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';


@Injectable()
export class DatasourceService {

  constructor(public http: HttpClient, public authenticationService: AuthenticationService) {
  }
  base = environment.API_ENDPOINT;
  private options = {withCredentials: true};
  ACCESS_TYPES;
  ORDER_TYPE;

  getDatasource(id: string, catalogueId?: string) {
    // if version becomes optional this should be reconsidered
    // return this.http.get<Service>(this.base + `/service/${version === undefined ? id : [id, version].join('/')}`, this.options);
    if (!catalogueId) catalogueId = 'eosc';
    return this.http.get<Datasource>(this.base + `/datasource/${id}?catalogue_id=${catalogueId}`, this.options);
  }

  deleteDatasource(id: string) {
    return this.http.delete(this.base + '/datasource/' + id, this.options);
  }

  getDatasourceBundles(from: string, quantity: string, orderField: string, order: string, query: string,
                       catalogue_id: string[], suspended: string) {
    let params = new HttpParams();
    params = params.append('from', from);
    params = params.append('quantity', quantity);
    params = params.append('orderField', orderField);
    params = params.append('order', order);
    params = params.append('suspended', suspended);
    if (query && query !== '') {
      params = params.append('query', query);
    }
    // if (status && status.length > 0) {
    //   for (const statusValue of status) {
    //     params = params.append('status', statusValue);
    //   }
    // }
    // if (suspended && suspended.length > 0) {
    //   for (const suspendedValue of status) {
    //     params = params.append('suspended', suspendedValue);
    //   }
    // }
    if (catalogue_id && catalogue_id.length > 0) {
      for (const catalogueValue of catalogue_id) {
        params = params.append('catalogue_id', catalogueValue);
      }
    } else params = params.append('catalogue_id', 'all');
    return this.http.get(this.base + `/datasource/adminPage/all`, {params});
  }

  getDatasourceBundleById(id: string, catalogueId: string) {
    return this.http.get<DatasourceBundle>(this.base + `/datasource/bundle/${id}?catalogue_id=${catalogueId}`, this.options);
  }

  getOpenAIREDatasources(from: string, quantity: string, orderField: string, order: string, query: string) {
    let params = new HttpParams();
    params = params.append('from', from);
    params = params.append('quantity', quantity);
    params = params.append('orderField', orderField);
    params = params.append('order', order);
    params = params.append('query', query);
    return this.http.get<Paging<Datasource>>(this.base + '/datasource/getAllOpenAIREDatasources', {params});
  }

  getOpenAIREDatasourcesById(id: string) {
    return this.http.get<Datasource>(this.base + `/datasource/getOpenAIREDatasourceById?datasourceId=${id}`, this.options);
  }

  submitDatasource(datasource: Datasource, shouldPut: boolean) {
    // console.log(JSON.stringify(datasource));
    // console.log(`knocking on: ${this.base}/datasource`);
    // return this.http[shouldPut ? 'put' : 'post']<Datasource>(this.base + '/datasource', datasource, this.options);
    return this.http[shouldPut ? 'put' : 'post']<Datasource>(this.base + '/datasource?catalogue_id=eosc', datasource, this.options);
  }

  verifyDatasource(id: string, active: boolean, status: string) { // for 1st datasource
    return this.http.patch(this.base + `/datasource/verifyDatasource/${id}?active=${active}&status=${status}`, {}, this.options);
  }

  publishDatasource(id: string, version: string, active: boolean) { // toggles active/inactive datasource
    if (version === null) {
      return this.http.patch(this.base + `/datasource/publish/${id}?active=${active}`, this.options);
    }
    return this.http.patch(this.base + `/datasource/publish/${id}?active=${active}&version=${version}`, this.options); // copy for provider without version
  }

  isItRegistered(datasourceId: string) {
    return this.http.get<boolean>(this.base + `/datasource/isDatasourceRegisteredOnOpenAIRE/${datasourceId}`);
  }

  auditDatasource(id: string, action: string, comment: string) {
    return this.http.patch(this.base + `/datasource/auditDatasource/${id}?actionType=${action}&comment=${comment}`, this.options);
  }


  getDatasourceByServiceId(serviceId: string, catalogueId?:string){
    if (!catalogueId) catalogueId = 'eosc';
    return this.http.get<Datasource>(this.base + `/datasource/byService/${serviceId}?catalogue_id=${catalogueId}`, this.options);
    // return this.http.get<Datasource>(this.base + `/datasource/${serviceId}`, this.options);
  }
}
