import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../../../src/environments/environment';

@Injectable()
export class EmailService {
  private base = environment.API_ENDPOINT;

  constructor(private http: HttpClient) {}

  sendMail(serviceIds: string[], emailForm) {
    return this.http.post(this.base + `/contact/service/${serviceIds}/support?email=${emailForm.get('email').value}`, emailForm.get('text').value, {withCredentials: true});
  }
}
