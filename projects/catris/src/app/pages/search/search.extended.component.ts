import {Component, OnDestroy, OnInit} from '@angular/core';
import {SearchComponent} from '../../../../../../src/app/pages/search/search.component';
import {Validators} from '@angular/forms';

declare var UIkit: any;


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchExtendedComponent extends SearchComponent implements OnInit, OnDestroy {
  public serviceIdsArray: string[] = [];
  public emailErrorMessage = '';

  emailForm = this.fb.group({
    recipientEmail: '',
    senderEmail: ['', Validators.compose([Validators.required, Validators.email])],
    senderName: ['', Validators.required],
    subject: ['', Validators.required],
    message: ['', Validators.required],
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
      this.emailForm.get('senderName').setValue(this.authenticationService.getUserProperty('given_name')
        + ' ' + this.authenticationService.getUserProperty('family_name'));
      this.emailForm.get('senderEmail').setValue(this.authenticationService.getUserProperty('email'));
    }
  }

  resetForm() {
    this.emailForm.get('subject').reset('');
    this.emailForm.get('message').reset('');
    this.emailErrorMessage = '';
  }

  sendMail() {
    this.emailErrorMessage = '';
    if (this.emailForm.valid) {
      this.emailService.sendMail(this.serviceIdsArray, this.emailForm.value).subscribe(
        res => UIkit.modal('#email-modal').hide(),
        err =>  this.emailErrorMessage = 'Something went bad, server responded: ' + err.error
      );
    } else {
      this.emailErrorMessage = 'Please fill the red outlined fields';
      for (const i in this.emailForm.controls) {
        this.emailForm.controls[i].markAsDirty();
      }
      this.emailForm.updateValueAndValidity();
    }
  }

}
