import {Component} from "@angular/core";
import {Catalogue, CatalogueBundle} from "../../../../domain/eic-model";
import {ActivatedRoute} from "@angular/router";
import {CatalogueService} from "../../../../services/catalogue.service";
import {ServiceProviderService} from "../../../../services/service-provider.service";
import {TitleCasePipe} from "@angular/common";
import {ReadonlyResourceInfoComponent} from "../../../../shared/readonly-resource-info/readonly-resource-info.component";
import {ResourceService} from "../../../../services/resource.service";

@Component({
  selector: 'app-catalogue-view',
  imports: [
    TitleCasePipe,
    ReadonlyResourceInfoComponent
  ],
  template: `
    <div class="uk-section uk-section-xsmall">
      <div class="uk-container uk-container-expand">

        <!-- BANNER -->
        @if (catalogueBundle) {
          <div class="uk-flex uk-flex-middle services-provider-container uk-margin-bottom">

            <div>
              <img [src]="catalogue.logo || '/assets/images/broken_image-black-48dp.svg'" style="max-width: 200px">
            </div>

            <div class="uk-margin-medium-left">
              <h3 class="uk-margin-remove">
                {{ catalogue.name }}
              </h3>
              <div class="">
                <span class="status-label">ID: </span>
                {{ catalogue.id }}
              </div>
              <div class="">
                <span class="status-label">Status: </span>
                {{ catalogueBundle.status | titlecase }}
              </div>
            </div>

          </div>
        }
        <!-- READONLY INFO WITH TABS -->
        <div class="uk-margin-top">
          <app-readonly-resource-info
            [model]="model"
            [data]="catalogue"
            [vocs]="vocs">
          </app-readonly-resource-info>
        </div>

      </div>
    </div>
  `
})
export class CatalogueInfoComponent {

  catalogueId: string;
  catalogue: Catalogue;
  catalogueBundle: CatalogueBundle;
  model: any;
  vocs: any = {};

  constructor(private route: ActivatedRoute,
              private resourceService: ResourceService,
              private providerService: ServiceProviderService,
              private catalogueService: CatalogueService) {}

  ngOnInit() {
    this.catalogueId = this.route.parent.snapshot.paramMap.get('catalogue');
    this.getVocs();
    this.getCatalogueBundle();
    this.getModel('m-b-catalogue');
  }

  getModel(modelId: string) {
    this.providerService.getFormModelById(modelId).subscribe(
      res => this.model = res,
      err => console.log(err)
    )
  }

  getVocs() {
    this.resourceService.getAllVocabulariesByType().subscribe(
      res => {
        this.vocs = res; // keep it simple, any type
      },
      err => console.log(err)
    );
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

}
