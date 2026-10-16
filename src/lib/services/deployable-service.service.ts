import {Injectable} from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {environment} from '../../environments/environment';
import {
  VocabularyTree,
  RichService,
  Service,
  Vocabulary,
  Type, ServiceBundle, LoggingInfo, DeployableServiceBundle, DeployableService, TrainingResourceBundle,
} from '../domain/eic-model';
import {BrowseResults} from '../domain/browse-results';
import {Paging} from '../domain/paging';
import {URLParameter} from '../domain/url-parameter';
import {throwError} from 'rxjs';
import {Model} from "../../dynamic-catalogue/domain/dynamic-form-model";
import {ConfigService} from "./config.service";

declare let UIkit: any;

@Injectable()
export class DeployableServiceService {

  constructor(public http: HttpClient, public authenticationService: AuthenticationService, private configService: ConfigService) {}

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
      this.base + `/deployableApplication/rich/all?sort=title&order=asc&${searchQuery.toString()}`, this.options);
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
    return this.http.get(this.base + '/deployableApplication/by/ID/'); // needs capitalized 'ID' after back changes
  }

  getService(id: string) {
    id = decodeURIComponent(id);
    return this.http.get<DeployableService>(this.base + `/deployableApplication/${id}`, this.options);
  }

  getDeployableServiceBundle(id: string) { //old rich
    id = decodeURIComponent(id);
    return this.http.get<DeployableServiceBundle>(this.base + `/deployableApplication/bundle/${id}`, this.options);
  }

  getSelectedServices(ids: string[]) {
    /*return this.getSome("service", ids).map(res => <Service[]> <any> res);*/
    // return this.getSome('service/rich', ids).subscribe(res => <RichService[]><any>res);
    return this.http.get<RichService[]>(this.base + `/deployableApplication/rich/ids/${ids.toString()}/`, this.options);
  }

  deleteDeployableService(id: string) {
    id = decodeURIComponent(id);
    return this.http.delete(this.base + '/deployableApplication/' + id, this.options);
  }

  getResourceBundles(from: string, quantity: string, sort: string, order: string, query: string, active: string, suspended: string,
                     resource_organisation: string[], status: string[], auditState: string[], catalogue_id: string[]) {
    let params = new HttpParams();
    params = params.append('from', from);
    params = params.append('quantity', quantity);
    if (sort) {
      params = params.append('sort', sort);
    }
    if (order) {
      params = params.append('order', order);
    }
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
    return this.http.get<DeployableServiceBundle>(this.base + `/deployableApplication/bundle/all`, {params});
  }

  getRandomResources(quantity: string) {
    return this.http.get<ServiceBundle[]>(this.base + `/deployableApplication/random?quantity=${quantity}`, this.options);
  }

  getSharedServicesByProvider(id: string, from: string, quantity: string, order: string, sort: string) {
    id = decodeURIComponent(id);
    return this.http.get<Paging<ServiceBundle>>(this.base +
      `/deployableApplication/getSharedResources/${id}?from=${from}&quantity=${quantity}&order=${order}&sort=${sort}`);
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

  submitService(deployableApplication: DeployableService, shouldPut: boolean, comment: string) {
    // console.log(JSON.stringify(service));
    // console.log(`knocking on: ${this.base}/service`);
    if (!comment && shouldPut) return this.http.put<DeployableService>(this.base + `/deployableApplication`, deployableApplication, this.options);
    if (shouldPut) {
      return this.http.put<DeployableService>(this.base + `/deployableApplication?comment=${comment}`, deployableApplication, this.options);
    } else {
      return this.http.post<DeployableService>(this.base + `/deployableApplication?comment=${comment}`, deployableApplication, this.options);
    }
  }

  /** Draft(Pending) Services -->**/
  saveServiceAsDraft(service: Service) {
    return this.http.put<Service>(this.base + '/pendingService/pending', service, this.options);
  }

  submitPendingService(deployableApplication: DeployableService, shouldPut: boolean, comment: string) {
    return this.http.put<DeployableService>(this.base + '/pendingService/transform/resource', deployableApplication, this.options);
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

  getServiceLoggingInfoHistory(serviceId: string) {
    serviceId = decodeURIComponent(serviceId);
    return this.http.get<LoggingInfo[]>(this.base + `/deployableApplication/loggingInfoHistory/${serviceId}`);
  }

  verifyDeployableService(id: string, active: boolean, status: string) { // for 1st service
    id = decodeURIComponent(id);
    return this.http.patch(this.base + `/deployableApplication/verify/${id}?active=${active}&status=${status}`, {}, this.options);
  }

  getServiceTemplate(id: string) {  // gets oldest(?) pending resource of the provider // replaced with /resourceTemplate/templates?id=testprovidertemplate
    id = decodeURIComponent(id);
    return this.http.get<Service[]>(this.base + `/deployableApplication/getServiceTemplate/${id}`);
  }

  getResourceTemplateOfProvider(id: string) {  // returns the template, service or datasource
    id = decodeURIComponent(id);
    return this.http.get<any[]>(this.base + `/resourceTemplate/templates?id=${id}`);
  }

  sendEmailForOutdatedDeployableService(id: string) {
    id = decodeURIComponent(id);
    return this.http.get(this.base + `/deployableApplication/sendEmailForOutdatedResource/${id}`);
  }

  moveDeployableServiceToProvider(resourceId: string, providerId: string, comment: string) {
    resourceId = decodeURIComponent(resourceId);
    return this.http.put(this.base + `/deployableApplication/changeProvider?resourceId=${resourceId}&newProvider=${providerId}&comment=${comment}`, {}, this.options);
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

  activateDeployableService(id: string, active: boolean) { // toggles active/inactive service
    id = decodeURIComponent(id);
    return this.http.patch(this.base + `/deployableApplication/setActive/${id}?active=${active}`, {}, this.options);
  }

  auditDeployableService(id: string, action: string, catalogueId: string, comment: string) {
    id = decodeURIComponent(id);
    if (catalogueId == null)
      return this.http.patch(this.base + `/deployableApplication/audit/${id}?actionType=${action}&comment=${comment}`, {}, this.options);
    else
      return this.http.patch(this.base + `/catalogue/${catalogueId}/deployableApplication/audit/${id}?actionType=${action}&comment=${comment}`, {}, this.options);
  }

  suspendDeployableService(deployableServiceId: string, catalogueId: string, suspend: boolean) {
    deployableServiceId = decodeURIComponent(deployableServiceId);
    if (catalogueId == null)
      return this.http.put<DeployableServiceBundle>(this.base + `/deployableApplication/suspend?id=${deployableServiceId}&suspend=${suspend}`, this.options);
    else
      return this.http.put<DeployableServiceBundle>(this.base + `/catalogue/${catalogueId}/deployableApplication/suspend/${deployableServiceId}?suspend=${suspend}`, this.options);
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
    if (catalogue_id == null) {
      if (active === 'statusAll') {
        return this.http.get<Paging<DeployableServiceBundle>>(this.base +
            `/deployableApplication/byProvider/${id}?from=${from}&quantity=${quantity}&order=${order}&sort=${sort}&keyword=${query}`, {params});
      }
      return this.http.get<Paging<DeployableServiceBundle>>(this.base +
          `/deployableApplication/byProvider/${id}?from=${from}&quantity=${quantity}&order=${order}&sort=${sort}&active=${active}&keyword=${query}`, {params});
    } else { //external catalogue
      return this.http.get<Paging<DeployableServiceBundle>>(this.base +
          `/catalogue/${catalogue_id}/${id}/deployableApplication/bundle/all?from=${from}&quantity=${quantity}&order=${order}&sort=${sort}&keyword=${query}`, {params});
    }
  }
}
