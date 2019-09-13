/**
 * Created by stefania on 7/12/17.
 */
import {Injectable} from '@angular/core';
import {throwError} from 'rxjs';
import {ActiveTopicQuestions} from '../domain/faq-active-topic-questions';
import {environment} from '../../environments/environment';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, map} from 'rxjs/operators';

@Injectable()
export class FAQService {
  private _faqUrl = environment.FAQ_ENDPOINT;

  constructor(public http: HttpClient) {
  }

  getActiveTopicQuestions() {
    console.log(this._faqUrl + '/topic/active');
    return this.http.get<ActiveTopicQuestions[]>(this._faqUrl + '/topic/active')
      .pipe(
        map(res => <ActiveTopicQuestions[]>res),
        catchError(this.handleError)
      );
  }

  // private extractData(res: Response) {
  //     const body = res.json();
  //     return body.data || {};
  // }

  private handleError(error: HttpErrorResponse) {
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
    return throwError(
      'Something bad happened; please try again later.');
  }
}
