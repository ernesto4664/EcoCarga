import { NgModule, CUSTOM_ELEMENTS_SCHEMA, APP_INITIALIZER } from '@angular/core';
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
import { ConfigService } from './services/config.service'; // Importa el nuevo servicio

import { IonicStorageModule } from '@ionic/storage-angular';

import { StationDetailsModalComponent } from './station-details-modal/station-details-modal.component';

register(); // Registra los componentes personalizados de Swiper

// Función para cargar la configuración al inicio
export function initializeApp(configService: ConfigService): () => Promise<any> {
  return () =>
    new Promise((resolve) => {
      configService.loadConfig().subscribe({
        next: (config) => {
          configService.setApiUrlSec(config.apiUrlSec); // Guarda la URL dinámica
          resolve(true);
        },
        error: (error) => {
          console.error('Error al cargar configuración dinámica:', error);
          resolve(true); // Resuelve aunque falle
        },
      });
    });
}

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
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    GlobalDataService,
    ApiService,
    ConfigService, // Registra el ConfigService
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [ConfigService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
