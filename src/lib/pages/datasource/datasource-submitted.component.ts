import {Component, OnInit} from '@angular/core';
import {Datasource} from '../../domain/eic-model';
import {ActivatedRoute, Router} from '@angular/router';
import {environment} from '../../../environments/environment';
import {DatasourceService} from "../../services/datasource.service";

declare var UIkit: any;

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
  path: string;

  constructor(
    private route: ActivatedRoute,
    private datasourceService: DatasourceService
  ) {}

  ngOnInit(): void {
    this.datasourceId = this.route.snapshot.paramMap.get('datasourceId');
    console.log(this.datasourceId);

    this.datasourceService.getDatasource(this.datasourceId).subscribe(
      ds => {this.datasource = ds; console.log(ds)},
      error => {},
      () => {}
    )

    this.datasourceService.isItRegistered(this.datasourceId).subscribe(
      bool => this.registeredAtOpenAIRE = bool,
      error => {},
      () => {}
    )
  }
}
