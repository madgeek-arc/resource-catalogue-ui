import {Component, Injector, OnInit} from '@angular/core';
        import {Catalogue} from '../../domain/eic-model';
import {ResourceService} from '../../services/resource.service';
import {UntypedFormBuilder} from '@angular/forms';
import {AuthenticationService} from '../../services/authentication.service';
import {ServiceProviderService} from '../../services/service-provider.service';
import {ActivatedRoute, Router} from '@angular/router';
import {CatalogueFormComponent} from "./catalogue-form.component";
import {CatalogueService} from "../../services/catalogue.service";
import {FormControlService} from "../../../dynamic-catalogue/services/form-control.service";
import {ConfigService} from "../../services/config.service";
import {pidHandler} from "../../shared/pid-handler/pid-handler.service";
import {DeduplicationService} from "../../services/deduplication.service";

declare let UIkit: any;

@Component({
    selector: 'app-update-catalogue',
    templateUrl: './catalogue-form.component.html',
    standalone: false
})
export class UpdateCatalogueComponent extends CatalogueFormComponent implements OnInit {
  errorMessage: string;
  catalogue: Catalogue;

  constructor(public fb: UntypedFormBuilder,
              public authService: AuthenticationService,
              public serviceProviderService: ServiceProviderService,
              public catalogueService: CatalogueService,
              public resourceService: ResourceService,
              public router: Router,
              public route: ActivatedRoute,
              public dynamicFormService: FormControlService,
              public config: ConfigService,
              public pidhandler: pidHandler,
              public deduplicationService: DeduplicationService,
              public injector: Injector) {
    super(fb, authService, serviceProviderService, catalogueService, resourceService, router, route, dynamicFormService, config, pidhandler, deduplicationService, injector);
  }

  ngOnInit() {
    this.editMode = true;
    this.catalogueId = decodeURIComponent(this.route.snapshot.paramMap.get('catalogueId'));
    // const path = this.route.snapshot.routeConfig.path;
    // if (path === 'info/:catalogueId') {
    //   this.viewOnlyMode = true;
    // }
    this.getProvider();
    super.ngOnInit();
  }

  getProvider() {
    this.errorMessage = '';
    const path = this.route.snapshot.routeConfig.path;
    this.catalogueService[(path === 'add/:catalogueId' ? 'getPendingProviderById' : 'getCatalogueById')](this.catalogueId)
      .subscribe(
        catalogue => {
          this.catalogue = catalogue;
          const parsedCatalogue = {
            ...this.catalogue,
            legalEntity: typeof this.catalogue.legalEntity === 'boolean' ? this.catalogue.legalEntity.toString() : this.catalogue.legalEntity
          };
          this.payloadAnswer = {'answer': {catalogue: parsedCatalogue}};
        },
        err => {
          console.log(err);
          this.errorMessage = 'Something went wrong.';
        },
        () => {
          if(this.catalogue.users===null && this.catalogue.mainContact===null) //in case of unauthorized access backend will not show sensitive info
            this.router.navigateByUrl('/forbidden')
          // console.log(Object.keys(this.catalogue));
          ResourceService.removeNulls(this.catalogue);
        }
      );
  }

}
