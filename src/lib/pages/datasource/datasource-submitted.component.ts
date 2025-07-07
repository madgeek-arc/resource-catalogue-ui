import {Component, OnInit} from '@angular/core';
import {Datasource, Service} from '../../domain/eic-model';
import {ActivatedRoute, Router} from '@angular/router';
import {environment} from '../../../environments/environment';
import {DatasourceService} from "../../services/datasource.service";
import {ResourceService} from "../../services/resource.service";
import {pidHandler} from "../../shared/pid-handler/pid-handler.service";


@Component({
  selector: 'app-datasource-submitted',
  templateUrl: './datasource-submitted.component.html',
})

export class DatasourceSubmittedComponent implements OnInit {

  serviceORresource = environment.serviceORresource;

  errorMessage = '';
  showLoader = false;
  registeredAtOpenAIRE: boolean;
  datasourceId: string;
  datasource: Datasource;
  service: Service;
  path: string;

  constructor(
    private route: ActivatedRoute,
    private datasourceService: DatasourceService,
    private resourceService: ResourceService,
    public pidHandler: pidHandler
  ) {}

  ngOnInit(): void {
    this.datasourceId = this.route.snapshot.paramMap.get('datasourceId');

    this.datasourceService.getDatasource(this.datasourceId).subscribe(
      ds => {this.datasource = ds},
      error => {},
      () => {
        this.resourceService.getService(this.datasource.serviceId).subscribe(
          res => {this.service = res},
          error => {},
          () => {}
        );
      }
    );

    this.datasourceService.isDatasourceRegisteredOnOpenAIRE(this.datasourceId).subscribe(
      bool => this.registeredAtOpenAIRE = bool,
      error => {},
      () => {}
    );
  }

}
