import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {
  Catalogue,
  CatalogueBundle, DatasourceBundle, ServiceBundle, ProviderBundle
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
    console.log(`knocking on: ${this.base}/catalogue`);
    return this.http.post(this.base + '/catalogue', newProvider, this.options);
  }

  updateCatalogue(updatedFields: any, comment: string): Observable<Catalogue> {
    console.log(`knocking on: ${this.base}/catalogue`);
    return this.http.put<Catalogue>(this.base + `/catalogue?comment=${comment}`, updatedFields, this.options);
  }

  deleteCatalogue(id: string) { //not implemented on backend
    return this.http.delete(this.base + `/catalogue/${id}`, this.options);
  }

  getCatalogueById(id: string) {
    return this.http.get<Catalogue>(this.base + `/catalogue/${id}`, this.options);
  }

  verifyCatalogue(id: string, active: boolean, status: string) { //used for onboarding process
    return this.http.patch(this.base + `/catalogue/verifyCatalogue/${id}?active=${active}&status=${status}`, {}, this.options);
  }

  getMyCatalogues() {
    return this.http.get<CatalogueBundle[]>(this.base + '/catalogue/getMyCatalogues', this.options);
  }

  getCatalogueBundleById(id: string) {
    return this.http.get<CatalogueBundle>(this.base + `/catalogue/bundle/${id}`, this.options);
  }

  getCatalogueBundles(from: string, quantity: string, orderField: string, order: string, query: string, suspended: string, status: string[], templateStatus: string[], auditState: string[]) {
    let params = new HttpParams();
    params = params.append('from', from);
    params = params.append('quantity', quantity);
    params = params.append('orderField', orderField);
    params = params.append('order', order);
    if (query && query !== '') {
      params = params.append('query', query);
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

  getProvidersOfCatalogue(id: string, from: string, quantity: string, order: string, orderField: string, status?: string, query?: string) {
    if (!query) { query = ''; }
    let params = new HttpParams();
    if (status && status.length > 0) {
      for (const statusValue of status) {
        params = params.append('status', statusValue);
      }
    } else {
      const allStatus = ["approved provider","pending provider","rejected provider"];
      for (const statusValue of allStatus) {
        params = params.append('status', statusValue);
      }
    }
    return this.http.get<Paging<ProviderBundle>>(this.base +
      `/provider/byCatalogue/${id}?from=${from}&quantity=${quantity}&order=${order}&orderField=${orderField}&query=${query}`, {params});
  }

  getServicesOfCatalogue(id: string, from: string, quantity: string, order: string, orderField: string, status?: string, query?: string) {
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
      return this.http.get<any>(this.base + `/service/byCatalogue/${id}?from=${from}&quantity=${quantity}&order=${order}&orderField=${orderField}&query=${query}`, {params});
  }

  getTrainingsOfCatalogue(id: string, from: string, quantity: string, order: string, orderField: string, status?: string, query?: string) {
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
    return this.http.get<any>(this.base + `/trainingResource/byCatalogue/${id}?from=${from}&quantity=${quantity}&order=${order}&orderField=${orderField}&query=${query}`, {params});
  }

  getDatasourcesOfCatalogue(id: string, from: string, quantity: string, order: string, orderField: string, active: string, status?: string, query?: string) {
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
    if (active === 'statusAll') {
      return this.http.get<Paging<DatasourceBundle>>(this.base +
        `/datasource/byCatalogue/${id}?from=${from}&quantity=${quantity}&order=${order}&orderField=${orderField}&query=${query}`, {params});
    }
    return this.http.get<Paging<DatasourceBundle>>(this.base +
      `/datasource/byCatalogue/${id}?from=${from}&quantity=${quantity}&order=${order}&orderField=${orderField}&active=${active}&query=${query}`, {params});
  }

  hasAdminAcceptedTerms(id: string, pendingCatalogue: boolean) {
    if (pendingCatalogue) {
      return this.http.get<boolean>(this.base + `/pendingCatalogue/hasAdminAcceptedTerms?catalogueId=${id}`);
    }
    return this.http.get<boolean>(this.base + `/catalogue/hasAdminAcceptedTerms?catalogueId=${id}`);
  }

  adminAcceptedTerms(id: string, pendingCatalogue: boolean) {
    if (pendingCatalogue) {
      return this.http.put(this.base + `/pendingCatalogue/adminAcceptedTerms?catalogueId=${id}`, this.options);
    }
    return this.http.put(this.base + `/catalogue/adminAcceptedTerms?catalogueId=${id}`, this.options);
  }

  suspendCatalogue(catalogueId: string, suspend: boolean) {
    return this.http.put<CatalogueBundle>(this.base + `/catalogue/suspend?catalogueId=${catalogueId}&suspend=${suspend}`, this.options);
  }

  auditCatalogue(id: string, action: string, comment: string) {
    return this.http.patch(this.base + `/catalogue/auditCatalogue/${id}?actionType=${action}&comment=${comment}`, this.options);
  }

  getContactInfo() {
    return this.http.get(this.base + `/contactInformation/getMy`, this.options);
  }

  setContactInfoTransfer(bool: boolean, mail?: string) {
    return this.http.put(this.base + `/contactInformation/updateContactInfoTransfer?acceptedTransfer=${bool}`, this.options);
  }

}
