import {
  Component, OnInit,
} from '@angular/core';
import {AuthenticationService} from '../../../lib/services/authentication.service';
import {CatalogueService} from "../../../lib/services/catalogue.service";
import {environment} from '../../../environments/environment';

declare var UIkit: any;

@Component({
  selector: 'contact-info-modal',
  templateUrl: './contact-info-modal.component.html'
})

export class ContactInfoModalComponent implements OnInit {

  beta = environment.beta;

  listOfProvidersAndCatalogues: any;
  checkboxChecked: boolean = false;

  constructor(public authenticationService: AuthenticationService, public catalogueService: CatalogueService) {}

  ngOnInit(): void {
    if (this.authenticationService.isLoggedIn()) {
      this.catalogueService.getContactInfo().subscribe(
        res => {
          this.listOfProvidersAndCatalogues = res;
        },
        error => {
          console.log(error);
        },
        () => {
          console.log(this.listOfProvidersAndCatalogues);
          if (this.listOfProvidersAndCatalogues) {
            UIkit.modal('#modal-info-consent').show();
          }
        }
      );
    }
  }

  contactInfoTransferAcceptance(bool: boolean){
    this.catalogueService.setContactInfoTransfer(bool).subscribe(
      res => {},
      error => {},
      () => {}
    );
  }

}
