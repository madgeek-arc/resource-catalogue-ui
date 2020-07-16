import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {PageContent} from '../domain/page-content';
import {environment} from '../../environments/environment';
import {throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';

@Injectable()
export class HelpContentService {
  // private _helpServiceUrl = "http://83.212.101.85:5555/api/";
  private _helpServiceUrl = environment.FAQ_ENDPOINT;

  constructor(public http: HttpClient) {
  }

  getActivePageContent(route: string) {
    // console.log(this._helpServiceUrl + "/page/route?q=" + route);
    return this.http.get<PageContent>(this._helpServiceUrl + '/page/route?q=' + route)
      ;
  }

  private handleError(error: HttpErrorResponse) {
    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    let errMsg = '';
    if (error.error instanceof ErrorEvent) {
      const body = error.error.message || '';
      // const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${body}`;
    } else {
      errMsg = (error.message) ? error.message :
        error.status ? `${error.status} - ${error.statusText}` : 'Server error';
      console.error(errMsg); // log to console instead
    }
    return throwError(errMsg);
  }
}
