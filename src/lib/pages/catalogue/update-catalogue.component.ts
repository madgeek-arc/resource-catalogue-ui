import {Component, OnInit} from '@angular/core';
import {Catalogue, Provider, Type} from '../../domain/eic-model';
import {ServiceProviderFormComponent} from '../provider/service-provider-form.component';
import {ResourceService} from '../../services/resource.service';
import {UntypedFormBuilder} from '@angular/forms';
import {AuthenticationService} from '../../services/authentication.service';
import {ServiceProviderService} from '../../services/service-provider.service';
import {ActivatedRoute, Router} from '@angular/router';
import {CatalogueFormComponent} from "./catalogue-form.component";
import {CatalogueService} from "../../services/catalogue.service";
import {FormControlService} from "../../../dynamic-catalogue/services/form-control.service";
import {ConfigService} from "../../services/config.service";

declare var UIkit: any;

@Component({
  selector: 'app-update-catalogue',
  templateUrl: './catalogue-form.component.html',
  // styleUrls: ['./service-provider-form.component.css']
  // providers: [FormControlService]
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
              public config: ConfigService) {
    super(fb, authService, serviceProviderService, catalogueService, resourceService, router, route, dynamicFormService, config);
  }

  ngOnInit() {
    this.editMode = true;
    this.catalogueId = this.route.snapshot.paramMap.get('catalogueId');
    const path = this.route.snapshot.routeConfig.path;
    if (path === 'info/:catalogueId') {
      this.disable = true;
    }
    super.ngOnInit();
    if (sessionStorage.getItem('service')) {
      sessionStorage.removeItem('service');
    } else {
      if (this.vocabularies === null) {
        this.resourceService.getAllVocabulariesByType().subscribe(
          res => {
            this.vocabularies = res;
            this.placesVocabulary = this.vocabularies[Type.COUNTRY];
            this.providerTypeVocabulary = this.vocabularies[Type.PROVIDER_STRUCTURE_TYPE];
            this.domainsVocabulary = this.vocabularies[Type.SCIENTIFIC_DOMAIN];
            this.categoriesVocabulary = this.vocabularies[Type.SCIENTIFIC_SUBDOMAIN];
            this.legalStatusVocabulary = this.vocabularies[Type.PROVIDER_LEGAL_STATUS];
            this.networksVocabulary = this.vocabularies[Type.PROVIDER_NETWORK];
            this.hostingLegalEntityVocabulary = this.vocabularies[Type.PROVIDER_HOSTING_LEGAL_ENTITY];
          },
          error => console.log(error),
          () => {
            this.getProvider();
          }
        );
      } else {
        this.getProvider();
      }
    }
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
          this.payloadAnswer = {'answer': {Catalogue: parsedCatalogue}};
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
