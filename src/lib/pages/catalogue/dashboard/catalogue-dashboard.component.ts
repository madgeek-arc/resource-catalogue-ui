import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AuthenticationService} from '../../../services/authentication.service';
import {NavigationService} from '../../../services/navigation.service';
import {ResourceService} from '../../../services/resource.service';
import {environment} from '../../../../environments/environment';
import {ServiceProviderService} from '../../../services/service-provider.service';
import {CatalogueBundle, ProviderBundle} from '../../../domain/eic-model';
import {CatalogueService} from "../../../services/catalogue.service";


@Component({
    selector: 'app-catalogue-dashboard',
    templateUrl: './catalogue-dashboard.component.html',
    standalone: false
})
export class CatalogueDashboardComponent implements OnInit {

  catalogueId: string;
  catalogueStatus: string;
  catalogueBundle: CatalogueBundle;
  serviceORresource = environment.serviceORresource;

  constructor(public authenticationService: AuthenticationService,
              public resourceService: ResourceService,
              public catalogueService: CatalogueService,
              public serviceProviderService: ServiceProviderService,
              public navigator: NavigationService,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    // this.activeTab = this.route.firstChild.snapshot.routeConfig.path;
    this.catalogueId = this.route.snapshot.paramMap.get('catalogue');
    this.getCatalogue();
  }

  getCatalogue() {
    this.catalogueService.getCatalogueBundleById(this.catalogueId).subscribe(
      catalogueBundle => this.catalogueBundle = catalogueBundle,
      error =>  console.log(error),
      () => this.catalogueStatus = this.catalogueBundle.status
    );
  }

}
