import {Component, OnInit} from '@angular/core';
import {Provider} from '../../../../domain/eic-model';
import {ActivatedRoute} from '@angular/router';
import {isNullOrUndefined} from 'util';
import {ServiceProviderService} from '../../../../services/service-provider.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html'
})
export class MessagesComponent implements OnInit {
  providerId: string;
  provider: Provider;

  constructor(private route: ActivatedRoute,
              private providerService: ServiceProviderService) {}

  ngOnInit(): void {
    this.providerId = this.route.parent.snapshot.paramMap.get('provider');
    if (!isNullOrUndefined(this.providerId) && (this.providerId !== '')) {
      this.providerService.getServiceProviderById(this.providerId).subscribe(
        res => this.provider = res,
        err => console.log(err)
      );
    }
  }

}
