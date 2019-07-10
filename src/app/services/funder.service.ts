import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {FundersPage} from '../domain/funders-page';
import {throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';

declare var UIkit: any;

@Injectable()
export class FunderService {
  private base = environment.API_ENDPOINT;

  constructor(public http: HttpClient) {
  }

  getAllFunders(quantity: string) {
    return this.http.get<FundersPage>(this.base + `/funder/all?quantity=${quantity}`);
  }

  getFunderStats(funderId: string) {
    return this.http.get(this.base + `/funder/funderStats/${funderId}/`);
  }

  private handleError(error: HttpErrorResponse) {
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
