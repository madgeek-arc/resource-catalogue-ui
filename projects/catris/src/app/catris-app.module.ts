import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { CatrisAppComponent } from './catris-app.component';
import {AppModule} from '../../../../src/app/app.module';
import {SharedModule} from '../../../../src/app/shared/shared.module';
import {TopmenuCatrisComponent} from './shared/topmenu/topmenu-catris.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BreadcrumbsComponent} from './shared/breadcrumbs/breadcrumbs.component';
import {SideElementsComponent} from './shared/sideelements/side-elements.component';
import {FooterComponent} from './shared/footer/footer.component';
import {HomeCatrisComponent} from './pages/home/home-catris.component';
import {ServiceLandingPageExtendedComponent} from './pages/landingpages/service/service-landing-page.extended.component';
import {ChartModule} from 'angular2-highcharts';
import {StarRatingModule} from 'angular-star-rating';
import {SearchExtendedComponent} from './pages/search/search.extended.component';
import {ReusableComponentsModule} from '../../../../src/app/shared/reusablecomponents/reusable-components.module';
import {CookieLawModule} from '../../../../src/app/shared/reusablecomponents/cookie-law/cookie-law.module';
import {TreeviewModule} from 'ngx-treeview';
import {CompareServicesExtendedComponent} from './pages/compare/compare-services.extended.component';
import {ServiceUploadExtendedComponent} from './pages/catrisService/service-upload-extended.component';
import {CKEditorModule} from 'ng2-ckeditor';
import {ServiceEditExtendedComponent} from './pages/catrisService/service-edit-extended.component';
import {AccordionSectionCatrisComponent} from './pages/catrisService/accordion-section-catris.component';
import {AddFistServiceExtendedComponent} from './pages/catrisService/add-fist-service-extended.component';
import {BrowseSubcategoriesComponent} from './pages/browseSubcategories/browse-subcategories.component';

@NgModule({
  declarations: [
    CatrisAppComponent,
    TopmenuCatrisComponent,
    BreadcrumbsComponent,
    SideElementsComponent,
    FooterComponent,
    HomeCatrisComponent,
    ServiceLandingPageExtendedComponent,
    SearchExtendedComponent,
    CompareServicesExtendedComponent,
    AccordionSectionCatrisComponent,
    ServiceUploadExtendedComponent,
    ServiceEditExtendedComponent,
    AddFistServiceExtendedComponent,
    BrowseSubcategoriesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AppModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    ReusableComponentsModule,
    StarRatingModule.forRoot(),
    TreeviewModule.forRoot(),
    ChartModule,
    CookieLawModule,
    CKEditorModule,
  ],
  providers: [],
  bootstrap: [CatrisAppComponent]
})
export class CatrisAppModule { }
