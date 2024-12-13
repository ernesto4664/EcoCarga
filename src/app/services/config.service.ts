import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private apiConfigUrl = 'https://ecocarga.minenergia.cl/lastendpoint'; // Endpoint para obtener la URL dinámica
  private dynamicApiUrlSec: string = ''; // Almacena la URL dinámica

  constructor(private http: HttpClient) {}

  // Método para obtener la configuración del nuevo endpoint
  loadConfig(): Observable<any> {
    return this.http.get(this.apiConfigUrl);
  }

  // Método para guardar la URL dinámica
  setApiUrlSec(url: string): void {
    this.dynamicApiUrlSec = url;
  }

  // Método para exponer la URL dinámica
  getApiUrlSec(): string {
    return this.dynamicApiUrlSec;
  }
}