import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule, JsonpModule} from '@angular/http';
import {BrowserModule} from '@angular/platform-browser';
import {HelpContentService} from '../../services/help-content.service';
import {AsideHelpContentComponent, HelpContentComponent} from './help-content.component';
import {ReadMoreComponent, ReadMoreTextComponent} from './read-more.component';

@NgModule({
    imports: [
        BrowserModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        JsonpModule
    ],
    declarations: [
        ReadMoreComponent,
        ReadMoreTextComponent,
        HelpContentComponent,
        AsideHelpContentComponent
    ],
    exports: [
        ReadMoreComponent,
        ReadMoreTextComponent,
        HelpContentComponent,
        AsideHelpContentComponent
    ],
    providers: [
        HelpContentService
    ]
})
export class ReusableComponentsModule {
}
