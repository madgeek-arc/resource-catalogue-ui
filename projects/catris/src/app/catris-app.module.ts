import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { CatrisAppComponent } from './catris-app.component';
import {AppModule} from '../../../../src/app/app.module';
import {SharedModule} from '../../../../src/app/shared/shared.module';

@NgModule({
  declarations: [
    CatrisAppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AppModule,
    SharedModule
  ],
  providers: [],
  bootstrap: [CatrisAppComponent]
})
export class CatrisAppModule { }
