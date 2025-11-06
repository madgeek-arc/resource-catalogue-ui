import {Component, OnInit} from '@angular/core';
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

declare var UIkit: any;

@Component({
    selector: 'app-update-service-provider',
    templateUrl: './service-provider-form.component.html',
    styleUrls: ['./service-provider-form.component.css'],
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
              public config: ConfigService) {
    super(fb, authService, serviceProviderService, resourceService, catalogueService, router, route, navigator, pidHandler, formService, config);
  }

  ngOnInit() {
    this.editMode = true;
    const path = this.route.snapshot.routeConfig.path;
    this.providerId = this.route.snapshot.paramMap.get('providerId');
    if (path.includes(':catalogueId')) {
      this.catalogueId = this.route.snapshot.paramMap.get('catalogueId');
    }
    if (path === 'view/:catalogueId/:providerId') {
      this.disable = true;
    }

    if (sessionStorage.getItem('service')) {
      sessionStorage.removeItem('service');
    } else {
      if (this.vocabularies === null) {
        this.resourceService.getAllVocabulariesByType().subscribe(
          res => {
            this.vocabulariesMap = res;

            this.vocabularies = res;
            this.placesVocabulary = this.vocabularies[Type.COUNTRY];
            this.providerTypeVocabulary = this.vocabularies[Type.PROVIDER_STRUCTURE_TYPE];
            this.providerLCSVocabulary = this.vocabularies[Type.PROVIDER_LIFE_CYCLE_STATUS];
            this.domainsVocabulary = this.vocabularies[Type.SCIENTIFIC_DOMAIN];
            this.categoriesVocabulary = this.vocabularies[Type.SCIENTIFIC_SUBDOMAIN];
            this.esfriDomainVocabulary = this.vocabularies[Type.PROVIDER_ESFRI_DOMAIN];
            this.legalStatusVocabulary = this.vocabularies[Type.PROVIDER_LEGAL_STATUS];
            this.esfriVocabulary = this.vocabularies[Type.PROVIDER_ESFRI_TYPE];
            this.areasOfActivityVocabulary = this.vocabularies[Type.PROVIDER_AREA_OF_ACTIVITY];
            this.networksVocabulary = this.vocabularies[Type.PROVIDER_NETWORK];
            this.societalGrandChallengesVocabulary = this.vocabularies[Type.PROVIDER_SOCIETAL_GRAND_CHALLENGE];
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
    super.ngOnInit();
  }

  getProvider() {
    this.errorMessage = '';
    const path = this.route.snapshot.routeConfig.path;
    this.serviceProviderService[(path === 'add/:providerId' ? 'getPendingProviderById' : 'getServiceProviderById')](this.providerId, this.catalogueId)
      .subscribe(
        provider => {
          this.provider = provider;
          const parsedProvider = {
            ...this.provider,
            legalEntity: typeof this.provider.legalEntity === 'boolean' ? this.provider.legalEntity.toString() : this.provider.legalEntity
          };
          this.payloadAnswer = {'answer': {Provider: parsedProvider}};
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
