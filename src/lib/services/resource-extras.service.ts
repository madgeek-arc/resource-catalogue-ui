import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {environment} from '../../environments/environment';
import {EOSCIFGuidelines} from '../domain/eic-model';

@Injectable()
export class ResourceExtrasService {

  constructor(public http: HttpClient, public authenticationService: AuthenticationService) {
  }
  base = environment.API_ENDPOINT;
  private options = {withCredentials: true};

  addEoscIFGuideline(serviceId: string, catalogueId: string, pid: string, label: string, url: string, semanticRelationship: string) {
    return this.http.put(this.base + `/resource-extras/add/eoscIFGuideline?serviceId=${serviceId}&catalogueId=${catalogueId}&pid=${pid}&label=${label}&url=${url}&semanticRelationship=${semanticRelationship}`, this.options);
  }

  addResearchCategory(serviceId: string, catalogueId: string, researchCategory: string) {
    return this.http.put(this.base + `/resource-extras/add/researchCategory?serviceId=${serviceId}&catalogueId=${catalogueId}&researchCategory=${researchCategory}`, this.options);
  }

  deleteEoscIFGuideline(serviceId: string, catalogueId: string, pid: string) {
    return this.http.put(this.base + `/resource-extras/delete/eoscIFGuideline?serviceId=${serviceId}&catalogueId=${catalogueId}&pid=${pid}`, this.options);
  }

  deleteResearchCategory(serviceId: string, catalogueId: string, researchCategory: string) {
    return this.http.put(this.base + `/resource-extras/delete/researchCategory?serviceId=${serviceId}&catalogueId=${catalogueId}&researchCategory=${researchCategory}`, this.options);
  }

  updateEoscIFGuidelines(serviceId: string, catalogueId: string, eoscIFGuidelines: EOSCIFGuidelines[]) {
    return this.http.put<EOSCIFGuidelines[]>(this.base + `/resource-extras/update/eoscIFGuidelines?serviceId=${serviceId}&catalogueId=${catalogueId}`, eoscIFGuidelines, this.options);
  }

  updateHorizontalService(serviceId: string, catalogueId: string, horizontalService: boolean) {
    return this.http.put(this.base + `/resource-extras/update/horizontalService?serviceId=${serviceId}&catalogueId=${catalogueId}&horizontalService=${horizontalService}`, this.options);
  }

  updateResearchCategories(serviceId: string, catalogueId: string, researchCategories: string[]) {
    return this.http.put<string[]>(this.base + `/resource-extras/update/researchCategories?serviceId=${serviceId}&catalogueId=${catalogueId}`, researchCategories, this.options);
  }

}
