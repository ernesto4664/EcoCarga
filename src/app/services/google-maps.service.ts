import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsService {
  googleMapsApiKey: string;

  constructor(private platform: Platform) {
    // Determina la clave de API basada en la plataforma
    this.googleMapsApiKey = this.platform.is('ios') 
      ? environment.googleMapsApiKeyIos 
      : environment.googleMapsApiKey;
  }

  loadGoogleMaps() {
    // Usa `this.googleMapsApiKey` para cargar el API de Google Maps
  }
}