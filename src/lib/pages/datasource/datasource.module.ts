import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HighchartsChartModule} from 'highcharts-angular';
import {SharedModule} from '../../shared/shared.module';
import {DatasourceRouting} from "./datasource.routing";
import {ReusableComponentsModule} from '../../shared/reusablecomponents/reusable-components.module';
// import {MyServiceProvidersComponent} from './my-service-providers.component';
import {DatasourceFormComponent} from "./datasource-form.component";
import {UpdateDatasourceComponent} from "./update-datasource.component";
import {NgSelectModule} from '@ng-select/ng-select';
import {LMarkdownEditorModule} from 'ngx-markdown-editor';


@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    LMarkdownEditorModule,
    ReactiveFormsModule,
    DatasourceRouting,
    ReusableComponentsModule,
    HighchartsChartModule,
    NgSelectModule,

  ],
  declarations: [
    // MyServiceProvidersComponent,
    DatasourceFormComponent,
    UpdateDatasourceComponent
  ]
})

export class DatasourceModule {
}
