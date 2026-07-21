import {Component, Injector, OnInit} from '@angular/core';
import {Provider, Type} from '../../domain/eic-model';
import {ServiceProviderFormComponent} from './service-provider-form.component';
import {ResourceService} from '../../services/resource.service';
import {UntypedFormBuilder} from '@angular/forms';
import {AuthenticationService} from '../../services/authentication.service';
import {ServiceProviderService} from '../../services/service-provider.service';
import {ActivatedRoute, Router} from '@angular/router';
import {CatalogueService} from "../../services/catalogue.service";
import {NavigationService} from "../../services/navigation.service";
import {pidHandler} from "../../shared/pid-handler/pid-handler.service";
import {FormControlService} from "../../../dynamic-catalogue/services/form-control.service";
import {ConfigService} from "../../services/config.service";

declare let UIkit: any;

@Component({
    selector: 'app-update-service-provider',
    templateUrl: './service-provider-form.component.html',
    standalone: false
})
export class UpdateServiceProviderComponent extends ServiceProviderFormComponent implements OnInit {
  errorMessage: string;
  provider: Provider;

  constructor(public fb: UntypedFormBuilder,
              public authService: AuthenticationService,
              public serviceProviderService: ServiceProviderService,
              public resourceService: ResourceService,
              public catalogueService: CatalogueService,
              public router: Router,
              public route: ActivatedRoute,
              public navigator: NavigationService,
              public pidHandler: pidHandler,
              public formService: FormControlService,
              public config: ConfigService,
              public injector: Injector) {
    super(fb, authService, serviceProviderService, resourceService, catalogueService, router, route, navigator, pidHandler, formService, config, injector);
  }

  ngOnInit() {
    this.editMode = true;
    const path = this.route.snapshot.routeConfig.path;
    this.providerId = this.route.snapshot.paramMap.get('providerId');
    if (path === 'view/:catalogueId/:providerId') {
      this.disable = true;
    }
    this.getProvider();
    super.ngOnInit();
  }

  getProvider() {
    this.errorMessage = '';
    const path = this.route.snapshot.routeConfig.path;
    this.serviceProviderService[(path === 'add/:providerId' ? 'getPendingProviderById' : 'getServiceProviderById')](this.providerId)
      .subscribe(
        provider => {
          this.provider = provider;
          const parsedProvider = {
            ...this.provider,
            legalEntity: typeof this.provider.legalEntity === 'boolean' ? this.provider.legalEntity.toString() : this.provider.legalEntity
          };
          this.payloadAnswer = {'answer': {organisation: parsedProvider}};
        },
        err => {
          console.log(err);
          this.errorMessage = 'Something went wrong.';
        },
        () => {
          if(this.provider.users===null && this.provider.mainContact===null && path!=='add/:providerId') //in case of unauthorized access backend will not show sensitive info (drafts excluded)
            this.router.navigateByUrl('/forbidden')
          // console.log(Object.keys(this.provider));

          ResourceService.removeNulls(this.provider);
        }
      );
  }

}
