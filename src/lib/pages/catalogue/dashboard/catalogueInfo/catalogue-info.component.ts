import {Component, OnInit} from '@angular/core';
import {Catalogue, CatalogueBundle, ProviderRequest, Type, Vocabulary} from '../../../../domain/eic-model';
import {ActivatedRoute} from '@angular/router';
import {isNullOrUndefined} from '../../../../shared/tools';
import {ServiceProviderService} from '../../../../services/service-provider.service';
import {ResourceService} from '../../../../services/resource.service';
import {CatalogueService} from "../../../../services/catalogue.service";

@Component({
  selector: 'app-catalogue-info',
  templateUrl: './catalogue-info.component.html'
})
export class CatalogueInfoComponent implements OnInit {

  catalogueId: string;
  catalogue: Catalogue;
  catalogueBundle: CatalogueBundle;
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
  hostingLegalEntityVocabulary: Vocabulary[] = null;

  constructor(private route: ActivatedRoute,
              private providerService: ServiceProviderService,
              private catalogueService: CatalogueService,
              public resourceService: ResourceService) {}

  ngOnInit(): void {

    this.setVocabularies();

    this.catalogueId = this.route.parent.snapshot.paramMap.get('catalogue');
    this.getCatalogueBundle();

    // if (!isNullOrUndefined(this.catalogueId) && (this.catalogueId !== '')) {
    //   this.providerService.getProviderRequests(this.catalogueId).subscribe(
    //     res => this.requests = res,
    //     err => console.log(err)
    //   );
    // }
  }

  getCatalogueBundle() {
    this.catalogueService.getCatalogueBundleById(this.catalogueId).subscribe(
      catalogueBundle => {
        this.catalogueBundle = catalogueBundle;
      }, error => {
        console.log(error);
      }, () => {
        this.catalogue = this.catalogueBundle.catalogue;
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
        this.hostingLegalEntityVocabulary = this.vocabularies[Type.PROVIDER_HOSTING_LEGAL_ENTITY];
        return this.vocabularies;
      },
      error => console.log(JSON.stringify(error.error)),
      () => {
        return this.vocabularies;
      }
    );
  }

  getNameFromVocabulary(vocabulary: Vocabulary[], id: string) {
    if (vocabulary && id) {
      return vocabulary.find(x => x.id === id)?.name;
    }
  }

}
