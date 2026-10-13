import {Injectable} from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {environment} from '../../environments/environment';
import {
  Indicator,
  VocabularyTree,
  Provider,
  RichService,
  Service,
  Vocabulary,
  Type, ServiceBundle, LoggingInfo, Bundle, TrainingResourceBundle
} from '../domain/eic-model';
import {BrowseResults} from '../domain/browse-results';
import {Paging} from '../domain/paging';
import {Observable, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {Model} from "../../dynamic-catalogue/domain/dynamic-form-model";

declare let UIkit: any;

@Injectable()
export class ResourceService {

  constructor(public http: HttpClient, public authenticationService: AuthenticationService) {}
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
        ResourceService.removeNulls(obj[k]);
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

  getAll(resourceType: string) {
    let params = new HttpParams();
    params = params.append('from', '0');
    params = params.append('quantity', '10000');
    return this.http.get(this.base + `/${resourceType}/all`, {params});
  }

  getAllIndicators(resourceType: string) {
    let params = new HttpParams();
    params = params.append('from', '0');
    params = params.append('quantity', '10000');
    return this.http.get<Paging<Indicator>>(this.base + `/${resourceType}/all`, {params});
  }

  getBy(resourceType: string, resourceField: string) {
    return this.http.get(this.base + `/${resourceType}/by/${resourceField}/`);
  }

  getSome(resourceType: string, ids: string[]) {
    return this.http.get(this.base + `/${resourceType}/byID/${ids.toString()}/`);
  }

  get(resourceType: string, id: string) {
    id = decodeURIComponent(id);
    return this.http.get(this.base + `/${resourceType}/${id}`, this.options);
  }

/*  search(urlParameters: URLParameter[]) {
    let searchQuery = new HttpParams();
    for (const urlParameter of urlParameters) {
      for (const value of urlParameter.values) {
        searchQuery = searchQuery.append(urlParameter.key, value);
      }
    }
    searchQuery.delete('to');
    //return this.http.get(`/service/all${questionMark}${searchQuery.toString()}`).map(res => <SearchResults<Service>> <any> res);
    // const questionMark = urlParameters.length > 0 ? '?' : '';
    // return this.http.get<SearchResults<RichService>>(this.base + `/service/rich/all${questionMark}${searchQuery.toString()}`, this.options)
    return this.http.get<Paging<RichService>>(
      this.base + `/service/rich/all?sort=name&order=asc&${searchQuery.toString()}`, this.options);
  }*/

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
    return this.http.get(this.base + '/service/by/ID/'); // can get services by any field, like ID (capitalized)
  }

  getServicesByCategories() {
    return this.http.get<BrowseResults>(this.base + '/service/by/category/');
  }

  // getResourcesAsVocs(catalogueId: string, resourceType?: string){
  //   return this.http.get(this.base + `/reference/idToNameMap?catalogueId=${catalogueId}&resourceType=${resourceType}`);
  // }

  getService(serviceId: string) { // can handle public ids too
    serviceId = decodeURIComponent(serviceId);
    return this.http.get<Service>(this.base + `/service/${serviceId}`, this.options);
  }

  getRichService(id: string, catalogueId?:string, version?: string) { //deprecated
    if (!catalogueId) catalogueId = null;
    return this.http.get<RichService>(this.base + `/service/rich/${id}`, this.options);
    // return this.http.get<RichService>(this.base + `/service/rich/${version === undefined ? id : [id, version].join('/')}/`, this.options);
  }

/*  getSelectedServices(ids: string[]) {
    /!*return this.getSome("service", ids).map(res => <Service[]> <any> res);*!/
    // return this.getSome('service/rich', ids).subscribe(res => <RichService[]><any>res);
    return this.http.get<RichService[]>(this.base + `/service/rich/ids/${ids.toString()}/`, this.options);
  }*/

  getMultipleResourcesById(commaSeparatedIds: string) { //feed with public ids (or not) of services, datasources, and training resources; returns only if resource exist; NOT bundles
    commaSeparatedIds = decodeURIComponent(commaSeparatedIds);
    return this.http.get<any[]>(this.base + `/service/ids?ids=${commaSeparatedIds}`, this.options);
  }

/*  getServicesOfferedByProvider(id: string): Observable<RichService[]> {
    return this.search([{key: 'quantity', values: ['100']}, {key: 'provider', values: [id]}]).pipe(
      map(res => Object.values(res.results))
    );
  }*/

  deleteService(id: string) {
    id = decodeURIComponent(id);
    return this.http.delete(this.base + '/service/' + id, this.options);
  }

  deleteDatasource(id: string) {
    id = decodeURIComponent(id);
    return this.http.delete(this.base + '/datasource/' + id, this.options);
  }

  /** STATS **/
  //TODO: enable when back transitions its API calls

  // getVisitsForProvider(provider: string, period?: string) {
  //   let params = new HttpParams();
  //   if (period) {
  //     params = params.append('by', period);
  //     return this.http.get(this.base + `/stats/provider/visits/${provider}`, {params});
  //   } else {
  //     return this.http.get(this.base + `/stats/provider/visits/${provider}`);
  //   }
  // }

  // getAddsToProjectForProvider(provider: string, period?: string) {
  //   let params = new HttpParams();
  //   if (period) {
  //     params = params.append('by', period);
  //     return this.http.get(this.base + `/stats/provider/addToProject/${provider}`, {params});
  //   } else {
  //     return this.http.get(this.base + `/stats/provider/addToProject/${provider}`);
  //   }
  // }

  getCategoriesPerServiceForProvider(provider?: string) {
    let params = new HttpParams();
    if (provider) {
      params = params.append('providerId', decodeURIComponent(provider));
      return this.http.get(this.base + `/stats/provider/mapServicesToVocabulary?vocabulary=subcategories`, {params});
    } else {
      return this.http.get(this.base + `/stats/provider/mapServicesToVocabulary?vocabulary=subcategories`);
    }
  }

  getDomainsPerServiceForProvider(provider?: string) {
    let params = new HttpParams();
    if (provider) {
      params = params.append('providerId', decodeURIComponent(provider));
      return this.http.get(this.base + `/stats/provider/mapServicesToVocabulary?vocabulary=scientific_subdomains`, {params});
    } else {
      return this.http.get(this.base + `/stats/provider/mapServicesToVocabulary?vocabulary=scientific_subdomains`);
    }
  }

  getOrderTypesPerServiceForProvider(provider?: string) {
    let params = new HttpParams();
    if (provider) {
      params = params.append('providerId', decodeURIComponent(provider));
      return this.http.get(this.base + `/stats/provider/mapServicesToVocabulary?vocabulary=order_type`, {params});
    } else {
      return this.http.get(this.base + `/stats/provider/mapServicesToVocabulary?vocabulary=order_type`);
    }
  }

  getVisitationPercentageForProvider(provider: string) {
    return this.get('stats/provider/visitation', provider);
  }

  // getPlacesForProvider(provider: string) {
  //   return this.getServicesOfferedByProvider(provider);
  // }

  //TODO: enable when back transitions its API calls

  // getVisitsForService(service: string, period?: string) {
  //   let params = new HttpParams();
  //   if (period) {
  //     params = params.append('by', period);
  //     return this.http.get(this.base + `/stats/service/visits/${service}`, {params});
  //   }
  //   return this.http.get(this.base + `/stats/service/visits/${service}`);
  // }

  // getAddToProjectForService(service: string, period?: string) {
  //   let params = new HttpParams();
  //   if (period) {
  //     params = params.append('by', period);
  //     return this.http.get(this.base + `/stats/service/addToProject/${service}`, {params});
  //   }
  //   return this.http.get(this.base + `/stats/service/addToProject/${service}`);
  // }
  /** STATS **/

  /** Indicators **/
  postIndicator(indicator: Indicator) {
    return this.http.post(this.base + '/indicator', indicator, this.options);
  }
  /** Indicators **/

  // groupServicesOfProviderPerPlace(id: string) {
  //   return this.getServicesOfferedByProvider(id).subscribe(res => {
  //     const servicesGroupedByPlace = {};
  //     for (const service of res) {
  //       for (const place of service.places) {
  //         if (servicesGroupedByPlace[place]) {
  //           servicesGroupedByPlace[place].push(res);
  //         } else {
  //           servicesGroupedByPlace[place] = [];
  //         }
  //       }
  //     }
  //     return servicesGroupedByPlace;
  //   });
  // }

  getProvidersNames(status?: string) {
    let params = new HttpParams();
    params = params.append('from', '0');
    params = params.append('quantity', '10000');
    if (status === 'approved') { //not matched hence never reached, do we need approved providers or all?
      return this.http.get<Paging<Provider>>(this.base + `/provider/all?status=approved`, {params, withCredentials: true});
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

  getProviderBundles(from: string, quantity: string, sort: string, order: string, query: string, active: string, suspended: string,
                     status: string[], templateStatus: string[], auditState: string[], catalogue_id: string[]) {
    let params = new HttpParams();
    params = params.append('from', from);
    params = params.append('quantity', quantity);
    if (sort) {
      params = params.append('sort', sort);
    }
    if (order) {
      params = params.append('order', order);
    }
    if (query && query !== '') {
      params = params.append('keyword', query);
    }
    if (active && active !== '') {
      params = params.append('active', active);
    }
    if (suspended && suspended !== '') {
      params = params.append('suspended', suspended);
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
                     resource_organisation: string[], status: string[], auditState: string[], catalogue_id?: string[]) {
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
        params = params.append('audit_state', auditValue);
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
    return this.http.get<Bundle<Service>>(this.base + `/service/adminPage/all`, {params});
  }

  getServiceBundleById(id: string) {
    id = decodeURIComponent(id);
    return this.http.get<ServiceBundle>(this.base + `/service/bundle/${id}`, this.options);
  }

  getRandomResources(quantity: string) {
    return this.http.get<ServiceBundle[]>(this.base + `/service/random?quantity=${quantity}`, this.options);
  }

  getSharedServicesByProvider(id: string, from: string, quantity: string, order: string, sort: string) {
    id = decodeURIComponent(id);
    return this.http.get<Paging<ServiceBundle>>(this.base +
      `/service/getSharedResources/${id}?from=${from}&quantity=${quantity}&order=${order}&sort=${sort}`);
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

  submitService(service: Service, shouldPut: boolean, comment: string) {
    // console.log(JSON.stringify(service));
    // console.log(`knocking on: ${this.base}/service`);
    if (shouldPut) {
      return this.http.put<Service>(this.base + `/service?comment=${comment}`, service, this.options);
    } else {
      return this.http.post<Service>(this.base + `/service?comment=${comment}`, service, this.options);
    }
  }

  /** Draft(Pending) Services -->**/
  temporarySaveService(service: Service) {
    const serviceExists = !!service.id;
    if (serviceExists) {
      return this.http.put<Service>(this.base + '/service/draft', service, this.options);
    }
    return this.http.post<Service>(this.base + '/service/draft', service, this.options);
  }

  submitPendingService(service: Service) {
    return this.http.put<Service>(this.base + '/service/draft/transform', service, this.options);
  }

  getDraftServicesByProvider(id: string, from: string, quantity: string, order: string, sort: string) {
    id = decodeURIComponent(id);
    return this.http.get<Paging<ServiceBundle>>(this.base +
      `/service/draft/byProvider/${id}?from=${from}&quantity=${quantity}&order=${order}&sort=${sort}`);
  }

  getPendingService(id: string) {
    id = decodeURIComponent(id);
    return this.http.get<any>(this.base + `/service/draft/${id}`, this.options); //was richService. Could change response to Service and use along with getService
  }

  deletePendingService(id: string) {
    id = decodeURIComponent(id);
    return this.http.delete(this.base + '/service/draft/' + id, this.options);
  }
  /** <-- Draft(Pending) Services **/

  getServiceLoggingInfoHistory(serviceId: string) {
    serviceId = decodeURIComponent(serviceId);
    return this.http.get<LoggingInfo[]>(this.base + `/service/loggingInfoHistory/${serviceId}`);
  }

  verifyResource(id: string, active: boolean, status: string) { // for 1st service
    id = decodeURIComponent(id);
    return this.http.patch(this.base + `/service/verify/${id}?active=${active}&status=${status}`, {}, this.options);
  }

  getServiceTemplate(id: string) {  // gets oldest(?) pending resource of the provider // replaced with /resourceTemplate/templates?id=testprovidertemplate
    id = decodeURIComponent(id);
    return this.http.get<Service[]>(this.base + `/resource/getServiceTemplate/${id}`);
  }

  getResourceTemplateOfProvider(id: string) {  // returns the template, service or datasource
    id = decodeURIComponent(id);
    return this.http.get<any[]>(this.base + `/resourceTemplate/templates?id=${id}`);
  }

  sendEmailForOutdatedResource(id: string) {
    id = decodeURIComponent(id);
    return this.http.get(this.base + `/service/sendEmailForOutdatedResource/${id}`);
  }

  moveResourceToProvider(resourceId: string, providerId: string, comment: string) {
    resourceId = decodeURIComponent(resourceId);
    return this.http.put(this.base + `/service/changeProvider?resourceId=${resourceId}&newProvider=${providerId}&comment=${comment}`, {}, this.options);
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

  auditService(id: string, action: string, catalogueId: string, comment: string) {
    id = decodeURIComponent(id);
    if (catalogueId == null)
      return this.http.patch(this.base + `/service/audit/${id}?actionType=${action}&comment=${comment}`, {}, this.options);
    else
      return this.http.patch(this.base + `/catalogue/${catalogueId}/service/audit/${id}?actionType=${action}&comment=${comment}`, {}, this.options);
  }

  suspendService(serviceId: string, catalogueId: string, suspend: boolean): Observable<any> {
    serviceId = decodeURIComponent(serviceId);
    if (catalogueId == null)
      return this.http.put<ServiceBundle>(this.base + `/service/suspend?id=${serviceId}&catalogueId=${catalogueId}&suspend=${suspend}`, this.options);
    else
      return this.http.put<TrainingResourceBundle>(this.base + `/catalogue/${catalogueId}/service/suspend/${serviceId}?suspend=${suspend}`, this.options);
  }

  getFormModelById(id: string) {
    return this.http.get<Model>(this.base + `/forms/models/${id}`);
  }
}
