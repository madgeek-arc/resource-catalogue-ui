import {Component, OnDestroy, OnInit} from '@angular/core';
import {SearchComponent} from '../../../../../../src/app/pages/search/search.component';
import {Validators} from '@angular/forms';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchExtendedComponent extends SearchComponent implements OnInit, OnDestroy {
  public serviceIdsArray: string[] = [];

  emailForm = this.fb.group({
    email: ['', Validators.compose([Validators.required, Validators.email])],
    name: ['', Validators.required],
    subject: ['', Validators.required],
    text: ['', Validators.required],
  });

  isChecked(serviceId: string) {
    return this.serviceIdsArray.indexOf(serviceId) > -1;
  }

  addOrRemove(serviceId: string) {
    const pos = this.serviceIdsArray.indexOf(serviceId);
    if (pos > -1) {
      this.serviceIdsArray.splice(pos, 1);
    } else {
      this.serviceIdsArray.push(serviceId);
    }
    if (this.authenticationService.isLoggedIn()) {
      this.emailForm.get('name').setValue(this.authenticationService.getUserProperty('given_name')
        + ' ' + this.authenticationService.getUserProperty('family_name'));
      this.emailForm.get('email').setValue(this.authenticationService.getUserProperty('email'));
    }
  }

  resetForm() {
    this.emailForm.get('subject').reset('');
    this.emailForm.get('text').reset('');
  }

  sendMail() {
    return this.emailService.sendMail(this.serviceIdsArray, this.emailForm);
  }

}
