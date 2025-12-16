import {Injectable} from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {environment} from '../../environments/environment';
import {
  VocabularyTree,
  Provider,
  RichService,
  Service,
  ServiceHistory,
  Vocabulary,
  Type, ServiceBundle, LoggingInfo, DeployableServiceBundle, DeployableService, TrainingResourceBundle,
} from '../domain/eic-model';
import {BrowseResults} from '../domain/browse-results';
import {Paging} from '../domain/paging';
import {URLParameter} from '../domain/url-parameter';
import {throwError} from 'rxjs';
import {Model} from "../../dynamic-catalogue/domain/dynamic-form-model";
import {ConfigService} from "./config.service";

declare var UIkit: any;

@Injectable()
export class DeployableServiceService {

  private catalogueConfigId: string;

  constructor(public http: HttpClient, public authenticationService: AuthenticationService, private configService: ConfigService) {
    this.catalogueConfigId = this.configService.getProperty('catalogueId');
  }
  base = environment.API_ENDPOINT;
  private options = {withCredentials: true};

  static removeNulls(obj) {
    const isArray = obj instanceof Array;
    for (const k in obj) {
      if (obj[k] === null || obj[k] === '') {
        isArray ? obj.splice(+k, 1) : delete obj[k];
      } else if (typeof obj[k] === 'object') {
        if (typeof obj[k].value !== 'undefined' && typeof obj[k].lang !== 'undefined') {
          if (obj[k].value === '' && obj[k].lang === 'en') {
            obj[k].lang = '';
          }
        }
        DeployableServiceService.removeNulls(obj[k]);
      }
      if (obj[k] instanceof Array && obj[k].length === 0) {
        delete obj[k];
      } else if (obj[k] instanceof Array) {
        for (const l in obj[k]) {
          if (obj[k][l] === null || obj[k][l] === '') {
            delete obj[k][l];
          }
        }
      }
    }
  }

  get(resourceType: string, id: string) {
    id = decodeURIComponent(id);
    return this.http.get(this.base + `/${resourceType}/${id}`, this.options);
  }

  search(urlParameters: URLParameter[]) {
    let searchQuery = new HttpParams();
    for (const urlParameter of urlParameters) {
      for (const value of urlParameter.values) {
        searchQuery = searchQuery.append(urlParameter.key, value);
      }
    }
    searchQuery.delete('to');
    /*return this.http.get(`/service/all${questionMark}${searchQuery.toString()}`).map(res => <SearchResults<Service>> <any> res);*/
    // const questionMark = urlParameters.length > 0 ? '?' : '';
    // return this.http.get<SearchResults<RichService>>(this.base + `/service/rich/all${questionMark}${searchQuery.toString()}`, this.options)
    return this.http.get<Paging<RichService>>(
      this.base + `/deployableService/rich/all?sort=title&order=asc&${searchQuery.toString()}`, this.options);
  }

  getAllVocabulariesByType() {
    return this.http.get<Map<Type, Vocabulary[]>>(this.base + `/vocabulary/byType`);
  }

  getVocabularyByType(type: string) {
    return this.http.get<Vocabulary[]>(this.base + `/vocabulary/byType/${type}`);
  }

  getTerritories() {
    return this.http.get<Vocabulary[]>(this.base + `/vocabulary/getTerritories`);
  }

  getNestedVocabulariesByType(type: string) {
    return this.http.get<VocabularyTree>(this.base + `/vocabulary/vocabularyTree/${type}`);
  }

  getServices() {
    return this.http.get(this.base + '/deployableService/by/ID/'); // needs capitalized 'ID' after back changes
  }

  getService(id: string, catalogueId?: string) {
    id = decodeURIComponent(id);
    if (!catalogueId) catalogueId = this.catalogueConfigId;
    if (catalogueId === this.catalogueConfigId)
      return this.http.get<DeployableService>(this.base + `/deployableService/${id}?catalogue_id=${catalogueId}`, this.options);
    else
      return this.http.get<Service>(this.base + `/catalogue/${catalogueId}/deployableService/${id}`, this.options);
  }

  getDeployableServiceBundle(id: string, catalogueId?:string) { //old rich
    id = decodeURIComponent(id);
    if (!catalogueId) catalogueId = this.catalogueConfigId;
    if (catalogueId === this.catalogueConfigId)
      return this.http.get<DeployableServiceBundle>(this.base + `/deployableService/bundle/${id}?catalogue_id=${catalogueId}`, this.options);
    else
      return this.http.get<DeployableServiceBundle>(this.base + `/catalogue/${catalogueId}/deployableService/bundle/${id}`, this.options);
  }

