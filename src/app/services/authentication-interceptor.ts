import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';


import {Router} from '@angular/router';
import {Observable, throwError } from 'rxjs';
import {map, catchError } from 'rxjs/operators';

@Injectable()
export class AuthenticationInterceptor implements HttpInterceptor {

  constructor(private router: Router) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(request).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          // do stuff with response if you want
        }
        return event;
      }, (err: any) => {
        if (err instanceof HttpErrorResponse) {
          console.log(err);
          if (err.status === 403) {
            // show forbidden page
            console.log('Unauthorised!!', err);
            this.router.navigateByUrl('/forbidden', {skipLocationChange: true});
          }
        }
      }));
  }
}
