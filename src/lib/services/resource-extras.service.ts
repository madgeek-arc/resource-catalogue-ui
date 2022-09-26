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

  addEoscIFGuideline(resourceId: string, catalogueId: string, pid: string, label: string, url: string, semanticRelationship: string) {
    return this.http.put(this.base + `/resource-extras/add/eoscIFGuideline?resourceId=${resourceId}&catalogueId=${catalogueId}&pid=${pid}&label=${label}&url=${url}&semanticRelationship=${semanticRelationship}`, this.options);
  }

  addResearchCategory(resourceId: string, catalogueId: string, researchCategory: string) {
    return this.http.put(this.base + `/resource-extras/add/researchCategory?resourceId=${resourceId}&catalogueId=${catalogueId}&researchCategory=${researchCategory}`, this.options);
  }

  deleteEoscIFGuideline(resourceId: string, catalogueId: string, pid: string) {
    return this.http.put(this.base + `/resource-extras/delete/eoscIFGuideline?resourceId=${resourceId}&catalogueId=${catalogueId}&pid=${pid}`, this.options);
  }

  deleteResearchCategory(resourceId: string, catalogueId: string, researchCategory: string) {
    return this.http.put(this.base + `/resource-extras/delete/researchCategory?resourceId=${resourceId}&catalogueId=${catalogueId}&researchCategory=${researchCategory}`, this.options);
  }

  updateHorizontalService(resourceId: string, catalogueId: string, horizontalService: boolean) {
    return this.http.put(this.base + `/resource-extras/update/horizontalService?resourceId=${resourceId}&catalogueId=${catalogueId}&horizontalService=${horizontalService}`, this.options);
  }

  updateResearchCategories(resourceId: string, catalogueId: string, researchCategories: string[]) {
    return this.http.put<string[]>(this.base + `/resource-extras/update/researchCategories?resourceId=${resourceId}&catalogueId=${catalogueId}`, researchCategories, this.options);
  }

  updateEoscIFGuidelines(resourceId: string, catalogueId: string, eoscIFGuidelines: EOSCIFGuidelines[]) {
    return this.http.put<EOSCIFGuidelines[]>(this.base + `/resource-extras/update/eoscIFGuidelines?resourceId=${resourceId}&catalogueId=${catalogueId}`, eoscIFGuidelines, this.options);
  }
}
