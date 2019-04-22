import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Provider} from '../../domain/eic-model';
import {ServiceProviderService} from '../../services/service-provider.service';

declare var UIKit: any;

@Component({
  selector: 'app-service-provider-info',
  templateUrl: './service-provider-info.component.html'
})

export class ServiceProviderInfoComponent implements OnInit {
  errorMessage: string;
  myProviders: Provider[] = [];
  provider: Provider;
  isUserAdmin = false;


  constructor(private serviceProviderService: ServiceProviderService,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.getProvider();
  }

  getProvider() {
    const id = this.route.snapshot.paramMap.get('id');
    this.errorMessage = '';
    this.serviceProviderService.getServiceProviderById(id).subscribe(
      provider => {
        this.provider = provider;
        this.getMyServiceProviders(this.provider.id);
      },
      err => {
        console.log(err);
        this.errorMessage = 'Something went wrong.';
      }
    );
  }

  getMyServiceProviders(id: string) {
    this.serviceProviderService.getMyServiceProviders().subscribe(
      providers => this.myProviders = providers,
      err => {
        console.log(err);
        this.errorMessage = 'Something went wrong.';
      },
      () => {
        for (let i = 0; i < this.myProviders.length; i++) {
          if (this.myProviders[i].id === id) {
            this.isUserAdmin = true;
            break;
          }
        }
      }
    );
  }

}
