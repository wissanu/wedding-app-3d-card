import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StarrySkyComponent } from './starry-sky/starry-sky.component';
import { HomeComponent } from './home/home.component';
import { LayoutModule } from '@angular/cdk/layout';
import { LoadingComponent } from './utility/loading/loading.component';
import {register} from 'swiper/element/bundle';

register();

@NgModule({
  declarations: [
    AppComponent,
    StarrySkyComponent,
    HomeComponent,
    LoadingComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    LayoutModule,
  ],
  providers: [
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
