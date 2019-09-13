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

@NgModule({
  imports: [],
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
    NotFoundPageComponent
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
    ValuesPipe
  ]
})
export class SharedModule {
}
