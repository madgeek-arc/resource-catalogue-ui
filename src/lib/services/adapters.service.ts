import {Injectable} from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {environment} from '../../environments/environment';
import {Adapter, AdapterBundle, InteroperabilityRecordBundle} from '../domain/eic-model';
import {Model} from "../../dynamic-catalogue/domain/dynamic-form-model";
import {Paging} from "../domain/paging";

@Injectable()
export class AdaptersService {

  constructor(public http: HttpClient,
              public authenticationService: AuthenticationService) {}
  base = environment.API_ENDPOINT;
  private options = {withCredentials: true};

  getAdaptersOfProvider(id: string, from: string, quantity: string, order: string, sort: string, query: string, status: string) {
    id = decodeURIComponent(id);
    if (!query) { query = '';}
    if (!status) { return this.http.get<Paging<AdapterBundle>>(this.base + `/adapter/byProvider/${id}?from=${from}&quantity=${quantity}&order=${order}&sort=${sort}&keyword=${query}`); }
    return this.http.get<Paging<AdapterBundle>>(this.base + `/adapter/byProvider/${id}?from=${from}&quantity=${quantity}&order=${order}&sort=${sort}&keyword=${query}&status=${status}`);
  }

  uploadAdapter(adapter: Adapter, shouldPut: boolean) {
    if (shouldPut) {
      return this.http.put<Adapter>(this.base + '/adapter', adapter, this.options);
    } else {
      return this.http.post<Adapter>(this.base + '/adapter', adapter, this.options);
    }
  }

  getMyAdapters() {
    return this.http.get<AdapterBundle[]>(this.base + '/adapter/getMy', this.options);
  }

  getAdapterById(id: string) {
    if (id === null) return null;
    id = decodeURIComponent(id);
    return this.http.get<Adapter>(this.base + `/adapter/${id}`, this.options);
  }

  deleteAdapterById(id: string) {
    id = decodeURIComponent(id);
    return this.http.delete(this.base + `/adapter/${id}`, this.options);
  }

  getAdapters(from?: string, quantity?: string, sort?: string, order?: string, query?: string) { //open for EPOT and Providers
    let params = new HttpParams();
    if (from && from !== '') params = params.append('from', from);
    if (quantity && quantity !== '') params = params.append('quantity', quantity);
    if (sort && sort !== '') params = params.append('sort', sort);
    if (order && order !== '') params = params.append('order', order);
    if (query && query !== '') params = params.append('keyword', query);
    return this.http.get(this.base + `/adapter/all`, {params});
  }

  getAdapterBundles(from?: string, quantity?: string, sort?: string, order?: string, query?: string,
                                   catalogueId?: string, providerId?: string, status?: string, active?: string, suspended?: string, auditState? :string) {
    let params = new HttpParams();
    if (from && from !== '') params = params.append('from', from);
    if (quantity && quantity !== '') params = params.append('quantity', quantity);
    if (sort && sort !== '') params = params.append('sort', sort);
    if (order && order !== '') params = params.append('order', order);
    if (query && query !== '') params = params.append('keyword', query);
    if (catalogueId?.length > 0) params = params.append('catalogue_id', catalogueId);
    // if (providerId?.length > 0) params = params.append('provider_id', decodeURIComponent(providerId));
    if (status && status !== '') params = params.append('status', status);
    if (active && active !== '') params = params.append('active', active);
    if (suspended && suspended !== '') params = params.append('suspended', suspended);
    if (auditState?.length > 0) params = params.append('audit_state', auditState);
    return this.http.get(this.base + `/adapter/bundle/all`, {params});
  }

  verifyAdapter(id: string, active: boolean, status: string) {
    id = decodeURIComponent(id);
    return this.http.patch(this.base + `/adapter/verify/${id}?active=${active}&status=${status}`, {}, this.options);
  }

  activateAdapter(id: string, active: boolean) { // toggles active/inactive provider
    // id = decodeURIComponent(id);
    return this.http.patch(this.base + `/adapter/setActive/${id}?active=${active}`, this.options);
  }

  suspendAdapter(adapterId: string, catalogueId: string, suspend: boolean) {
    adapterId = decodeURIComponent(adapterId);
    if (catalogueId == null)
      return this.http.put<AdapterBundle>(this.base + `/adapter/suspend?id=${adapterId}&suspend=${suspend}`, this.options);
    else
      return this.http.put<AdapterBundle>(this.base + `/catalogue/${catalogueId}/adapter/suspend/${adapterId}?suspend=${suspend}`, this.options);
  }

  auditAdapter(id: string, action: string, catalogueId: string, comment: string) {
    id = decodeURIComponent(id);
    if (catalogueId == null)
      return this.http.patch(this.base + `/adapter/audit/${id}?actionType=${action}&comment=${comment}`, this.options);
    else
      return this.http.patch(this.base + `/catalogue/${catalogueId}/adapter/audit/${id}?actionType=${action}&comment=${comment}`, this.options);
  }

  moveAdapterToProvider(adapterId: string, providerId: string, comment: string) {
    adapterId = decodeURIComponent(adapterId);
    providerId = decodeURIComponent(providerId);
    return this.http.patch(this.base + `/adapter/changeResourceOwner/${adapterId}?newOwnerId=${providerId}&comment=${comment}`, this.options);
  }

  hasAdminAcceptedTerms(id: string) {
    id = decodeURIComponent(id);
    return this.http.get<boolean>(this.base + `/adapter/hasAdminAcceptedTerms?id=${id}`);
  }

  adminAcceptedTerms(id: string) {
    id = decodeURIComponent(id);
    return this.http.put(this.base + `/adapter/adminAcceptedTerms?id=${id}`, this.options);
  }

  // getResourcesAsVocs(catalogueId: string, resourceType?: string){
  //   return this.http.get<any>(this.base + `/reference/idToNameMap?catalogueId=${catalogueId}&resourceType=${resourceType}`);
  // }

  getFormModelById(id: string) {
    return this.http.get<Model>(this.base + `/forms/models/${id}`);
  }
}