  getSelectedServices(ids: string[]) {
    /*return this.getSome("service", ids).map(res => <Service[]> <any> res);*/
    // return this.getSome('service/rich', ids).subscribe(res => <RichService[]><any>res);
    return this.http.get<RichService[]>(this.base + `/deployableService/rich/ids/${ids.toString()}/`, this.options);
  }

  deleteDeployableService(id: string) {
    id = decodeURIComponent(id);
    return this.http.delete(this.base + '/deployableService/' + id, this.options);
  }

  getResourceBundles(from: string, quantity: string, sort: string, order: string, query: string, active: string, suspended: string,
                     resource_organisation: string[], status: string[], auditState: string[], catalogue_id: string[]) {
    let params = new HttpParams();
    params = params.append('from', from);
    params = params.append('quantity', quantity);
    params = params.append('sort', sort);
    params = params.append('order', order);
    // params = params.append('active', active);
    if (query && query !== '') {
      params = params.append('keyword', query);
    }
    if (active && active !== '') {
      params = params.append('active', active);
    }
    if (suspended && suspended !== '') {
      params = params.append('suspended', suspended);
    }
    if (resource_organisation && resource_organisation.length > 0) {
      for (const providerValue of resource_organisation) {
        params = params.append('resource_organisation', providerValue);
      }
    }
    if (status && status.length > 0) {
      for (const statusValue of status) {
        params = params.append('status', statusValue);
      }
    }
    if (auditState && auditState.length > 0) {
      for (const auditValue of auditState) {
        params = params.append('auditState', auditValue);
      }
    }
    if (catalogue_id && catalogue_id.length > 0) {
      for (const catalogueValue of catalogue_id) {
        params = params.append('catalogue_id', catalogueValue);
      }
    }
    // } else {
    //   params = params.append('catalogue_id', 'all');
    // }
    return this.http.get<DeployableServiceBundle>(this.base + `/deployableService/bundle/all`, {params});
  }

  getRandomResources(quantity: string) {
    return this.http.get<ServiceBundle[]>(this.base + `/deployableService/randomResources?quantity=${quantity}`, this.options);
  }

  getSharedServicesByProvider(id: string, from: string, quantity: string, order: string, sort: string) {
    id = decodeURIComponent(id);
    return this.http.get<Paging<ServiceBundle>>(this.base +
      `/deployableService/getSharedResources/${id}?from=${from}&quantity=${quantity}&order=${order}&sort=${sort}`);
  }

  getEU() {
    return this.http.get(this.base + '/vocabulary/countries/EU');
  }

  getWW() {
    return this.http.get(this.base + '/vocabulary/countries/WW');
  }

  // this should be somewhere else, I think
  expandRegion(places, eu, ww) {
    const iEU = places.indexOf('EU');
    if (iEU > -1) {
      places.splice(iEU, 1);
      places.push(...eu);
    }
    const iWW = places.indexOf('WW');
    if (iWW > -1) {
      places.splice(iWW, 1);
      places.push(...ww);
    }
    return places;
  }

  submitService(deployableService: DeployableService, shouldPut: boolean, comment: string) {
    // console.log(JSON.stringify(service));
    // console.log(`knocking on: ${this.base}/service`);
    if (!comment && shouldPut) return this.http.put<DeployableService>(this.base + `/deployableService`, deployableService, this.options);
    if (shouldPut) {
      return this.http.put<DeployableService>(this.base + `/deployableService?comment=${comment}`, deployableService, this.options);
    } else {
      return this.http.post<DeployableService>(this.base + `/deployableService?comment=${comment}`, deployableService, this.options);
    }
  }

  /** Draft(Pending) Services -->**/
  saveServiceAsDraft(service: Service) {
    return this.http.put<Service>(this.base + '/pendingService/pending', service, this.options);
  }

  submitPendingService(deployableService: DeployableService, shouldPut: boolean, comment: string) {
    return this.http.put<DeployableService>(this.base + '/pendingService/transform/resource', deployableService, this.options);
  }

  getDraftServicesByProvider(id: string, from: string, quantity: string, order: string, sort: string) {
    id = decodeURIComponent(id);
    return this.http.get<Paging<ServiceBundle>>(this.base +
      `/pendingService/byProvider/${id}?from=${from}&quantity=${quantity}&order=${order}&sort=${sort}`);
  }

  getPendingService(id: string) {
    id = decodeURIComponent(id);
    return this.http.get<DeployableServiceBundle>(this.base + `/pendingService/rich/${id}`, this.options); //not actually used
  }

  deletePendingService(id: string) {
    id = decodeURIComponent(id);
    return this.http.delete(this.base + '/pendingService/' + id, this.options);
  }
  /** <-- Draft(Pending) Services **/

