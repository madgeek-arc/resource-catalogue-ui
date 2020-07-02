import {Component, Input, OnInit} from '@angular/core';
import {InfraService, Provider, ProviderBundle, Service} from '../../../../domain/eic-model';
import {ServiceProviderService} from '../../../../services/service-provider.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ResourceService} from '../../../../services/resource.service';
import {Paging} from '../../../../domain/paging';

declare var UIkit: any;

@Component({
  selector: 'app-pending-services',
  templateUrl: './pending-services.component.html',
})

export class PendingServicesComponent implements OnInit {

  errorMessage = '';
  providerId;
  providerBundle: ProviderBundle;
  providerServices: Paging<InfraService>;
  selectedService: InfraService = null;
  path: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private providerService: ServiceProviderService,
    private service: ResourceService
  ) {}

  ngOnInit(): void {
    this.path = this.route.snapshot.routeConfig.path;

    if (this.path.includes('myServiceProviders')) {
      this.providerId = this.route.snapshot.paramMap.get('provider');
    } else {
      this.providerId = this.route.parent.snapshot.paramMap.get('provider');
    }
    console.log('this.path: ', this.path);
    // this.providerId = this.route.parent.snapshot.paramMap.get('provider');
    console.log('this.providerId: ', this.providerId);
    this.getProvider();
    this.getPendingServices();
  }

  navigate(id: string) {
    this.router.navigate([`/editPendingService/`, id]);
  }

  getProvider() {
    this.providerService.getServiceProviderBundleById(this.providerId).subscribe(
      providerBundle => {
        this.providerBundle = providerBundle;
      }, error => {
        console.log(error);
      }
    );
  }

  getPendingServices() {
    this.providerService.getPendingServicesByProvider(this.providerId, 50)
      .subscribe(res => {
          this.providerServices = res;
        },
        err => {
          this.errorMessage = 'An error occurred while retrieving the services of this provider. ' + err.error;
        }
      );
  }

  setSelectedService(service: InfraService) {
    this.selectedService = service;
    UIkit.modal('#actionModal').show();
  }

  deleteService(id: string) {
    // UIkit.modal('#spinnerModal').show();
    this.service.deletePendingService(id).subscribe(
      res => {},
      error => {
        // console.log(error);
        // UIkit.modal('#spinnerModal').hide();
        this.errorMessage = 'Something went bad. ' + error.error ;
        this.getPendingServices();
      },
      () => {
        this.getPendingServices();
        // UIkit.modal('#spinnerModal').hide();
      }
    );
  }

}
