
import {NgModule} from '@angular/core';
import {JoinPipe} from './pipes/join.pipe';
import {KeysPipe} from './pipes/keys.pipe';
import {LookUpPipe} from './pipes/lookup.pipe';
import {PremiumSortPipe} from './pipes/premium-sort.pipe';
import {SafePipe} from './pipes/safe.pipe';
import {StringArraySortPipe} from './pipes/sort.pipe';
import {ValuesPipe} from './pipes/getValues.pipe';

@NgModule({
    imports: [],
    declarations: [
        JoinPipe,
        KeysPipe,
        StringArraySortPipe,
        LookUpPipe,
        PremiumSortPipe,
        SafePipe,
        ValuesPipe
    ],
    exports: [
        JoinPipe,
        KeysPipe,
        StringArraySortPipe,
        LookUpPipe,
        PremiumSortPipe,
        SafePipe,
        ValuesPipe
    ]
})
export class SharedModule {
}
