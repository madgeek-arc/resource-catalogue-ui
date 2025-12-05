import {Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {environment} from '../../environments/environment';

@Injectable()
export class AccountingStatsService {

  constructor(public http: HttpClient,
              public authenticationService: AuthenticationService) {
  }

  base = environment.API_ENDPOINT;
  private options = {withCredentials: true};

  getAccountingStatsForProject(start?: string, end?: string) {
    start = start || this.getDefaultStartDate();
    end = end || this.getDefaultEndDate();
    return this.http.get<any>(this.base + `/accounting/project/report?start=${start}&end=${end}`, this.options);
  }

  getAccountingStatsForProvider(id: string, start: string, end: string) {
    const idDecoded = decodeURIComponent(id);
    return this.http.get<any>(this.base + `/accounting/project/provider/${idDecoded}/report?start=${start}&end=${end}`, this.options);
  }

  getAccountingStatsForService(id: string, start: string, end: string) {
    const idDecoded = decodeURIComponent(id);
    return this.http.get<any>(this.base + `/accounting/project/installation/${idDecoded}/report?start=${start}&end=${end}`, this.options);
  }

  getDefaultStartDate(): string {
    return '1970-01-01';
  }

  getDefaultEndDate(): string {
    return new Date().toISOString().split('T')[0]; // yyyy-mm-dd
  }

}
