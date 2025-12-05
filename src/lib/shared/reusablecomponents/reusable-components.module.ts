import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HelpContentService} from '../../services/help-content.service';
import {ReadMoreComponent, ReadMoreTextComponent} from './read-more.component';
import { provideHttpClient, withInterceptorsFromDi, withJsonpSupport } from "@angular/common/http";

@NgModule({ declarations: [
        ReadMoreComponent,
        ReadMoreTextComponent
    ],
    exports: [
        ReadMoreComponent,
        ReadMoreTextComponent
    ], imports: [CommonModule,
        FormsModule,
        ReactiveFormsModule], providers: [
        HelpContentService,
        provideHttpClient(withInterceptorsFromDi(), withJsonpSupport())
    ] })
export class ReusableComponentsModule {
}
