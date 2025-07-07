import {Component, OnInit} from '@angular/core';
import {ServiceProviderService} from '../../services/service-provider.service';
import {ResourceService} from '../../services/resource.service';
import {AuthenticationService} from '../../services/authentication.service';
import {AdapterBundle} from '../../domain/eic-model';
import {zip} from 'rxjs';
import {AdaptersService} from "../../services/adapters.service";
import {pidHandler} from "../../shared/pid-handler/pid-handler.service";

@Component({
  selector: 'app-my-adapters',
  templateUrl: './my-adapters.component.html'
})
export class MyAdaptersComponent implements OnInit {

  errorMessage: string;
  noAdaptersMessage: string;

  myAdapters: AdapterBundle[];

  myApprovedAdapters: AdapterBundle[] = [];
  myPendingActionAdapters: AdapterBundle[] = [];
  myRejectedAdapters: AdapterBundle[] = [];

  isApprovedChecked = true;
  isPendingChecked = true;
  isRejectedChecked = true;

  constructor(
    private serviceProviderService: ServiceProviderService,
    private adaptersService: AdaptersService,
    private resourceService: ResourceService,
    public authenticationService: AuthenticationService,
    public pidHandler: pidHandler
  ) {
  }

  ngOnInit() {
    zip(this.adaptersService.getMyAdapters())
      .subscribe(
        res => {
          this.myAdapters = res[0];
        },
        err => {
          this.errorMessage = 'An error occurred!';
          console.error(err);
        },
        () => {
          this.myAdapters.forEach(
            p => {
              this.assignAdapterToList(p);
            }
          );
          if (this.myAdapters.length === 0) {
            this.noAdaptersMessage = 'You have not yet registered any Adapters.';
          }
        }
      );
  }

  assignAdapterToList(p: AdapterBundle) {
    if (p.status === 'rejected adapter') {
      this.myRejectedAdapters.push(p);
    } else if ((p.status === 'approved adapter')) {
      this.myApprovedAdapters.push(p);
    } else {
      this.myPendingActionAdapters.push(p);
    }
  }

  onCheckChanged(e, status: string) {
    if (status === 'approved adapter') {
      this.isApprovedChecked = e.target.checked;
    } else if (status === 'pending adapter') {
      this.isPendingChecked = e.target.checked;
    } else if (status === 'rejected adapter') {
      this.isRejectedChecked = e.target.checked;
    }
  }

}
