import {Component, OnInit} from '@angular/core';
import {ServiceFormComponent} from '../../../../../../src/app/pages/eInfraServices/service-form.component';

@Component({
  selector: 'app-service-form',
  templateUrl: '../../../../../../src/app/pages/eInfraServices/service-form.component.html',
  styleUrls: ['../../../../../../src/app/pages/serviceprovider/service-provider-form.component.css']
})
export class ServiceUploadExtendedComponent extends ServiceFormComponent implements OnInit {

  ngOnInit() {
    super.ngOnInit();
    this.serviceName = 'Catris';
  }
}
