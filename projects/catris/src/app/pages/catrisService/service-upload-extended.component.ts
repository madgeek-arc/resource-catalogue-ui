import {Component, OnInit} from '@angular/core';
import {ServiceFormComponent} from '../../../../../../src/app/pages/eInfraServices/service-form.component';

@Component({
  selector: 'app-service-form',
  templateUrl: '../../../../../../src/app/pages/eInfraServices/service-form.component.html'
})
export class ServiceUploadExtendedComponent extends ServiceFormComponent implements OnInit {

  ngOnInit() {
    super.ngOnInit();
    this.serviceName = 'Catris';
  }
}
