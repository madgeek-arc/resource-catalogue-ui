import {Component, OnInit} from '@angular/core';
import {ServiceEditComponent} from '../../../../../../src/app/pages/eInfraServices/service-edit.component';

@Component({
  selector: 'app-service-edit',
  templateUrl: '../../../../../../src/app/pages/eInfraServices/service-form.component.html',
  styleUrls: ['../../../../../../src/app/pages/serviceprovider/service-provider-form.component.css']
})

export class ServiceEditExtendedComponent extends ServiceEditComponent implements OnInit {

  ngOnInit() {
    super.ngOnInit();
    this.serviceName = 'Catris';
  }

}
