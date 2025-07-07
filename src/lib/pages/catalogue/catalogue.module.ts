import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HighchartsChartModule} from 'highcharts-angular';
import {SharedModule} from '../../shared/shared.module';
import {CatalogueRouting} from './catalogue.routing';
import {ReusableComponentsModule} from '../../shared/reusablecomponents/reusable-components.module';
// import {MyServiceProvidersComponent} from './my-service-providers.component';
import {CatalogueFormComponent} from './catalogue-form.component';
import {UpdateCatalogueComponent} from "./update-catalogue.component";
import {MyCataloguesComponent} from "./my-catalogues.component";
import {CataloguesListComponent} from "../admin/catalogues-list.component";
import {NgSelectModule} from '@ng-select/ng-select';
import {LMarkdownEditorModule} from 'ngx-markdown-editor';
import {DynamicFormModule} from "../../../dynamic-catalogue/pages/dynamic-form/dynamic-form.module";


@NgModule({
    imports: [
        SharedModule,
        CommonModule,
        FormsModule,
        LMarkdownEditorModule,
        ReactiveFormsModule,
        CatalogueRouting,
        ReusableComponentsModule,
        HighchartsChartModule,
        NgSelectModule,
        DynamicFormModule
    ],
  declarations: [
    // MyServiceProvidersComponent,
    CatalogueFormComponent,
    UpdateCatalogueComponent,
    MyCataloguesComponent,
    CataloguesListComponent
  ]
})

export class CatalogueModule {
}
