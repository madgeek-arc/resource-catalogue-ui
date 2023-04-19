import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {environment} from '../../environments/environment';
import {
  ResourceInteroperabilityRecord,
  InteroperabilityRecord, TrainingResourceBundle, InteroperabilityRecordBundle,
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
    return this.http.post<InteroperabilityRecord>(this.base + '/interoperabilityRecord/', interoperabilityRecord, this.options);
  }

  updateInteroperabilityRecord(interoperabilityRecord: InteroperabilityRecord) {
    return this.http.put<InteroperabilityRecord>(this.base + '/interoperabilityRecord/', interoperabilityRecord, this.options);
  }

  getInteroperabilityRecordById(id: string) {
    return this.http.get<InteroperabilityRecord>(this.base + `/interoperabilityRecord/${id}`, this.options);
  }

  deleteInteroperabilityRecordById(id: string) {
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
  getInteroperabilityRecordBundles(from?: string, quantity?: string, orderField?: string, order?: string, query?: string, catalogueId?: string, providerId?: string, status?: string) {
    let params = new HttpParams();
    if (from && from !== '') params = params.append('from', from);
    if (quantity && quantity !== '') params = params.append('quantity', quantity);
    if (orderField && orderField !== '') params = params.append('orderField', orderField);
    if (order && order !== '') params = params.append('order', order);
    if (query && query !== '') params = params.append('query', query);
    if (catalogueId && catalogueId !== '') params = params.append('catalogue_id', catalogueId);
    if (providerId && providerId !== '') params = params.append('provider_id', providerId);
    if (status && status !== '') params = params.append('status', status);

    return this.http.get(this.base + `/interoperabilityRecord/bundle/all`, {params});
  }

  getInteroperabilityRecordsOfProvider(id: string, from: string, quantity: string, order: string, orderField: string, active: string, query?: string) {
    if (!query) { query = ''; }
    return this.http.get<Paging<InteroperabilityRecordBundle>>(this.base +
      `/interoperabilityRecord/byProvider/${id}?from=${from}&quantity=${quantity}&order=${order}&orderField=${orderField}&query=${query}`);
  }

  verifyInteroperabilityRecord(id: string, active: boolean, status: string) {
    return this.http.patch(this.base + `/interoperabilityRecord/verify/${id}?active=${active}&status=${status}`, {}, this.options);
  }
   /** <-- new **/
  /** <-- InteroperabilityRecords **/

  /** resourceInteroperabilityRecord--> **/
  getGuidelinesOfResource(id: string) {
    // return this.http.get<ResourceGuidelines>(this.base + `/resourceInteroperabilityRecord/byResource/${id}`, this.options);
    return this.http.get<any>(this.base + `/resourceInteroperabilityRecord/byResource/${id}`, this.options);
  }

  assignGuidelinesToResource(resourceType: string, shouldPut: boolean, resourceGuidelines: ResourceInteroperabilityRecord) {
    return this.http[shouldPut ? 'put' : 'post'](this.base + `/resourceInteroperabilityRecord?resourceType=${resourceType}`, resourceGuidelines, this.options);
  }

  deleteGuidelinesOfResource(resourceId: string, resourceInteroperabilityRecordId: string) { //resourceId may refer to serviceId or datasourceId
    return this.http.delete(this.base + `/resourceInteroperabilityRecord/${resourceId}/${resourceInteroperabilityRecordId}`, this.options);
  }
  /** <-- resourceInteroperabilityRecord **/
}
