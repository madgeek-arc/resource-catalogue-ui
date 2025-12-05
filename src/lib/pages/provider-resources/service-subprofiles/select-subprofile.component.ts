import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {environment} from '../../../../environments/environment';
import {ResourceService} from "../../../services/resource.service";
import {Service} from "../../../domain/eic-model";
import {pidHandler} from "../../../shared/pid-handler/pid-handler.service";

@Component({
    selector: 'app-select-subprofile',
    templateUrl: './select-subprofile.component.html',
    standalone: false
})

export class SelectSubprofileComponent implements OnInit {

  serviceORresource = environment.serviceORresource;
  selectedSubprofile: string = 'datasource';
  errorMessage = '';
  serviceId: string;
  service: Service;
  path: string;

  constructor(
    private route: ActivatedRoute,
    private ressourceService: ResourceService,
    public pidHandler: pidHandler
  ) {}

  ngOnInit(): void {
    this.serviceId = this.route.snapshot.paramMap.get('resourceId');

    this.ressourceService.getService(this.serviceId).subscribe(
      res => {this.service = res},
      error => {},
      () => {}
    )
  }
}
