import {Injectable} from '@angular/core';
import {ResourceService} from '../../../../../src/app/services/resource.service';
import {Info} from '../domain/info';
import {catchError} from 'rxjs/operators';

@Injectable()
export class ResourceServiceExtended extends ResourceService {

  getInfo() {
    return this.http.get<Info>(this.base + `/info/all`);
  }
}
