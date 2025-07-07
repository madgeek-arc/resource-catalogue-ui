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

  updateEoscIFGuidelines(resourceId: string, type: string, catalogueId: string, eoscIFGuidelines: EOSCIFGuidelines[]) {
    resourceId = decodeURIComponent(resourceId);
    return this.http.put<EOSCIFGuidelines[]>(this.base + `/resource-extras/update/eoscIFGuidelines?resourceId=${resourceId}&type=${type}&catalogueId=${catalogueId}`, eoscIFGuidelines, this.options);
  }

}
