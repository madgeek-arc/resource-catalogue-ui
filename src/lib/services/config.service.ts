import {Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {environment} from "../../environments/environment";

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private config: any;

  constructor(private http: HttpClient) {}

  base = environment.API_ENDPOINT;

  loadConfig(): Promise<any> {
    return
    return this.http.get(this.base + '/config').toPromise().then(config => {
      this.config = config;
    });
  }

  getProperty(key: string): any {
    return this.config ? this.config[key] : null;
  }

  getAllProperties(): any {
    return this.config;
  }
}
