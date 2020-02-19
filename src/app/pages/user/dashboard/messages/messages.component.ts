import {Component, OnInit} from '@angular/core';
import {Provider, ProviderRequest} from '../../../../domain/eic-model';
import {ActivatedRoute} from '@angular/router';
import {isNullOrUndefined} from 'util';
import {ServiceProviderService} from '../../../../services/service-provider.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html'
})
export class MessagesComponent implements OnInit {
  providerId: string;
  requests: ProviderRequest[] = [];

  constructor(private route: ActivatedRoute,
              private providerService: ServiceProviderService) {}

  ngOnInit(): void {
    this.providerId = this.route.parent.snapshot.paramMap.get('provider');
    if (!isNullOrUndefined(this.providerId) && (this.providerId !== '')) {
      this.providerService.getProviderRequests(this.providerId).subscribe(
        res => this.requests = res,
        err => console.log(err)
      );
    }
  }

}
