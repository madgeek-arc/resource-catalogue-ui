import {Component, OnInit} from '@angular/core';
import {Provider, ProviderBundle, ProviderRequest, Type, Vocabulary} from '../../../../domain/eic-model';
import {ActivatedRoute} from '@angular/router';
import {isNullOrUndefined} from 'util';
import {ServiceProviderService} from '../../../../services/service-provider.service';
import {ResourceService} from '../../../../services/resource.service';

@Component({
  selector: 'app-provider-info',
  templateUrl: './provider-info.component.html'
})
export class ProviderInfoComponent implements OnInit {

  providerId: string;
  provider: Provider;
  providerBundle: ProviderBundle;
  requests: ProviderRequest[] = [];

  vocabularies: Map<string, Vocabulary[]> = null;
  placesVocabulary: Vocabulary[] = null;
  providerTypeVocabulary: Vocabulary[] = null;
  providerLCSVocabulary: Vocabulary[] = null;
  domainsVocabulary: Vocabulary[] = null;
  categoriesVocabulary: Vocabulary[] = null;
  merilDomainsVocabulary: Vocabulary[] = null;
  merilCategoriesVocabulary: Vocabulary[] = null;
  esfriDomainVocabulary: Vocabulary[] = null;
  legalStatusVocabulary: Vocabulary[] = null;
  esfriVocabulary: Vocabulary[] = null;
  areasOfActivityVocabulary: Vocabulary[] = null;
  networksVocabulary: Vocabulary[] = null;
  societalGrandChallengesVocabulary: Vocabulary[] = null;

  constructor(private route: ActivatedRoute,
              private providerService: ServiceProviderService,
              public resourceService: ResourceService) {}

  ngOnInit(): void {

    this.setVocabularies();

    this.providerId = this.route.parent.snapshot.paramMap.get('provider');
    this.getProviderBundle();
    // this.getProvider();

    if (!isNullOrUndefined(this.providerId) && (this.providerId !== '')) {
      this.providerService.getProviderRequests(this.providerId).subscribe(
        res => this.requests = res,
        err => console.log(err)
      );
    }
  }

  getProviderBundle() {
    this.providerService.getServiceProviderBundleById(this.providerId).subscribe(
      providerBundle => {
        this.providerBundle = providerBundle;
      }, error => {
        console.log(error);
      }, () => {
        this.provider = this.providerBundle.provider;
      }
    );
  }

  setVocabularies() {
    this.resourceService.getAllVocabulariesByType().subscribe(
      res => {
        this.vocabularies = res;
        this.placesVocabulary = this.vocabularies[Type.COUNTRY];
        this.providerTypeVocabulary = this.vocabularies[Type.PROVIDER_STRUCTURE_TYPE];
        this.providerLCSVocabulary = this.vocabularies[Type.PROVIDER_LIFE_CYCLE_STATUS];
        this.domainsVocabulary = this.vocabularies[Type.SCIENTIFIC_DOMAIN];
        this.categoriesVocabulary = this.vocabularies[Type.SCIENTIFIC_SUBDOMAIN];
        this.merilDomainsVocabulary = this.vocabularies[Type.PROVIDER_MERIL_SCIENTIFIC_DOMAIN];
        this.merilCategoriesVocabulary = this.vocabularies[Type.PROVIDER_MERIL_SCIENTIFIC_SUBDOMAIN];
        this.esfriDomainVocabulary = this.vocabularies[Type.PROVIDER_ESFRI_DOMAIN];
        this.legalStatusVocabulary = this.vocabularies[Type.PROVIDER_LEGAL_STATUS];
        this.esfriVocabulary = this.vocabularies[Type.PROVIDER_ESFRI_TYPE];
        this.areasOfActivityVocabulary = this.vocabularies[Type.PROVIDER_AREA_OF_ACTIVITY];
        this.networksVocabulary = this.vocabularies[Type.PROVIDER_NETWORK];
        this.societalGrandChallengesVocabulary = this.vocabularies[Type.PROVIDER_SOCIETAL_GRAND_CHALLENGE];
        return this.vocabularies;
      },
      error => console.log(JSON.stringify(error.error)),
      () => {
        return this.vocabularies;
      }
    );
  }

  getNameFromVocabulary(vocabulary: Vocabulary[], id: string) {
    if (id) {
      return vocabulary.find(x => x.id === id).name;
    }
  }

}
