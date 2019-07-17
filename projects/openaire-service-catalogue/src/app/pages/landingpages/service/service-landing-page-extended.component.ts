import {Component, OnInit} from '@angular/core';
import {ServiceLandingPageComponent} from '../../../../../../../src/app/pages/landingpages/service/service-landing-page.component';

@Component({
  selector: 'app-landing-page',
  templateUrl: 'service-landing-page.component.html',
  styleUrls: ['../landing-page.component.css']
})

export class ServiceLandingPageExtendedComponent extends ServiceLandingPageComponent implements OnInit {
  canAddOrEditService = false;

  ngOnInit() {
    this.canAddOrEditService = false;
    super.ngOnInit();
    if (this.myProviders && this.myProviders.length > 0) {
      this.canAddOrEditService = this.myProviders.some( p => this.richService.service.providers.some(x => x === p.id) );
    }
  }
}
