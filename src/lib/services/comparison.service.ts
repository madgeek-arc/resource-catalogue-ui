import {Injectable} from '@angular/core';
import {NavigationService} from './navigation.service';
import {Service} from '../domain/eic-model';

declare var UIkit;

@Injectable()
export class ComparisonService {

  public servicesToCompare: Service[] = [];

  constructor(public router: NavigationService) {
    this.servicesToCompare = JSON.parse(sessionStorage.getItem('compareServices') || '[]');
  }

  addOrRemove(service: Service, go?: boolean) {
    const idx = this.servicesToCompare.map(s => s.id).indexOf(service.id);
    if (idx > -1) {
      this.servicesToCompare.splice(idx, 1);
      sessionStorage.setItem('compareServices', JSON.stringify(this.servicesToCompare));
    } else {
      if (this.servicesToCompare.length === 3) {
        UIkit.notification({
          message: 'You have reached the maximum number of items you can compare',
          status: 'primary',
          pos: 'top-center',
          timeout: 5000
        });
      } else {
        this.servicesToCompare.push(service);
        sessionStorage.setItem('compareServices', JSON.stringify(this.servicesToCompare));
      }
    }
    if (go) {
      return this.go();
    }
  }

  clearAll() {
    this.servicesToCompare.length = 0;
    sessionStorage.removeItem('compareServices');
  }

  go() {
    if (this.servicesToCompare.length > 1) {
      return this.router.compare({services: this.servicesToCompare.map(x => x.id).join(',')});
    } else {
      this.router.search({});
    }
  }
}
