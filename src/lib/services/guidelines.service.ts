import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {environment} from '../../environments/environment';
import {
  ResourceInteroperabilityRecord,
  InteroperabilityRecord, TrainingResourceBundle, InteroperabilityRecordBundle, CatalogueBundle, DatasourceBundle,
} from '../domain/eic-model';
import {Paging} from "../domain/paging";

@Injectable()
export class GuidelinesService {

  constructor(public http: HttpClient, public authenticationService: AuthenticationService) {
  }
  base = environment.API_ENDPOINT;
  private options = {withCredentials: true};

  /** InteroperabilityRecords --> **/
  addInteroperabilityRecord(interoperabilityRecord: InteroperabilityRecord) {
    return this.http.post<InteroperabilityRecord>(this.base + '/interoperabilityRecord', interoperabilityRecord, this.options);
  }

  updateInteroperabilityRecord(interoperabilityRecord: InteroperabilityRecord) {
    return this.http.put<InteroperabilityRecord>(this.base + '/interoperabilityRecord', interoperabilityRecord, this.options);
  }

  getInteroperabilityRecordById(id: string) {
    id = decodeURIComponent(id);
    return this.http.get<InteroperabilityRecord>(this.base + `/interoperabilityRecord/${id}`, this.options);
  }

  deleteInteroperabilityRecordById(id: string) {
    id = decodeURIComponent(id);
    return this.http.delete(this.base + `/interoperabilityRecord/${id}`, this.options);
  }

  getInteroperabilityRecords(from?: string, quantity?: string, orderField?: string, order?: string, query?: string) { //open for EPOT and Providers
    let params = new HttpParams();
    if (from && from !== '') params = params.append('from', from);
    if (quantity && quantity !== '') params = params.append('quantity', quantity);
    if (orderField && orderField !== '') params = params.append('orderField', orderField);
    if (order && order !== '') params = params.append('order', order);
    if (query && query !== '') params = params.append('query', query);
    return this.http.get(this.base + `/interoperabilityRecord/all`, {params});
  }

  /** new--> **/
  getInteroperabilityRecordBundles(from?: string, quantity?: string, orderField?: string, order?: string, query?: string,
                                   catalogueId?: string, providerId?: string, status?: string, active?: string, suspended?: string, auditState? :string) {
    let params = new HttpParams();
    if (from && from !== '') params = params.append('from', from);
    if (quantity && quantity !== '') params = params.append('quantity', quantity);
    if (orderField && orderField !== '') params = params.append('orderField', orderField);
    if (order && order !== '') params = params.append('order', order);
    if (query && query !== '') params = params.append('query', query);
    if (catalogueId?.length > 0) params = params.append('catalogue_id', catalogueId);
    if (providerId?.length > 0) params = params.append('provider_id', decodeURIComponent(providerId));
    if (status && status !== '') params = params.append('status', status);
    if (active && active !== '') params = params.append('active', active);
    if (suspended && suspended !== '') params = params.append('suspended', suspended);
    if (auditState?.length > 0) params = params.append('audit_state', auditState);
    return this.http.get(this.base + `/interoperabilityRecord/bundle/all`, {params});
  }

  getInteroperabilityRecordsOfProvider(id: string, from: string, quantity: string, order: string, orderField: string, query: string, status: string) {
    id = decodeURIComponent(id);
    if (!query) { query = '';}
    if (!status) { return this.http.get<Paging<InteroperabilityRecordBundle>>(this.base + `/interoperabilityRecord/byProvider/${id}?from=${from}&quantity=${quantity}&order=${order}&orderField=${orderField}&query=${query}`); }
    return this.http.get<Paging<InteroperabilityRecordBundle>>(this.base + `/interoperabilityRecord/byProvider/${id}?from=${from}&quantity=${quantity}&order=${order}&orderField=${orderField}&query=${query}&status=${status}`);
  }

  verifyInteroperabilityRecord(id: string, active: boolean, status: string) {
    id = decodeURIComponent(id);
    return this.http.patch(this.base + `/interoperabilityRecord/verify/${id}?active=${active}&status=${status}`, {}, this.options);
  }
   /** <-- new **/
  /** <-- InteroperabilityRecords **/

  /** resourceInteroperabilityRecord--> **/
  getGuidelinesOfResource(id: string) {
    id = decodeURIComponent(id);
    // return this.http.get<ResourceGuidelines>(this.base + `/resourceInteroperabilityRecord/byResource/${id}`, this.options);
    return this.http.get<any>(this.base + `/resourceInteroperabilityRecord/byResource/${id}`, this.options);
  }

  assignGuidelinesToResource(resourceType: string, shouldPut: boolean, resourceGuidelines: ResourceInteroperabilityRecord) {
    return this.http[shouldPut ? 'put' : 'post'](this.base + `/resourceInteroperabilityRecord?resourceType=${resourceType}`, resourceGuidelines, this.options);
  }

  deleteGuidelinesOfResource(resourceId: string, resourceInteroperabilityRecordId: string) { //resourceId may refer to serviceId or datasourceId
    resourceId = decodeURIComponent(resourceId);
    resourceInteroperabilityRecordId = decodeURIComponent(resourceInteroperabilityRecordId);
    return this.http.delete(this.base + `/resourceInteroperabilityRecord/${resourceId}/${resourceInteroperabilityRecordId}`, this.options);
  }
  /** <-- resourceInteroperabilityRecord **/

  suspendInteroperabilityRecord(interoperabilityRecordId: string, catalogueId: string, suspend: boolean) {
    interoperabilityRecordId = decodeURIComponent(interoperabilityRecordId);
    return this.http.put<InteroperabilityRecordBundle>(this.base + `/interoperabilityRecord/suspend?interoperabilityRecordId=${interoperabilityRecordId}&catalogueId=${catalogueId}&suspend=${suspend}`, this.options);
  }

  auditGuideline(id: string, action: string, catalogueId: string, comment: string) {
    id = decodeURIComponent(id);
    return this.http.patch(this.base + `/interoperabilityRecord/auditResource/${id}?actionType=${action}&catalogueId=${catalogueId}&comment=${comment}`, this.options);
  }
}
