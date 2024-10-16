import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {environment} from '../../environments/environment';
import {
  Indicator,
  VocabularyTree,
  Provider,
  RichService,
  Service,
  ServiceHistory,
  Vocabulary,
  Type, ServiceBundle, LoggingInfo, TrainingResourceBundle, TrainingResource, Bundle
} from '../domain/eic-model';
import {BrowseResults} from '../domain/browse-results';
import {Paging} from '../domain/paging';
import {URLParameter} from '../domain/url-parameter';
import {Observable, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';

declare var UIkit: any;


@Injectable()
export class TrainingResourceService {

  constructor(public http: HttpClient, public authenticationService: AuthenticationService) {
  }
  base = environment.API_ENDPOINT;
  private options = {withCredentials: true};

  static removeNulls(obj) {
    const isArray = obj instanceof Array;
    for (const k in obj) {
      if (obj[k] === null || obj[k] === '') {
        isArray ? obj.splice(k, 1) : delete obj[k];
      } else if (typeof obj[k] === 'object') {
        if (typeof obj[k].value !== 'undefined' && typeof obj[k].lang !== 'undefined') {
          if (obj[k].value === '' && obj[k].lang === 'en') {
            obj[k].lang = '';
          }
        }
        TrainingResourceService.removeNulls(obj[k]);
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
      this.base + `/trainingResource/rich/all?sort=title&order=asc&${searchQuery.toString()}`, this.options);
  }

  getAllVocabulariesByType() {
    return this.http.get<Map<Type, Vocabulary[]>>(this.base + `/vocabulary/byType`);
  }

  getVocabularyByType(type: string) {
    return this.http.get<Vocabulary[]>(this.base + `/vocabulary/byType/${type}`);
  }

  getNestedVocabulariesByType(type: string) {
    return this.http.get<VocabularyTree>(this.base + `/vocabulary/vocabularyTree/${type}`);
  }

  getServices() {
    return this.http.get(this.base + '/trainingResource/by/ID/'); // needs capitalized 'ID' after back changes
  }

  getService(id: string, catalogueId?: string) {
    id = decodeURIComponent(id);
    // if version becomes optional this should be reconsidered
    // return this.http.get<Service>(this.base + `/service/${version === undefined ? id : [id, version].join('/')}`, this.options);
    if (!catalogueId) catalogueId = 'eosc';
    return this.http.get<TrainingResource>(this.base + `/trainingResource/${id}?catalogue_id=${catalogueId}`, this.options);
  }

  getTrainingResourceBundle(id: string, catalogueId?:string) { //old rich
    id = decodeURIComponent(id);
    if (!catalogueId) catalogueId = 'eosc';
    return this.http.get<TrainingResourceBundle>(this.base + `/trainingResource/bundle/${id}?catalogue_id=${catalogueId}`, this.options);
  }

  getSelectedServices(ids: string[]) {
    /*return this.getSome("service", ids).map(res => <Service[]> <any> res);*/
    // return this.getSome('service/rich', ids).subscribe(res => <RichService[]><any>res);
    return this.http.get<RichService[]>(this.base + `/trainingResource/rich/ids/${ids.toString()}/`, this.options);
  }

  getServicesByCategories() {
    return this.http.get<BrowseResults>(this.base + '/trainingResource/by/category/');
  }

  // getServicesOfferedByProvider(id: string): Observable<RichService[]> {
  //   return this.search([{key: 'quantity', values: ['100']}, {key: 'provider', values: [id]}]).pipe(
  //     map(res => Object.values(res.results))
  //   );
  // }

  deleteTrainingResource(id: string) {
    id = decodeURIComponent(id);
    return this.http.delete(this.base + '/trainingResource/' + id, this.options);
  }

  /** STATS **/

  getVisitsForService(service: string, period?: string) {
    let params = new HttpParams();
    if (period) {
      params = params.append('by', period);
      return this.http.get(this.base + `/stats/trainingResource/visits/${service}`, {params});
    }
    return this.http.get(this.base + `/stats/trainingResource/visits/${service}`);
  }

  getAddToProjectForService(service: string, period?: string) {
    let params = new HttpParams();
    if (period) {
      params = params.append('by', period);
      return this.http.get(this.base + `/stats/trainingResource/addToProject/${service}`, {params});
    }
    return this.http.get(this.base + `/stats/trainingResource/addToProject/${service}`);
  }
  /** STATS **/

  getProvidersNames(status?: string) {
    let params = new HttpParams();
    params = params.append('from', '0');
    params = params.append('quantity', '10000');
    if (status === 'approved provider') {
      return this.http.get<Paging<Provider>>(this.base + `/provider/all?status=approved provider`, {params, withCredentials: true});
    }
    return this.http.get<Paging<Provider>>(this.base + `/provider/all`, {params, withCredentials: true});
  }

  getProviders(from: string, quantity: string) {
    let params = new HttpParams();
    params = params.append('from', from);
    params = params.append('quantity', quantity);
    params = params.append('sort', 'creation_date');
    params = params.append('order', 'desc');
    return this.http.get(this.base + `/provider/all`, {params});
    // return this.getAll("provider");
  }

  getProviderBundles(from: string, quantity: string, sort: string, order: string, query: string,
                     status: string[], templateStatus: string[], auditState: string[], catalogue_id: string[]) {
    let params = new HttpParams();
    params = params.append('from', from);
    params = params.append('quantity', quantity);
    params = params.append('sort', sort);
    params = params.append('order', order);
    if (query && query !== '') {
      params = params.append('keyword', query);
    }
    if (status && status.length > 0) {
      for (const statusValue of status) {
        params = params.append('status', statusValue);
      }
    }
    if (templateStatus && templateStatus.length > 0) {
      for (const templateStatusValue of templateStatus) {
        params = params.append('templateStatus', templateStatusValue);
      }
    }
    if (auditState && auditState.length > 0) {
      for (const auditValue of auditState) {
        params = params.append('audit_state', auditValue);
      }
    }
    if (catalogue_id && catalogue_id.length > 0) {
      for (const catalogueValue of catalogue_id) {
        params = params.append('catalogue_id', catalogueValue);
      }
    }
    // } else params = params.append('catalogue_id', 'all');
    return this.http.get(this.base + `/provider/bundle/all`, {params});
    // return this.getAll("provider");
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
    return this.http.get<TrainingResourceBundle>(this.base + `/trainingResource/adminPage/all`, {params});
  }

  getRandomResources(quantity: string) {
    return this.http.get<ServiceBundle[]>(this.base + `/trainingResource/randomResources?quantity=${quantity}`, this.options);
  }

  getSharedServicesByProvider(id: string, from: string, quantity: string, order: string, sort: string) {
    id = decodeURIComponent(id);
    return this.http.get<Paging<ServiceBundle>>(this.base +
      `/trainingResource/getSharedResources/${id}?from=${from}&quantity=${quantity}&order=${order}&sort=${sort}`);
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

  submitService(trainingResource: TrainingResource, shouldPut: boolean, comment: string) {
    // console.log(JSON.stringify(service));
    // console.log(`knocking on: ${this.base}/service`);
    if (!comment && shouldPut) return this.http.put<TrainingResource>(this.base + `/trainingResource`, trainingResource, this.options);
    return this.http[shouldPut ? 'put' : 'post']<TrainingResource>(this.base + `/trainingResource?comment=${comment}`, trainingResource, this.options);
  }

  /** Draft(Pending) Services -->**/
  saveServiceAsDraft(service: Service) {
    return this.http.put<Service>(this.base + '/pendingService/pending', service, this.options);
  }

  submitPendingService(trainingResource: TrainingResource, shouldPut: boolean, comment: string) {
    return this.http.put<TrainingResource>(this.base + '/pendingService/transform/resource', trainingResource, this.options);
  }

  getDraftServicesByProvider(id: string, from: string, quantity: string, order: string, sort: string) {
    id = decodeURIComponent(id);
    return this.http.get<Paging<ServiceBundle>>(this.base +
      `/pendingService/byProvider/${id}?from=${from}&quantity=${quantity}&order=${order}&sort=${sort}`);
  }

  getPendingService(id: string) {
    id = decodeURIComponent(id);
    return this.http.get<TrainingResourceBundle>(this.base + `/pendingService/rich/${id}`, this.options); //not actually used
  }

  deletePendingService(id: string) {
    id = decodeURIComponent(id);
    return this.http.delete(this.base + '/pendingService/' + id, this.options);
  }
  /** <-- Draft(Pending) Services **/

  getServiceHistory(serviceId: string) {
    serviceId = decodeURIComponent(serviceId);
    return this.http.get<Paging<ServiceHistory>>(this.base + `/trainingResource/history/${serviceId}/`);
  }

  getServiceLoggingInfoHistory(serviceId: string, catalogue_id: string) {
    serviceId = decodeURIComponent(serviceId);
    // return this.http.get<Paging<LoggingInfo>>(this.base + `/resource/loggingInfoHistory/${serviceId}/`);
    return this.http.get<Paging<LoggingInfo>>(this.base + `/trainingResource/loggingInfoHistory/${serviceId}?catalogue_id=${catalogue_id}`);
  }

  auditTrainingResource(id: string, action: string, catalogueId: string, comment: string) {
    id = decodeURIComponent(id);
    return this.http.patch(this.base + `/trainingResource/auditResource/${id}?actionType=${action}&catalogueId=${catalogueId}&comment=${comment}`, this.options);
  }

  verifyTrainingResource(id: string, active: boolean, status: string) { // for 1st service
    id = decodeURIComponent(id);
    return this.http.patch(this.base + `/trainingResource/verifyTrainingResource/${id}?active=${active}&status=${status}`, {}, this.options);
  }

  getServiceTemplate(id: string) {  // gets oldest(?) pending resource of the provider // replaced with /resourceTemplateBundles/templates?id=testprovidertemplate
    id = decodeURIComponent(id);
    return this.http.get<Service[]>(this.base + `/trainingResource/getServiceTemplate/${id}`);
  }

  getResourceTemplateOfProvider(id: string) {  // returns the template, service or datasource
    id = decodeURIComponent(id);
    return this.http.get<any[]>(this.base + `/resourceTemplateBundles/templates?id=${id}`);
  }

  sendEmailForOutdatedTrainingResource(id: string) {
    id = decodeURIComponent(id);
    return this.http.get(this.base + `/trainingResource/sendEmailForOutdatedResource/${id}`);
  }

  moveTrainingResourceToProvider(resourceId: string, providerId: string, comment: string) {
    resourceId = decodeURIComponent(resourceId);
    return this.http.post(this.base + `/trainingResource/changeProvider?resourceId=${resourceId}&newProvider=${providerId}&comment=${comment}`, this.options);
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

  publishTrainingResource(id: string, active: boolean) { // toggles active/inactive service
    id = decodeURIComponent(id);
    return this.http.patch(this.base + `/trainingResource/publish/${id}?active=${active}`, this.options);
  }

  suspendTrainingResource(trainingResourceId: string, catalogueId: string, suspend: boolean) {
    trainingResourceId = decodeURIComponent(trainingResourceId);
    return this.http.put<TrainingResourceBundle>(this.base + `/trainingResource/suspend?trainingResourceId=${trainingResourceId}&catalogueId=${catalogueId}&suspend=${suspend}`, this.options);
  }
}
