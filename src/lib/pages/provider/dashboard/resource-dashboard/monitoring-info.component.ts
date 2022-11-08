import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {environment} from '../../../../../environments/environment';
import {Service} from "../../../../domain/eic-model";
import {Subscription} from "rxjs";
import {NavigationService} from "../../../../services/navigation.service";
import {ResourceService} from "../../../../services/resource.service";

@Component({
  selector: 'app-monitoring-info',
  templateUrl: './monitoring-info.component.html'
})

export class MonitoringInfoComponent implements OnInit {

  serviceORresource = environment.serviceORresource;

  public service: Service;
  public errorMessage: string;
  private sub: Subscription;

  constructor(private route: ActivatedRoute, private router: NavigationService, private resourceService: ResourceService) {
  }

  ngOnInit() {
    this.sub = this.route.parent.params.subscribe(params => {
      this.resourceService.getService(params['resourceId'], params['catalogueId']).subscribe(
        suc => {
          this.service = suc;
        },
        err => {
          this.errorMessage = 'An error occurred while retrieving data for this service. ' + err.error;
        }
      );
    });
  }

}
