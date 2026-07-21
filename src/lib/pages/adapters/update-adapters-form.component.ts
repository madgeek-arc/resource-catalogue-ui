import {Component, Injector, OnInit} from '@angular/core';
import {Adapter} from '../../domain/eic-model';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthenticationService} from "../../services/authentication.service";
import {ResourceService} from "../../services/resource.service";
import {pidHandler} from "../../shared/pid-handler/pid-handler.service";
import {ConfigService} from "../../services/config.service";
import {AdaptersFormComponent} from "./adapters-form.component";
import {AdaptersService} from "../../services/adapters.service";
import {FormControlService} from "../../../dynamic-catalogue/services/form-control.service";


@Component({
    selector: 'app-update-adapters-form',
    templateUrl: './adapters-form.component.html',
    standalone: false
})
export class UpdateAdaptersFormComponent extends AdaptersFormComponent implements OnInit {
  errorMessage: string;
  adapter: Adapter;
  adapterId: string;

  constructor(protected injector: Injector,
              protected authenticationService: AuthenticationService,
              protected adaptersService: AdaptersService,
              protected route: ActivatedRoute,
              protected router: Router,
              protected config: ConfigService,
              public pidHandler: pidHandler) {
    super(injector, authenticationService, adaptersService, route, router, config, pidHandler);
  }

  ngOnInit() {
    this.editMode = true;
    this.adapterId = this.route.snapshot.paramMap.get('adapterId');
    const path = this.route.snapshot.routeConfig.path;
    if (path === 'info/:adapterId') {
      this.disable = true;
    }
    super.ngOnInit();
    if (sessionStorage.getItem('adapter')) {
      sessionStorage.removeItem('adapter');
    } else {
      this.getAdapter();
    }
  }

  getAdapter() {
    this.errorMessage = '';
    const path = this.route.snapshot.routeConfig.path;
    this.adaptersService.getAdapterById(this.adapterId).subscribe(
        adapter => {
          this.adapter = adapter;
          this.payloadAnswer = {'answer': {adapter: adapter}};
        },
        err => {
          console.log(err);
          this.errorMessage = 'Something went wrong.';
        },
        () => {
          ResourceService.removeNulls(this.adapter);
        }
      );
  }

  toggleDisable() {
    this.disable = !this.disable;
    // this.adaptersForm.enable();
  }

}
