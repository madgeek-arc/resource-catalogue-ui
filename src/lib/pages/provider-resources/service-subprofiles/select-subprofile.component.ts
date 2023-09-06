import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {environment} from '../../../../environments/environment';
import {ResourceService} from "../../../services/resource.service";
import {Service} from "../../../domain/eic-model";

@Component({
  selector: 'app-select-subprofile',
  templateUrl: './select-subprofile.component.html',
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
    private ressourceService: ResourceService
  ) {}

  ngOnInit(): void {
    this.serviceId = this.route.snapshot.paramMap.get('serviceId');

    this.ressourceService.getService(this.serviceId).subscribe(
      res => {this.service = res},
      error => {},
      () => {}
    )
  }
}
