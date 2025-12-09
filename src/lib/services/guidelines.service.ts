import {Injectable} from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {environment} from '../../environments/environment';
import {
  ResourceInteroperabilityRecord,
  InteroperabilityRecord, TrainingResourceBundle, InteroperabilityRecordBundle, CatalogueBundle, DatasourceBundle,
} from '../domain/eic-model';
import {Paging} from "../domain/paging";
import {ConfigService} from "./config.service";

@Injectable()
export class GuidelinesService {

  private catalogueConfigId: string;

  constructor(public http: HttpClient, public authenticationService: AuthenticationService, private configService: ConfigService) {
    this.catalogueConfigId = this.configService.getProperty('catalogueId');
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

  getInteroperabilityRecords(from?: string, quantity?: string, sort?: string, order?: string, query?: string) { //open for EPOT and Providers
    let params = new HttpParams();
    if (from && from !== '') params = params.append('from', from);
    if (quantity && quantity !== '') params = params.append('quantity', quantity);
    if (sort && sort !== '') params = params.append('sort', sort);
    if (order && order !== '') params = params.append('order', order);
    if (query && query !== '') params = params.append('keyword', query);
    return this.http.get(this.base + `/interoperabilityRecord/all`, {params});
  }

  /** new--> **/
  getInteroperabilityRecordBundles(from?: string, quantity?: string, sort?: string, order?: string, query?: string,
                                   catalogueId?: string, providerId?: string, status?: string, active?: string, suspended?: string, auditState? :string) {
    let params = new HttpParams();
    if (from && from !== '') params = params.append('from', from);
    if (quantity && quantity !== '') params = params.append('quantity', quantity);
    if (sort && sort !== '') params = params.append('sort', sort);
    if (order && order !== '') params = params.append('order', order);
    if (query && query !== '') params = params.append('keyword', query);
    if (catalogueId?.length > 0) params = params.append('catalogue_id', catalogueId);
    if (providerId?.length > 0) params = params.append('provider_id', decodeURIComponent(providerId));
    if (status && status !== '') params = params.append('status', status);
    if (active && active !== '') params = params.append('active', active);
    if (suspended && suspended !== '') params = params.append('suspended', suspended);
    if (auditState?.length > 0) params = params.append('audit_state', auditState);
    return this.http.get(this.base + `/interoperabilityRecord/bundle/all`, {params});
  }

  getInteroperabilityRecordsOfProvider(id: string, from: string, quantity: string, order: string, sort: string, query: string, status: string) {
    id = decodeURIComponent(id);
    if (!query) { query = '';}
    if (!status) { return this.http.get<Paging<InteroperabilityRecordBundle>>(this.base + `/interoperabilityRecord/byProvider/${id}?from=${from}&quantity=${quantity}&order=${order}&sort=${sort}&keyword=${query}`); }
    return this.http.get<Paging<InteroperabilityRecordBundle>>(this.base + `/interoperabilityRecord/byProvider/${id}?from=${from}&quantity=${quantity}&order=${order}&sort=${sort}&keyword=${query}&status=${status}`);
  }

  verifyInteroperabilityRecord(id: string, active: boolean, status: string) {
    id = decodeURIComponent(id);
    return this.http.patch(this.base + `/interoperabilityRecord/verify/${id}?active=${active}&status=${status}`, {}, this.options);
  }

  publishInteroperabilityRecord(id: string, active: boolean) { // toggles active/inactive provider
    // id = decodeURIComponent(id);
    return this.http.patch(this.base + `/interoperabilityRecord/publish/${id}?active=${active}`, this.options);
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
    if(!catalogueId) catalogueId = this.catalogueConfigId;
    if (catalogueId === this.catalogueConfigId)
      return this.http.patch(this.base + `/interoperabilityRecord/auditResource/${id}?actionType=${action}&catalogueId=${catalogueId}&comment=${comment}`, this.options);
    else
      return this.http.patch(this.base + `/catalogue/${catalogueId}/interoperabilityRecord/auditInteroperabilityRecord/${id}?actionType=${action}&comment=${comment}`, this.options);
  }

  /** Configuration Templates --> **/
  getTemplatesForGuideline(guidelineId: string) {
    guidelineId = decodeURIComponent(guidelineId);
    return this.http.get<any>(this.base + `/configurationTemplate/getAllByInteroperabilityRecordId/${guidelineId}`, this.options);
  }

  getTemplatesForGuidelinesMapping() {
    return this.http.get<any>(this.base + `/configurationTemplate/interoperabilityRecordIdToConfigurationTemplateListMap`, this.options);
  }

  saveConfigurationTemplateInstance(payload: any) {
    console.log(payload);
    const shouldPut = !!payload.id; // PUT if id exists, else POST
    return this.http[shouldPut ? 'put' : 'post'](this.base + `/configurationTemplateInstance`, payload, this.options);
  }

  getInstancesByResourceId(resourceId: string) {
    return this.http.get<any>(this.base + `/configurationTemplateInstance/getAllByResourceId/${resourceId}`, this.options);
  }

  getInstanceOfTemplate(resourceId: string, templateId: string) {
    const resId = decodeURIComponent(resourceId);
    const ctId = decodeURIComponent(templateId);
    return this.http.get<any>(this.base + `/configurationTemplateInstance/resources/${resId}/templates/${ctId}`, this.options);
  }

  /** <-- Configuration Templates **/
}
