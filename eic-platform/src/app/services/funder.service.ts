import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {FundersPage} from '../domain/funders-page';


@Injectable()
export class FunderService {
  private base = environment.API_ENDPOINT;

  constructor(public http: HttpClient) {
  }

  getAllFunders(quantity: string) {
    return this.http.get<FundersPage>(this.base + `/funder/all?quantity=${quantity}`);
  }

  getFunderStats(funderId: string) {
    return this.http.get(this.base + `/funder/funderStats/${funderId}`);
  }
}
