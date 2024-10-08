import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { ComponentsModule } from './components/components.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HttpClientModule } from '@angular/common/http';
import { register } from 'swiper/element/bundle';

import { SafeUrlPipe } from './station-details/safe-url.pipe';

import { GlobalDataService } from './global-data.service'; // Ajusta la ruta según sea necesario
import { ApiService } from './api.service';

import { IonicStorageModule } from '@ionic/storage-angular';

import { StationDetailsModalComponent } from './station-details-modal/station-details-modal.component';

register(); // Registra los componentes personalizados de Swiper

@NgModule({
  declarations: [AppComponent, SafeUrlPipe, StationDetailsModalComponent],
  imports: [
    BrowserModule, 
    IonicModule.forRoot(),
    AppRoutingModule, 
    HttpClientModule,
    ComponentsModule,
    IonicStorageModule.forRoot() 
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    GlobalDataService,
    ApiService
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
