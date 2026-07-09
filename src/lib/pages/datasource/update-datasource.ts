import {Component, Injector, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DatePipe} from '@angular/common';
import {AuthenticationService} from '../../services/authentication.service';
import {Subscription} from 'rxjs';
import {ResourceService} from '../../services/resource.service';
import {NavigationService} from "../../services/navigation.service";
import {DatasourceFormComponent} from "./datasource-form.component";
import {FormControlService} from "../../../dynamic-catalogue/services/form-control.service";
import {ConfigService} from "../../services/config.service";
import {DatasourceService} from "../../services/datasource.service";
import {pidHandler} from "../../shared/pid-handler/pid-handler.service";
import {DeduplicationService} from "../../services/deduplication.service";

@Component({
    selector: 'app-update-datasource',
    templateUrl: './datasource-form.component.html',
    standalone: false
})
export class UpdateDatasource extends DatasourceFormComponent implements OnInit {
  private sub: Subscription;

  constructor(public route: ActivatedRoute,
              public router: Router,
              public authenticationService: AuthenticationService,
              protected datasourceService: DatasourceService,
              protected injector: Injector,
              public datePipe: DatePipe,
              public navigator: NavigationService,
              public dynamicFormService: FormControlService,
              public config: ConfigService,
              public pidHandler: pidHandler,
              public deduplicationService: DeduplicationService) {
    super(injector, authenticationService, datasourceService, route, router, dynamicFormService, config, pidHandler, deduplicationService);
    this.editMode = true;
  }

  ngOnInit() {
    super.ngOnInit();
    if (sessionStorage.getItem('service')) {
      sessionStorage.removeItem('service');
    } else {
      this.sub = this.route.params.subscribe(params => {
        // this.datasourceId = params['datasourceId'];
        this.datasourceId = this.route.snapshot.paramMap.get('datasourceId');
        const pathName = window.location.pathname;
        if (pathName.includes('draft-datasource/update')) this.pendingResource = true;
        if (this.pendingResource) {
          this.datasourceService.getDraftDatasource(this.datasourceId).subscribe(ds => {
                this.payloadAnswer = {'answer': {datasource: ds}};
              },
              err => this.errorMessage = 'Could not get the data for the requested datasource. ' + err.error
            );
        } else {
          // this.datasourceService[this.pendingResource ? 'getPendingDatasource' : 'getDatasourceBundleById'](this.datasourceId, this.catalogueId)
          this.datasourceService.getDatasourceBundleById(this.datasourceId).subscribe(dsBundle => {
              this.payloadAnswer = {'answer': {datasource: dsBundle.datasource}};
              ResourceService.removeNulls(dsBundle.datasource);
            },
            err => this.errorMessage = 'Could not get the data for the requested datasource. ' + err.error
          );
        }
      });
    }
  }

}
