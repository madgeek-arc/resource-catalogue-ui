import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {environment} from '../../environments/environment';
import {
  ResourceInteroperabilityRecord,
  EOSCIFGuidelines,
  InteroperabilityRecord,
} from '../domain/eic-model';

@Injectable()
export class ResourceExtrasService {

  constructor(public http: HttpClient, public authenticationService: AuthenticationService) {
  }
  base = environment.API_ENDPOINT;
  private options = {withCredentials: true};

  updateHorizontalService(resourceId: string, type: string, catalogueId: string, horizontalService: boolean) {
    return this.http.put(this.base + `/resource-extras/update/horizontalService?resourceId=${resourceId}&type=${type}&catalogueId=${catalogueId}&horizontalService=${horizontalService}`, this.options);
  }

  updateResearchCategories(resourceId: string, type: string, catalogueId: string, researchCategories: string[]) {
    return this.http.put<string[]>(this.base + `/resource-extras/update/researchCategories?resourceId=${resourceId}&type=${type}&catalogueId=${catalogueId}`, researchCategories, this.options);
  }

  updateEoscIFGuidelines(resourceId: string, type: string, catalogueId: string, eoscIFGuidelines: EOSCIFGuidelines[]) {
    return this.http.put<EOSCIFGuidelines[]>(this.base + `/resource-extras/update/eoscIFGuidelines?resourceId=${resourceId}&type=${type}&catalogueId=${catalogueId}`, eoscIFGuidelines, this.options);
  }

  /** InteroperabilityRecords --> **/
  addInteroperabilityRecord(interoperabilityRecord: InteroperabilityRecord) {
    return this.http.post<InteroperabilityRecord>(this.base + '/interoperabilityRecord/', interoperabilityRecord, this.options);
  }

  updateInteroperabilityRecord(interoperabilityRecord: InteroperabilityRecord) {
    return this.http.put<InteroperabilityRecord>(this.base + '/interoperabilityRecord/', interoperabilityRecord, this.options);
  }

  getInteroperabilityRecords(from?: string, quantity?: string, orderField?: string, order?: string, query?: string) {
    let params = new HttpParams();
    if (from && from !== '') params = params.append('from', from);
    if (quantity && quantity !== '') params = params.append('quantity', quantity);
    if (orderField && orderField !== '') params = params.append('orderField', orderField);
    if (order && order !== '') params = params.append('order', order);
    if (query && query !== '') params = params.append('query', query);
    return this.http.get(this.base + `/interoperabilityRecord/all`, {params});
  }

  deleteInteroperabilityRecordById(id: string) {
    return this.http.delete(this.base + `/interoperabilityRecord/${id}`, this.options);
  }

  assignGuidelinesToResource(resourceType: string, shouldPut: boolean, resourceGuidelines: ResourceInteroperabilityRecord) {
    return this.http[shouldPut ? 'put' : 'post'](this.base + `/resourceInteroperabilityRecord?resourceType=${resourceType}`, resourceGuidelines, this.options);
  }

  // updateInteroperabilityRecordsOfResource(resourceId: string, type: string, catalogueId: string, interoperabilityRecordIds: string[]) {
  //   return this.http.put(this.base + `/resource-extras/update/interoperabilityRecords?resourceId=${resourceId}&type=${type}&catalogueId=${catalogueId}`, interoperabilityRecordIds, this.options);
  // }

  getInteroperabilityRecordById(id: string) {
    return this.http.get<InteroperabilityRecord>(this.base + `/interoperabilityRecord/${id}`, this.options);
  }

  getGuidelinesOfResource(id: string) {
    // return this.http.get<ResourceGuidelines>(this.base + `/resourceInteroperabilityRecord/byResource/${id}`, this.options);
    return this.http.get<any>(this.base + `/resourceInteroperabilityRecord/byResource/${id}`, this.options);
  }

  deleteGuidelinesOfResource(resourceId: string, resourceInteroperabilityRecordId: string) { //resourceId may refer to serviceId or datasourceId
    return this.http.delete(this.base + `/resourceInteroperabilityRecord/${resourceId}/${resourceInteroperabilityRecordId}`, this.options);
  }

}
