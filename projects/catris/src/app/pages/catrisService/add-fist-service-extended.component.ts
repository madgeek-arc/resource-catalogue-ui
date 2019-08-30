import {Component, OnInit} from '@angular/core';
import {AddFirstServiceComponent} from '../../../../../../src/app/pages/serviceprovider/add-first-service.component';

@Component({
  selector: 'app-add-first-service',
  templateUrl: '../../../../../../src/app/pages/eInfraServices/service-form.component.html'
})
export class AddFistServiceExtendedComponent extends AddFirstServiceComponent implements OnInit {

  ngOnInit() {
    super.ngOnInit();
    this.serviceName = 'Catris';
  }

}
