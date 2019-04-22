import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {environment} from '../../environments/environment';
import {Measurement, Provider, RichService, Service, ServiceHistory, Vocabulary} from '../domain/eic-model';
import {IndicatorsPage, MeasurementsPage} from '../domain/indicators';
import {BrowseResults} from '../domain/browse-results';
import {SearchResults} from '../domain/search-results';
import {ProvidersPage} from '../domain/funders-page';
import {URLParameter} from '../domain/url-parameter';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/internal/operators/catchError';
import {from} from 'rxjs/internal/observable/from';
import {map} from 'rxjs/operators';

declare var UIkit: any;


@Injectable()
export class ResourceService {
  private base = environment.API_ENDPOINT;
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
    return this.http.get(this.base + `/${resourceType}/all`, {params}).pipe(
      catchError(this.handleError)
    );
  }

  getAllIndicators(resourceType: string) {
    let params = new HttpParams();
    params = params.append('from', '0');
    params = params.append('quantity', '10000');
    return this.http.get<IndicatorsPage>(this.base + `/${resourceType}/all`, {params}).pipe(
      catchError(this.handleError)
    );
  }

  getBy(resourceType: string, resourceField: string) {
    return this.http.get(this.base + `/${resourceType}/by/${resourceField}/`).pipe(
      catchError(this.handleError)
    );
  }

  getSome(resourceType: string, ids: string[]) {
    return this.http.get(this.base + `/${resourceType}/byID/${ids.toString()}/`).pipe(
      catchError(this.handleError)
    );
  }

  get(resourceType: string, id: string) {
    return this.http.get(this.base + `/${resourceType}/${id}/`, this.options).pipe(
      catchError(this.handleError)
    );
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
      .pipe(
        catchError(this.handleError)
      );
  }

  getVocabularies() {
    return this.http.get<SearchResults<Vocabulary>>(this.base + `/vocabulary/all?from=0&quantity=1000`);
  }

  getVocabulariesByType(type: string) {
    return this.http.get<SearchResults<Vocabulary>>(this.base + `/vocabulary?type=${type}`);
  }

  // getVocabulariesUsingGroupBy(type?: string) {
  //   return this.http.get(this.base + `/vocabulary/by/type`).filter(e => type ? e && e.type && e.type === type : true);
  // }

  idToName(acc: any, v: any) {
    acc[v.id] = v.name;
    return acc;
  }

  idToObject(acc, v) {
    acc[v.id] = {'type': v.type, 'name': v.name};
    return acc;
  }

  getServices() {
    return this.http.get(this.base + '/service/by/id/').pipe(
      catchError(this.handleError)
    );
  }

  getService(id: string, version?: string) {
    // if version becomes optional this should be reconsidered
    return this.http.get<Service>(this.base + `/service/${version === undefined ? id : [id, version].join('/')}`, this.options)
      .pipe(catchError(this.handleError));
  }

  getRichService(id: string, version?: string) {
    // if version becomes optional this should be reconsidered
    return this.http.get<RichService>(this.base + `/service/rich/${version === undefined ? id : [id, version].join('/')}/`, this.options)
      .pipe(catchError(this.handleError));
  }

  getSelectedServices(ids: string[]) {
    /*return this.getSome("service", ids).map(res => <Service[]> <any> res);*/
    // return this.getSome('service/rich', ids).subscribe(res => <RichService[]><any>res);
    return this.http.get<RichService[]>(this.base + `/service/rich/byID/${ids.toString()}/`, this.options).pipe(
      catchError(this.handleError)
    );
  }

  getServicesByCategories() {
    return this.http.get<BrowseResults>(this.base + '/service/by/category/').pipe(
      catchError(this.handleError)
    );
  }

  getServicesOfferedByProvider(id: string): Observable<Service[]> {
    return this.search([{key: 'quantity', values: ['100']}, {key: 'provider', values: [id]}]).pipe(
      map(res => Object.values(res.results))
    );
  }

  getVisitsForProvider(provider: string, type?: string) {
    return this.get(`stats/provider/${type || 'visits'}`, provider);
  }

  getFavouritesForProvider(provider: string) {
    return this.get('stats/provider/favourites', provider);
  }

  getRatingsForProvider(provider: string) {
    return this.get('stats/provider/ratings', provider);
  }

  getVisitationPercentageForProvider(provider: string) {
    return this.get('stats/provider/visitation', provider);
  }

  getPlacesForProvider(provider: string) {
    return this.getServicesOfferedByProvider(provider);
  }

  getVisitsForService(service: string, type?: string) {
    return this.get(`stats/service/${type || 'visits'}`, service);
  }

  getFavouritesForService(service: string) {
    return this.get('stats/service/favourites', service);
  }

  getRatingsForService(service: string) {
    return this.get('stats/service/ratings', service);
  }

  getLatestServiceMeasurement(id: string) {
    return this.http.get<MeasurementsPage>(this.base + `/measurement/latest/service/${id}`);
  }

  getIndicators(id: string) {
    return this.get('indicator', id);
  }

  postMeasurement(measurement: Measurement) {
    return this.http.post(this.base + '/measurement', measurement, this.options);
  }

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

  // TODO fix this!!!!
  // getProvidersNames() {
  //   return this.getAll('provider')
  //     .pipe(
  //       map(e => e.results.reduce(this.idToName, {}))
  //     );
  // }

  getProvidersNames() {
    let params = new HttpParams();
    params = params.append('from', '0');
    params = params.append('quantity', '10000');
    return this.http.get<ProvidersPage>(this.base + `/provider/all/`, {params, withCredentials: true}).pipe(
      catchError(this.handleError)
    );
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

  getExternalsForProvider(provider: string) {
    return this.getVisitsForProvider(provider, 'externals');
  }

  getExternalsForService(service: string, type?: string) {
    return this.getVisitsForService(service, 'externals');
  }

  getInternalsForService(service: string, type?: string) {
    return this.getVisitsForService(service, 'internals');
  }

  getInternalsForProvider(provider: string) {
    return this.getVisitsForProvider(provider, 'internals');
  }

  activateUserAccount(id: any) {
    return this.http.get(this.base + `/user/activate/${id}`);
  }

  uploadService(service: Service, shouldPut: boolean) {
    return this.http[shouldPut ? 'put' : 'post']<Service>(this.base + '/service', service, this.options)
      .pipe(
        catchError(this.handleError)
      );
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
    return this.http.get<Service[]>(this.base + `/service/featured/all/`).pipe(catchError(this.handleError));
  }

  getServiceHistory(serviceId: string) {
    return this.http.get<SearchResults<ServiceHistory>>(this.base + `/service/history/${serviceId}/`);
  }

  public handleError(error: HttpErrorResponse) {
    const message = 'Server error';
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
