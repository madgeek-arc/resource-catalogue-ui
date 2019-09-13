import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {environment} from '../../environments/environment';
import {Indicator, Measurement, Provider, RichService, Service, ServiceHistory, Vocabulary} from '../domain/eic-model';
import {IndicatorsPage, MeasurementsPage} from '../domain/indicators';
import {BrowseResults} from '../domain/browse-results';
import {SearchResults} from '../domain/search-results';
import {ProvidersPage} from '../domain/funders-page';
import {URLParameter} from '../domain/url-parameter';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/internal/operators/catchError';
import {from} from 'rxjs/internal/observable/from';
import {map} from 'rxjs/operators';
import {Info} from '../../../projects/EOSC/src/app/domain/info';

declare var UIkit: any;


@Injectable()
export class ResourceService {
  base = environment.API_ENDPOINT;
  private options = {withCredentials: true};

  constructor(public http: HttpClient, public authenticationService: AuthenticationService) {
  }

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
        ResourceService.removeNulls(obj[k]);
      }
      if (obj[k] instanceof Array && obj[k].length === 0) {
        delete obj[k];
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
    return this.http.get<IndicatorsPage>(this.base + `/${resourceType}/all`, {params});
  }

  getBy(resourceType: string, resourceField: string) {
    return this.http.get(this.base + `/${resourceType}/by/${resourceField}/`);
  }

  getSome(resourceType: string, ids: string[]) {
    return this.http.get(this.base + `/${resourceType}/byID/${ids.toString()}/`);
  }

  get(resourceType: string, id: string) {
    return this.http.get(this.base + `/${resourceType}/${id}/`, this.options);
  }

  search(urlParameters: URLParameter[]) {
    let searchQuery = new HttpParams();
    for (const urlParameter of urlParameters) {
      for (const value of urlParameter.values) {
        searchQuery = searchQuery.append(urlParameter.key, value);
      }
    }
    searchQuery.delete('to');
    const questionMark = urlParameters.length > 0 ? '?' : '';
    /*return this.http.get(`/service/all${questionMark}${searchQuery.toString()}`).map(res => <SearchResults<Service>> <any> res);*/
    return this.http.get<SearchResults<RichService>>(this.base + `/service/rich/all${questionMark}${searchQuery.toString()}`, this.options)
      ;
  }

  getVocabularies() {
    return this.http.get<SearchResults<Vocabulary>>(this.base + `/vocabulary/all?from=0&quantity=1000`);
  }

  getVocabulariesByType(type: string) {
    return this.http.get<SearchResults<Vocabulary>>(this.base + `/vocabulary?type=${type}`);
  }

  idToName(acc: any, v: any) {
    acc[v.id] = v.name;
    return acc;
  }

  idToObject(acc, v) {
    acc[v.id] = {'type': v.type, 'name': v.name};
    return acc;
  }

  getServices() {
    return this.http.get(this.base + '/service/by/id/');
  }

  getService(id: string, version?: string) {
    // if version becomes optional this should be reconsidered
    return this.http.get<Service>(this.base + `/service/${version === undefined ? id : [id, version].join('/')}`, this.options)
      ;
  }

  getRichService(id: string, version?: string) {
    // if version becomes optional this should be reconsidered
    return this.http.get<RichService>(this.base + `/service/rich/${version === undefined ? id : [id, version].join('/')}/`, this.options);
  }

  getSelectedServices(ids: string[]) {
    /*return this.getSome("service", ids).map(res => <Service[]> <any> res);*/
    // return this.getSome('service/rich', ids).subscribe(res => <RichService[]><any>res);
    return this.http.get<RichService[]>(this.base + `/service/rich/byID/${ids.toString()}/`, this.options);
  }

  getServicesByCategories() {
    return this.http.get<BrowseResults>(this.base + '/service/by/category/');
  }

  getServicesOfferedByProvider(id: string): Observable<Service[]> {
    return this.search([{key: 'quantity', values: ['100']}, {key: 'provider', values: [id]}]).pipe(
      map(res => Object.values(res.results))
    );
  }

  /** STATS **/
  getVisitsForProvider(provider: string, period?: string) {
    let params = new HttpParams();
    if (period) {
      params = params.append('by', period);
      return this.http.get(this.base + `/stats/provider/visits/${provider}`, {params});
    } else {
      return this.http.get(this.base + `/stats/provider/visits/${provider}`);
    }
  }

  getFavouritesForProvider(provider: string, period?: string) {
    let params = new HttpParams();
    if (period) {
      params = params.append('by', period);
      return this.http.get(this.base + `/stats/provider/favourites/${provider}`, {params});
    } else {
      return this.http.get(this.base + `/stats/provider/favourites/${provider}`);
    }
  }

  getRatingsForProvider(provider: string, period?: string) {
    let params = new HttpParams();
    if (period) {
      params = params.append('by', period);
      return this.http.get(this.base + `/stats/provider/ratings/${provider}`, {params});
    } else {
      return this.http.get(this.base + `/stats/provider/ratings/${provider}`);
    }
  }

  getVisitationPercentageForProvider(provider: string) {
    return this.get('stats/provider/visitation', provider);
  }

  getPlacesForProvider(provider: string) {
    return this.getServicesOfferedByProvider(provider);
  }

  getVisitsForService(service: string, period?: string) {
    let params = new HttpParams();
    if (period) {
      params = params.append('by', period);
      return this.http.get(this.base + `/stats/service/visits/${service}`, {params});
    }
    return this.http.get(this.base + `/stats/service/visits/${service}`);
  }

  getFavouritesForService(service: string, period?: string) {
    let params = new HttpParams();
    if (period) {
      params = params.append('by', period);
      return this.http.get(this.base + `/stats/service/favourites/${service}`, {params});
    }
    return this.http.get(this.base + `/stats/service/favourites/${service}`);
  }

  getRatingsForService(service: string, period?: string) {
    let params = new HttpParams();
    if (period) {
      params = params.append('by', period);
      return this.http.get(this.base + `/stats/service/ratings/${service}`, {params});
    }
    return this.http.get(this.base + `/stats/service/ratings/${service}`);
  }
  /** STATS **/

  /** Service Measurements **/
  getLatestServiceMeasurement(id: string) {
    return this.http.get<MeasurementsPage>(this.base + `/measurement/latest/service/${id}`);
  }

  getServiceMeasurements(id: string) {
    return this.http.get<MeasurementsPage>(this.base + `/measurement/service/${id}`);
  }

  postMeasurement(measurement: Measurement) {
    return this.http.post(this.base + '/measurement', measurement, this.options)
      ;
  }

  postMeasurementUpdateAll(id: string, measurement: Measurement[]) {
    let params = new HttpParams();
    params = params.append('serviceId', id);
    // const options = {params, withCredentials: true};
    return this.http.post(this.base + '/measurement/updateAll', measurement, {params, withCredentials: true});
  }
  /** Service Measurements **/

  /** Indicators **/
  postIndicator(indicator: Indicator) {
    return this.http.post(this.base + '/indicator', indicator, this.options);
  }
  /** Indicators **/

  groupServicesOfProviderPerPlace(id: string) {
    return this.getServicesOfferedByProvider(id).subscribe(res => {
      const servicesGroupedByPlace = {};
      for (const service of res) {
        for (const place of service.places) {
          if (servicesGroupedByPlace[place]) {
            servicesGroupedByPlace[place].push(res);
          } else {
            servicesGroupedByPlace[place] = [];
          }
        }
      }
      return servicesGroupedByPlace;
    });
  }

  getProvidersNames() {
    let params = new HttpParams();
    params = params.append('from', '0');
    params = params.append('quantity', '10000');
    return this.http.get<ProvidersPage>(this.base + `/provider/all/`, {params, withCredentials: true});
  }

  getProviders(from: string, quantity: string) {
    let params = new HttpParams();
    params = params.append('from', from);
    params = params.append('quantity', quantity);
    params = params.append('orderField', 'creation_date');
    params = params.append('order', 'desc');
    return this.http.get(this.base + `/provider/all`, {params});
    // return this.getAll("provider");
  }

  getMyServiceProviders() {
    return this.http.get<Provider[]>(this.base + '/provider/getMyServiceProviders');
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

  uploadService(service: Service, shouldPut: boolean) {
    return this.http[shouldPut ? 'put' : 'post']<Service>(this.base + '/service', service, this.options)
      ;
  }

  uploadServiceWithMeasurements(service: Service, measurements: Measurement[]) {
    return this.http.put<Service>(this.base + '/service/serviceWithMeasurements', {service, measurements}, this.options)
      ;
  }

  /* TODO: Fix this*/

  recordEvent(service: any, type: any, value?: any) {
    const event = Object.assign({
      instant: Date.now(),
      user: (this.authenticationService.user || {id: ''}).id
    }, {service, type, value});
    const isVisit = ['INTERNAL', 'EXTERNAL'].indexOf(event.type) > 0;
    if ((isVisit && sessionStorage.getItem(type + '-' + service) !== 'aye') || !isVisit) {
      sessionStorage.setItem(type + '-' + service, 'aye');
      return this.http.post('/event', event);
    } else {
      // return Observable.from(['k']);
      return from(['k']);
    }
  }

  getFeaturedServices() {
    return this.http.get<Service[]>(this.base + `/service/featured/all/`);
  }

  getServiceHistory(serviceId: string) {
    return this.http.get<SearchResults<ServiceHistory>>(this.base + `/service/history/${serviceId}/`);
  }

  getInfo() {
    return this.http.get<Info>(this.base + `/info/all`).pipe(
      catchError(this.handleError)
    );
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
}
