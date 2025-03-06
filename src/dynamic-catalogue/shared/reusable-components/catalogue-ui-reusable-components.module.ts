import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReadMoreComponent, ReadMoreTextComponent} from './read-more.component';
import {HttpClientJsonpModule, HttpClientModule} from "@angular/common/http";

@NgModule({
    imports: [
        CommonModule,
        HttpClientModule,
        HttpClientJsonpModule
    ],
    declarations: [
        ReadMoreComponent,
        ReadMoreTextComponent,
    ],
    exports: [
        ReadMoreComponent,
        ReadMoreTextComponent,
    ],
    providers: []
})
export class CatalogueUiReusableComponentsModule {
}
