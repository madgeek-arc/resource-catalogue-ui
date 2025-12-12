import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {
  ServiceBundle,
  Datasource,
  LoggingInfo,
  Provider,
  ProviderBundle,
  ProviderRequest,
  ServiceHistory,
  VocabularyCuration, TrainingResourceBundle
} from '../domain/eic-model';
import {environment} from '../../environments/environment';
import {Observable} from 'rxjs';
import {Paging} from '../domain/paging';
import {Model} from "../../dynamic-catalogue/domain/dynamic-form-model";
import {ConfigService} from "./config.service";

@Injectable()
export class ServiceProviderService {

  private catalogueConfigId: string;

  constructor(public http: HttpClient, public authenticationService: AuthenticationService, private configService: ConfigService) {
    this.catalogueConfigId = this.configService.getProperty('catalogueId');
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

  createNewServiceProvider(newProvider: any, comment: string) {
    // console.log(`knocking on: ${this.base}/provider`);
    return this.http.post(this.base + '/provider', newProvider, this.options);
  }

  updateServiceProvider(updatedFields: any, comment: string): Observable<Provider> {
    // console.log(`knocking on: ${this.base}/provider`);
    return this.http.put<Provider>(this.base + `/provider?comment=${comment}`, updatedFields, this.options);
  }

  updateAndPublishPendingProvider(updatedFields: any, comment: string): Observable<Provider> {
    return this.http.put<Provider>(this.base + '/provider/draft/transform', updatedFields, this.options);
  }

  verifyProvider(id: string, active: boolean, status: string) { // use for onboarding process
    id = decodeURIComponent(id);
    return this.http.patch(this.base + `/provider/verifyProvider/${id}?active=${active}&status=${status}`, {}, this.options);
  }

  auditProvider(id: string, action: string, catalogueId: string, comment: string) {
    id = decodeURIComponent(id);
    if(!catalogueId) catalogueId = this.catalogueConfigId;
    if (catalogueId === this.catalogueConfigId)
      return this.http.patch(this.base + `/provider/auditProvider/${id}?actionType=${action}&catalogueId=${catalogueId}&comment=${comment}`, this.options);
    else
      return this.http.patch(this.base + `/catalogue/${catalogueId}/provider/auditProvider/${id}?actionType=${action}&comment=${comment}`, this.options);
  }

  requestProviderDeletion(id: string) {
    id = decodeURIComponent(id);
    return this.http.get(this.base + `/provider/requestProviderDeletion?providerId=${id}`, this.options);
  }

  deleteServiceProvider(id: string) {
    id = decodeURIComponent(id);
    return this.http.delete(this.base + `/provider/${id}`, this.options);
  }

  getMyPendingProviders() {
    return this.http.get<ProviderBundle[]>(this.base + '/provider/draft/getMyDraftProviders', this.options);
  }

  getMyServiceProviders() {
    return this.http.get<ProviderBundle[]>(this.base + '/provider/getMyProviders', this.options);
  }

  getRandomProviders(quantity: string) {
    return this.http.get<ProviderBundle[]>(this.base + `/provider/randomProviders?quantity=${quantity}`, this.options);
  }

  getServiceProviderBundleById(id: string, catalogue_id?: string) {
    // console.log(id)
    id = decodeURIComponent(id); // fixme me: revisit for double decode if necessary
    // console.log(id)
    if(!catalogue_id) catalogue_id = this.catalogueConfigId;
    // return this.http.get<ProviderBundle>(this.base + `/provider/bundle/${id}`, this.options);
    if (catalogue_id === this.catalogueConfigId)
      return this.http.get<ProviderBundle>(this.base + `/provider/bundle/${id}?catalogue_id=${catalogue_id}`, this.options);
    else
      return this.http.get<ProviderBundle>(this.base + `/catalogue/${catalogue_id}/provider/bundle/${id}`, this.options);
  }

  getServiceProviderById(id: string, catalogue_id?: string) {
    // console.log(id)
    id = decodeURIComponent(id); // fixme me: revisit for double decode if necessary
    // console.log(id)
    if(!catalogue_id) catalogue_id = this.catalogueConfigId;
    // return this.http.get<Provider>(this.base + `/provider/${id}`, this.options);
    if (catalogue_id === this.catalogueConfigId)
      return this.http.get<Provider>(this.base + `/provider/${id}?catalogue_id=${catalogue_id}`, this.options);
    else
      return this.http.get<Provider>(this.base + `/catalogue/${catalogue_id}/provider/${id}`, this.options);
  }

  getPendingProviderById(id: string) {
    id = decodeURIComponent(id);
    return this.http.get<Provider>(this.base + `/provider/draft/${id}`, this.options);
  }

  getServicesOfProvider(id: string, catalogue_id: string, from: string, quantity: string, order: string, sort: string, active: string, status?: string, query?: string) {
    id = decodeURIComponent(id);
    if (!query) { query = ''; }
    let params = new HttpParams();
    if (status && status.length > 0) {
      for (const statusValue of status) {
        params = params.append('status', statusValue);
      }
    } else {
      const allStatus = ["approved resource","pending resource","rejected resource"];
      for (const statusValue of allStatus) {
        params = params.append('status', statusValue);
      }
    }

    if (catalogue_id === this.catalogueConfigId) {
      if (active === 'statusAll') {
        return this.http.get<Paging<ServiceBundle>>(this.base +
          `/service/byProvider/${id}?catalogue_id=${catalogue_id}&from=${from}&quantity=${quantity}&order=${order}&sort=${sort}&keyword=${query}`, {params});
      }
      return this.http.get<Paging<ServiceBundle>>(this.base +
        `/service/byProvider/${id}?catalogue_id=${catalogue_id}&from=${from}&quantity=${quantity}&order=${order}&sort=${sort}&active=${active}&keyword=${query}`, {params});
    } else {
      return this.http.get<Paging<ServiceBundle>>(this.base +
        `/catalogue/${catalogue_id}/${id}/service/bundle/all?from=${from}&quantity=${quantity}&order=${order}&sort=${sort}&keyword=${query}`, {params});
    }
  }

  getDatasourcesOfProvider(id: string, from: string, quantity: string, order: string, sort: string, active: string, status?: string, query?: string) {
    id = decodeURIComponent(id);
    if (!query) { query = ''; }
    if (!status) { status = 'approved resource,pending resource,rejected resource'; }
    let params = new HttpParams();
    if (status && status.length > 0) {
      for (const statusValue of status) {
        params = params.append('status', statusValue);
      }
    } else {
      const allStatus = ["approved resource","pending resource","rejected resource"];
      for (const statusValue of allStatus) {
        params = params.append('status', statusValue);
      }
    }
    if (active === 'statusAll') {
      return this.http.get<Paging<Datasource>>(this.base +
        `/datasource/byProvider/${id}?from=${from}&quantity=${quantity}&order=${order}&sort=${sort}&status=${status}&keyword=${query}`);
    }
    return this.http.get<Paging<Datasource>>(this.base +
      `/datasource/byProvider/${id}?from=${from}&quantity=${quantity}&order=${order}&sort=${sort}&active=${active}&status=${status}&keyword=${query}`);
  }

  getTrainingResourcesOfProvider(id: string, catalogue_id: string, from: string, quantity: string, order: string, sort: string, active: string, status?: string, query?: string) {
    id = decodeURIComponent(id);
    if (!query) { query = ''; }
    let params = new HttpParams();
    if (status && status.length > 0) {
      for (const statusValue of status) {
        params = params.append('status', statusValue);
      }
    } else {
      const allStatus = ["approved resource","pending resource","rejected resource"];
      for (const statusValue of allStatus) {
        params = params.append('status', statusValue);
      }
    }
    if (catalogue_id === this.catalogueConfigId) {
      if (active === 'statusAll') {
        return this.http.get<Paging<TrainingResourceBundle>>(this.base +
          `/trainingResource/byProvider/${id}?catalogue_id=${catalogue_id}&from=${from}&quantity=${quantity}&order=${order}&sort=${sort}&keyword=${query}`, {params});
      }
      return this.http.get<Paging<TrainingResourceBundle>>(this.base +
        `/trainingResource/byProvider/${id}?catalogue_id=${catalogue_id}&from=${from}&quantity=${quantity}&order=${order}&sort=${sort}&active=${active}&keyword=${query}`, {params});
    } else {
      return this.http.get<Paging<TrainingResourceBundle>>(this.base +
        `/catalogue/${catalogue_id}/${id}/trainingResource/bundle/all?from=${from}&quantity=${quantity}&order=${order}&sort=${sort}&keyword=${query}`, {params});
    }
  }

  getRejectedResourcesOfProvider(id: string, from: string, quantity: string, order: string, sort: string, resourceType: string) {
    return this.http.get<Paging<any>>(this.base +
      `/provider/resources/rejected/${id}?from=${from}&quantity=${quantity}&order=${order}&sort=${sort}&resourceType=${resourceType}`);
  }

  publishService(id: string, version: string, active: boolean) { // toggles active/inactive service
    id = decodeURIComponent(id);
    if (version === null) {
      return this.http.patch(this.base + `/service/publish/${id}?active=${active}`, this.options);
    }
    return this.http.patch(this.base + `/service/publish/${id}?active=${active}&version=${version}`, this.options); // copy for provider without version
  }

  publishDatasource(id: string, version: string, active: boolean) { // toggles active/inactive datasource
    id = decodeURIComponent(id);
    if (version === null) {
      return this.http.patch(this.base + `/datasource/publish/${id}?active=${active}`, this.options);
    }
    return this.http.patch(this.base + `/datasource/publish/${id}?active=${active}&version=${version}`, this.options); // copy for provider without version
  }

  publishProvider(id: string, active: boolean) { // toggles active/inactive provider
    id = decodeURIComponent(id);
    return this.http.patch(this.base + `/provider/publish/${id}?active=${active}`, this.options);
  }

  temporarySaveProvider(provider: Provider, providerExists: boolean) {
    if (providerExists) {
      return this.http.put<Provider>(this.base + '/provider/draft', provider, this.options);
    }
    return this.http.post<Provider>(this.base + '/provider/draft', provider, this.options);
  }

  getProviderRequests(id: string) {
    id = decodeURIComponent(id);
    return this.http.get<ProviderRequest[]>(this.base + `/request/allProviderRequests?providerId=${id}`);
  }

  hasAdminAcceptedTerms(id: string, pendingProvider: boolean) {
    id = decodeURIComponent(id);
    if (pendingProvider) {
      return this.http.get<boolean>(this.base + `/provider/hasAdminAcceptedTerms?id=${id}&isDraft=true`);
    }
    return this.http.get<boolean>(this.base + `/provider/hasAdminAcceptedTerms?id=${id}&isDraft=false`);
  }

  adminAcceptedTerms(id: string, pendingProvider: boolean) {
    id = decodeURIComponent(id);
    if (pendingProvider) {
      return this.http.put(this.base + `/provider/adminAcceptedTerms?providerId=${id}&isDraft=true`, this.options);
    }
    return this.http.put(this.base + `/provider/adminAcceptedTerms?providerId=${id}&isDraft=false`, this.options);
  }

  validateUrl(url: string) {
    // console.log(`knocking on: ${this.base}/provider/validateUrl?urlForValidation=${url}`);
    return this.http.get<boolean>(this.base + `/provider/validateUrl?urlForValidation=${url}`);
  }

  submitVocabularyEntry(entryValueName: string, vocabulary: string, parent: string, resourceType: string, providerId?: string, resourceId?: string) {
    if (providerId) providerId = decodeURIComponent(providerId);
    if (resourceId) resourceId = decodeURIComponent(resourceId);
    // console.log(`knocking on: ${this.base}/vocabularyCuration/addFront?entryValueName=${entryValueName}&vocabulary=${vocabulary}&parent=${parent}&resourceType=${resourceType}&providerId=${providerId}&resourceId=${resourceId}`);
    if (providerId && resourceId) {
      return this.http.post(this.base + `/vocabularyCuration/addFront?entryValueName=${entryValueName}&vocabulary=${vocabulary}&parent=${parent}&resourceType=${resourceType}&providerId=${providerId}&resourceId=${resourceId}`, this.options);
    } else if (providerId) {
      return this.http.post(this.base + `/vocabularyCuration/addFront?entryValueName=${entryValueName}&vocabulary=${vocabulary}&parent=${parent}&resourceType=${resourceType}&providerId=${providerId}`, this.options);
    } else {
      return this.http.post(this.base + `/vocabularyCuration/addFront?entryValueName=${entryValueName}&vocabulary=${vocabulary}&parent=${parent}&resourceType=${resourceType}`, this.options);
    }
  }

  getVocabularyCuration(status: string, from: string, quantity: string, order: string, sort: string, vocabulary?: string, query?: string) {
    let params = new HttpParams();
    params = params.append('status', status);
    params = params.append('from', from);
    params = params.append('quantity', quantity);
    params = params.append('order', order);
    params = params.append('sort', sort);
    if (query && query !== '') {
      params = params.append('keyword', query);
    }
    if (vocabulary && vocabulary.length > 0) {
      for (const voc of vocabulary) {
        params = params.append('vocabulary', voc);
      }
    }
    return this.http.get<VocabularyCuration[]>(this.base + `/vocabularyCuration/vocabularyCurationRequests/all`, {params});
  }

  approveVocabularyEntry(curation: VocabularyCuration, approve: boolean, rejectionReason?: string): Observable<VocabularyCuration> {
    if (!rejectionReason) {
      rejectionReason = 'Not provided';
    }
    if (approve) {
      return this.http.put<VocabularyCuration>(this.base + `/vocabularyCuration/approveOrRejectVocabularyCuration?approved=true`, curation, this.options);
    }
    return this.http.put<VocabularyCuration>(this.base + `/vocabularyCuration/approveOrRejectVocabularyCuration?approved=false&rejectionReason=${rejectionReason}`, curation, this.options);
  }

  getProviderLoggingInfoHistory(providerId: string, catalogue_id: string) {
    providerId = decodeURIComponent(providerId);
    // return this.http.get<Paging<LoggingInfo>>(this.base + `/provider/loggingInfoHistory/${providerId}/`);
    // return this.http.get<Paging<LoggingInfo>>(this.base + `/provider/loggingInfoHistory/${providerId}?catalogue_id=${catalogue_id}`);
    if (catalogue_id === this.catalogueConfigId)
      return this.http.get<Paging<LoggingInfo>>(this.base + `/provider/loggingInfoHistory/${providerId}?catalogue_id=${catalogue_id}`);
    else
      return this.http.get<Paging<LoggingInfo>>(this.base + `/catalogue/${catalogue_id}/provider/loggingInfoHistory/${providerId}`);
  }

  suspendProvider(providerId: string, catalogueId: string, suspend: boolean) {
    providerId = decodeURIComponent(providerId);
    return this.http.put<ProviderBundle>(this.base + `/provider/suspend?providerId=${providerId}&catalogueId=${catalogueId}&suspend=${suspend}`, this.options);
  }

  getAllResourcesUnderHLE(providerName?: string){
   return this.http.get<any>(this.base + `/provider/getAllResourcesUnderASpecificHLE?providerName=${providerName}`);
  }

  getFormModelById(id: string) {
    return this.http.get<Model>(this.base + `/forms/models/${id}`);
  }
}
