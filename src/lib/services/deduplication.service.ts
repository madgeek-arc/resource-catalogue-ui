import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';

export interface SimilarResource {
  score: number;
  result: any;
}

@Injectable()
export class DeduplicationService {

  private base = environment.API_ENDPOINT;
  private options = {withCredentials: true};

  constructor(private http: HttpClient) {}

  checkBeforeAdd(resourceType: string, resource: any, threshold = 0.95, quantity = 5): Observable<SimilarResource[]> {
    return this.http.post<SimilarResource[]>(`${this.base}/dedup/${resourceType}/check?threshold=${threshold}&quantity=${quantity}`, resource, this.options);
  }
}
