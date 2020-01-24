import {Component, OnInit} from '@angular/core';
import {Service} from '../../../../domain/eic-model';
import {ServiceProviderService} from '../../../../services/service-provider.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html'
})

export class ServicesComponent implements OnInit {
  errorMessage;
  providerId;
  providerServices: Service[] = [];
  providerCoverage: string[];
  providerServicesGroupedByPlace: any;

  constructor(
    private route: ActivatedRoute,
    private providerService: ServiceProviderService
  ) {}

  ngOnInit(): void {
    const path = this.route.snapshot.routeConfig.path;
    console.log(path);
    this.providerId = this.route.parent.snapshot.paramMap.get('provider');
    this.providerService[path === 'activeServices' ? 'getServicesOfProvider' : 'getPendingServicesByProvider'](this.providerId)
      .subscribe(res => {
          this.providerServices = res;
          this.providerServicesGroupedByPlace = this.groupServicesOfProviderPerPlace(this.providerServices);
          if (this.providerServicesGroupedByPlace) {
            this.providerCoverage = Object.keys(this.providerServicesGroupedByPlace);

            // this.setCountriesForProvider(this.providerCoverage);
          }
        },
        err => {
          this.errorMessage = 'An error occurred while retrieving the services of this provider. ' + err.error;
        }
      );
  }

  groupServicesOfProviderPerPlace(services: Service[]) {
    const ret = {};
    if (this.providerServices && this.providerServices.length > 0) {
      for (const service of services) {
        for (const place of service.places) {
          if (ret[place]) {
            ret[place].push(this.providerServices);
          } else {
            ret[place] = [];
          }
        }
      }
    }
    return ret;
  }

}
