import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {
  Catalogue,
  CatalogueBundle, DatasourceBundle, ServiceBundle, ProviderBundle, LoggingInfo
} from '../domain/eic-model';
import {environment} from '../../environments/environment';
import {Observable} from 'rxjs';
import {Paging} from '../domain/paging';

@Injectable()
export class CatalogueService {

  constructor(public http: HttpClient, public authenticationService: AuthenticationService) {
  }

  private base = environment.API_ENDPOINT;
  private httpOption = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json;charset=UTF-8',
      'Accept': 'application/json;charset=UTF-8'
    })
  };

  private options = {withCredentials: true};

  createNewCatalogue(newProvider: any) {
    // console.log(`knocking on: ${this.base}/catalogue`);
    return this.http.post(this.base + '/catalogue', newProvider, this.options);
  }

  updateCatalogue(updatedFields: any, comment: string): Observable<Catalogue> {
    // console.log(`knocking on: ${this.base}/catalogue`);
    return this.http.put<Catalogue>(this.base + `/catalogue?comment=${comment}`, updatedFields, this.options);
  }

  deleteCatalogue(id: string) { //not implemented on backend
    return this.http.delete(this.base + `/catalogue/${id}`, this.options);
  }

  getCatalogueById(id: string) {
    return this.http.get<Catalogue>(this.base + `/catalogue/${id}`, this.options);
  }

  verifyCatalogue(id: string, active: boolean, status: string) { //used for onboarding process
    return this.http.patch(this.base + `/catalogue/verify/${id}?active=${active}&status=${status}`, {}, this.options);
  }

  getMyCatalogues() {
    return this.http.get<CatalogueBundle[]>(this.base + '/catalogue/getMy', this.options);
  }

  getCatalogueBundleById(id: string) {
    id = decodeURIComponent(id);
    return this.http.get<CatalogueBundle>(this.base + `/catalogue/bundle/${id}`, this.options);
  }

  getCatalogueBundles(from: string, quantity: string, sort: string, order: string, query: string, suspended: string, status: string[], templateStatus: string[], auditState: string[]) {
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
    if (suspended && suspended !== '') {
      params = params.append('suspended', suspended);
    }
    if (status && status.length > 0) {
      for (const statusValue of status) {
        params = params.append('status', statusValue);
      }
    }
    // if (templateStatus && templateStatus.length > 0) {
    //   for (const templateStatusValue of templateStatus) {
    //     params = params.append('templateStatus', templateStatusValue);
    //   }
    // }
    if (auditState && auditState.length > 0) {
      for (const auditValue of auditState) {
        params = params.append('audit_state', auditValue);
      }
    }
    return this.http.get(this.base + `/catalogue/bundle/all`, {params});
  }

  getProvidersOfCatalogue(id: string, from: string, quantity: string, order: string, sort: string, status?: string, query?: string) {
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
    return this.http.get<Paging<ProviderBundle>>(this.base +
      `/catalogue/${id}/provider/bundle/all?from=${from}&quantity=${quantity}&order=${order}&sort=${sort}&keyword=${query}`, {params});
  }

  getServicesOfCatalogue(id: string, from: string, quantity: string, order: string, sort: string, status?: string, query?: string) {
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
      return this.http.get<any>(this.base + `/catalogue/${id}/service/bundle/all?from=${from}&quantity=${quantity}&order=${order}&sort=${sort}&keyword=${query}`, {params});
  }

  getTrainingsOfCatalogue(id: string, from: string, quantity: string, order: string, sort: string, status?: string, query?: string) {
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
    return this.http.get<any>(this.base + `/catalogue/${id}/trainingResource/bundle/all?from=${from}&quantity=${quantity}&order=${order}&sort=${sort}&keyword=${query}`, {params});
  }

  getDeployableServicesOfCatalogue(id: string, from: string, quantity: string, order: string, sort: string, status?: string, query?: string) {
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
    return this.http.get<any>(this.base + `/catalogue/${id}/deployableApplication/bundle/all?from=${from}&quantity=${quantity}&order=${order}&sort=${sort}&keyword=${query}`, {params});
  }

  getDatasourcesOfCatalogue(id: string, from: string, quantity: string, order: string, sort: string, active: string, status?: string, query?: string) {
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
    if (active === 'statusAll') {
      return this.http.get<Paging<DatasourceBundle>>(this.base +
        `/datasource/byCatalogue/${id}?from=${from}&quantity=${quantity}&order=${order}&sort=${sort}&keyword=${query}`, {params});
    }
    return this.http.get<Paging<DatasourceBundle>>(this.base +
      `/datasource/byCatalogue/${id}?from=${from}&quantity=${quantity}&order=${order}&sort=${sort}&active=${active}&keyword=${query}`, {params});
  }

  suspendCatalogue(catalogueId: string, suspend: boolean) {
    return this.http.put<CatalogueBundle>(this.base + `/catalogue/suspend?id=${catalogueId}&suspend=${suspend}`, this.options);
  }

  auditCatalogue(id: string, action: string, comment: string) {
    return this.http.patch(this.base + `/catalogue/audit/${id}?actionType=${action}&comment=${comment}`, {}, this.options);
  }

  getContactInfo() {
    return this.http.get(this.base + `/contactInformation/getMy`, this.options);
  }

  setContactInfoTransfer(bool: boolean, mail?: string) {
    return this.http.put(this.base + `/contactInformation/updateContactInfoTransfer?acceptedTransfer=${bool}`, {}, this.options);
  }

  getCatalogueLoggingInfoHistory(catalogueId: string) {
    catalogueId = decodeURIComponent(catalogueId);
    return this.http.get<LoggingInfo[]>(this.base + `/catalogue/loggingInfoHistory/${catalogueId}`);
  }

  activateCatalogue(id: string, active: boolean) { // toggles active/inactive catalogue
    id = decodeURIComponent(id);
    return this.http.patch(this.base + `/catalogue/setActive/${id}?active=${active}`, {}, this.options);
  }
}