  getServiceLoggingInfoHistory(serviceId: string, catalogue_id: string) {
    serviceId = decodeURIComponent(serviceId);
    if (catalogue_id === this.catalogueConfigId)
      return this.http.get<LoggingInfo[]>(this.base + `/deployableService/loggingInfoHistory/${serviceId}?catalogue_id=${catalogue_id}`);
    else
      return this.http.get<LoggingInfo[]>(this.base + `/catalogue/${catalogue_id}/deployableService/loggingInfoHistory/${serviceId}`);
  }

  auditDeployableService(id: string, action: string, catalogueId: string, comment: string) {
    id = decodeURIComponent(id);
    if(!catalogueId) catalogueId = this.catalogueConfigId;
    if (catalogueId === this.catalogueConfigId)
      return this.http.patch(this.base + `/deployableService/audit/${id}?actionType=${action}&catalogueId=${catalogueId}&comment=${comment}`, this.options);
    else
      return this.http.patch(this.base + `/catalogue/${catalogueId}/deployableService/audit/${id}?actionType=${action}&comment=${comment}`, this.options);
  }

  verifyDeployableService(id: string, active: boolean, status: string) { // for 1st service
    id = decodeURIComponent(id);
    return this.http.patch(this.base + `/deployableService/verify/${id}?active=${active}&status=${status}`, {}, this.options);
  }

  getServiceTemplate(id: string) {  // gets oldest(?) pending resource of the provider // replaced with /resourceTemplateBundles/templates?id=testprovidertemplate
    id = decodeURIComponent(id);
    return this.http.get<Service[]>(this.base + `/deployableService/getServiceTemplate/${id}`);
  }

  getResourceTemplateOfProvider(id: string) {  // returns the template, service or datasource
    id = decodeURIComponent(id);
    return this.http.get<any[]>(this.base + `/resourceTemplateBundles/templates?id=${id}`);
  }

  sendEmailForOutdatedDeployableService(id: string) {
    id = decodeURIComponent(id);
    return this.http.get(this.base + `/deployableService/sendEmailForOutdatedResource/${id}`);
  }

  moveDeployableServiceToProvider(resourceId: string, providerId: string, comment: string) {
    resourceId = decodeURIComponent(resourceId);
    return this.http.post(this.base + `/deployableService/changeProvider?resourceId=${resourceId}&newProvider=${providerId}&comment=${comment}`, this.options);
  }

  public handleError(error: HttpErrorResponse) {
    // const message = 'Server error';
    const message = error.error;
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

  publishDeployableService(id: string, active: boolean) { // toggles active/inactive service
    id = decodeURIComponent(id);
    return this.http.patch(this.base + `/deployableService/publish/${id}?active=${active}`, this.options);
  }

  suspendDeployableService(deployableServiceId: string, catalogueId: string, suspend: boolean) {
    deployableServiceId = decodeURIComponent(deployableServiceId);
    return this.http.put<DeployableServiceBundle>(this.base + `/deployableService/suspend?id=${deployableServiceId}&catalogueId=${catalogueId}&suspend=${suspend}`, this.options);
  }

  getFormModelById(id: string) {
    return this.http.get<Model>(this.base + `/forms/models/${id}`);
  }

  getDeployableServicesOfProvider(id: string, catalogue_id: string, from: string, quantity: string, order: string, sort: string, active: string, status?: string, query?: string) {
    id = decodeURIComponent(id);
    if (!query) { query = ''; }
    let params = new HttpParams();
    if (status && status.length > 0) {
      for (const statusValue of status) {
        params = params.append('status', statusValue);
      }
    } else {
      const allStatus = ["approved","pending","rejected"];
      for (const statusValue of allStatus) {
        params = params.append('status', statusValue);
      }
    }
    if (catalogue_id === this.catalogueConfigId) {
      if (active === 'statusAll') {
        return this.http.get<Paging<DeployableServiceBundle>>(this.base +
            `/deployableService/byProvider/${id}?catalogue_id=${catalogue_id}&from=${from}&quantity=${quantity}&order=${order}&sort=${sort}&keyword=${query}`, {params});
      }
      return this.http.get<Paging<DeployableServiceBundle>>(this.base +
          `/deployableService/byProvider/${id}?catalogue_id=${catalogue_id}&from=${from}&quantity=${quantity}&order=${order}&sort=${sort}&active=${active}&keyword=${query}`, {params});
    } else {
      return this.http.get<Paging<DeployableServiceBundle>>(this.base +
          `/catalogue/${catalogue_id}/${id}/deployableService/bundle/all?from=${from}&quantity=${quantity}&order=${order}&sort=${sort}&keyword=${query}`, {params});
    }
  }
}
