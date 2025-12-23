import { Component } from "@angular/core";
import { ProviderBundle, Vocabulary } from "../../../../domain/eic-model";
import { ActivatedRoute } from "@angular/router";
import { ServiceProviderService } from "../../../../services/service-provider.service";
import { ReadonlyResourceInfoComponent } from "../../../../shared/readonly-resource-info/readonly-resource-info.component";
import { TitleCasePipe } from "@angular/common";
import { ResourceService } from "../../../../services/resource.service";

@Component({
  selector: 'app-catalogue-view',
  imports: [
    ReadonlyResourceInfoComponent,
    TitleCasePipe
  ],
  template: `
    <div class="uk-section uk-section-xsmall">
      <div class="uk-container uk-container-expand">

        <!-- BANNER -->
        @if (providerBundle) {
          <div class="uk-flex uk-flex-middle services-provider-container uk-margin-bottom">

            <div>
              <img [src]="provider.logo || '/assets/images/broken_image-black-48dp.svg'" style="max-width: 200px">
            </div>

            <div class="uk-margin-medium-left">
              <h3 class="uk-margin-remove">
                {{ provider.name }}
              </h3>
              <div class="">
                <span class="status-label">ID: </span>
                {{ provider.id }}
              </div>
              <div class="">
                <span class="status-label">Status: </span>
                {{ providerBundle.status | titlecase }}
              </div>
            </div>

          </div>
        }

        <!-- READONLY INFO WITH TABS -->
        <div class="uk-margin-top">
          <app-readonly-resource-info
            [model]="model"
            [data]="provider"
            [vocs]="vocs">
          </app-readonly-resource-info>
        </div>

      </div>
    </div>
  `
})
export class ProviderInfoComponent {

  providerId: string;
  provider: any;
  providerBundle: ProviderBundle;
  model: any;
  vocs: any = {};

  constructor(
    private route: ActivatedRoute,
    private providerService: ServiceProviderService,
    private resourceService: ResourceService
  ) {}

  ngOnInit() {
    this.providerId = this.route.parent.snapshot.paramMap.get('provider');
    this.getVocs();
    this.getProviderBundle();
    this.getModel('m-b-providertest');
  }

  getModel(modelId: string) {
    this.providerService.getFormModelById(modelId).subscribe(
      res => this.model = res,
      err => console.log(err)
    );
  }

  getVocs() {
    this.resourceService.getAllVocabulariesByType().subscribe(
      res => {
        this.vocs = res; // keep it simple, any type
      },
      err => console.log(err)
    );
  }

  getProviderBundle() {
    this.providerService.getServiceProviderBundleById(this.providerId).subscribe(
      providerBundle => {
        this.providerBundle = providerBundle;
        this.provider = this.providerBundle.provider;
      },
      error => console.log(error)
    );
  }

}
