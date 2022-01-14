import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-dashboard-breadcrumbs',
  templateUrl: './dashboard-breadcrumbs.component.html',
})
export class DashboardBreadcrumbsComponent implements OnInit {

  providerId: string;
  resourceId: string;
  pathToDashboard: string;
  isSharedDashboard = -1;

  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit() {

    this.providerId = this.activatedRoute.snapshot.paramMap.get('providerId');
    this.resourceId = this.activatedRoute.snapshot.paramMap.get('resourceId');

    this.isSharedDashboard = window.location.href.indexOf("shared-resource-dashboard");

    this.pathToDashboard = `/dashboard/${this.providerId}/stats`;
  }

}
