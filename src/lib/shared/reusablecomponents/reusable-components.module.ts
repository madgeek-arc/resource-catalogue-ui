import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HelpContentService} from '../../services/help-content.service';
import {ReadMoreComponent, ReadMoreTextComponent} from './read-more.component';
import {HttpClientJsonpModule, HttpClientModule} from "@angular/common/http";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        HttpClientJsonpModule
    ],
    declarations: [
        ReadMoreComponent,
        ReadMoreTextComponent
    ],
    exports: [
        ReadMoreComponent,
        ReadMoreTextComponent
    ],
    providers: [
        HelpContentService
    ]
})
export class ReusableComponentsModule {
}
