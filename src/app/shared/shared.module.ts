import {NgModule} from '@angular/core';
import {JoinPipe} from './pipes/join.pipe';
import {KeysPipe} from './pipes/keys.pipe';
import {LookUpPipe} from './pipes/lookup.pipe';
import {PremiumSortFacetsPipe, PremiumSortFundersPipe, PremiumSortPipe} from './pipes/premium-sort.pipe';
import {SafePipe} from './pipes/safe.pipe';
import {StringArraySortPipe} from './pipes/sort.pipe';
import {ValuesPipe} from './pipes/getValues.pipe';
import { ForbiddenPageComponent } from './forbidden-page/forbidden-page.component';
import { NotFoundPageComponent } from './not-found-page/not-found-page.component';
import { EmailModalComponent } from './email-modal/email-modal.component';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  declarations: [
    JoinPipe,
    KeysPipe,
    StringArraySortPipe,
    LookUpPipe,
    PremiumSortPipe,
    PremiumSortFacetsPipe,
    PremiumSortFundersPipe,
    SafePipe,
    ValuesPipe,
    ForbiddenPageComponent,
    NotFoundPageComponent,
    EmailModalComponent
  ],
  exports: [
    JoinPipe,
    KeysPipe,
    StringArraySortPipe,
    LookUpPipe,
    PremiumSortPipe,
    PremiumSortFacetsPipe,
    PremiumSortFundersPipe,
    SafePipe,
    ValuesPipe,
    EmailModalComponent
  ]
})
export class SharedModule {
}
