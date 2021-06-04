import {NgModule} from '@angular/core';
import {JoinPipe} from './pipes/join.pipe';
import {KeysPipe} from './pipes/keys.pipe';
import {LookUpPipe} from './pipes/lookup.pipe';
import {PremiumSortFacetsPipe, PremiumSortPipe} from './pipes/premium-sort.pipe';
import {SafePipe} from './pipes/safe.pipe';
import {StringArraySortPipe} from './pipes/sort.pipe';
import {ValuesPipe} from './pipes/getValues.pipe';
import { ForbiddenPageComponent } from './forbidden-page/forbidden-page.component';
import { NotFoundPageComponent } from './not-found-page/not-found-page.component';
import { EmailModalComponent } from './email-modal/email-modal.component';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
// import {StarRatingModule} from 'angular-star-rating'; // FIXME: not supported on this angular version
import {BreadcrumbsComponent} from './breadcrumbs/breadcrumbs.component';
import {RouterModule} from '@angular/router';
import {PendingServicesComponent} from '../pages/provider/dashboard/pendingservices/pending-services.component';
import {PreviewResourceComponent} from '../pages/previewresource/preview-resource.component';
import {ChartModule} from 'angular2-highcharts';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    // StarRatingModule.forRoot(), // FIXME: not supported on this angular version
    RouterModule,
    ChartModule
  ],
  declarations: [
    JoinPipe,
    KeysPipe,
    StringArraySortPipe,
    LookUpPipe,
    PremiumSortPipe,
    PremiumSortFacetsPipe,
    SafePipe,
    ValuesPipe,
    ForbiddenPageComponent,
    NotFoundPageComponent,
    EmailModalComponent,
    BreadcrumbsComponent,
    PendingServicesComponent,
    PreviewResourceComponent
  ],
  exports: [
    JoinPipe,
    KeysPipe,
    StringArraySortPipe,
    LookUpPipe,
    PremiumSortPipe,
    PremiumSortFacetsPipe,
    SafePipe,
    ValuesPipe,
    EmailModalComponent,
    // StarRatingModule, // FIXME: not supported on this angular version
    BreadcrumbsComponent,
    PendingServicesComponent,
    PreviewResourceComponent
  ]
})
export class SharedModule {
}
