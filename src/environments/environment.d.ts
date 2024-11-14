// src/environments/environment.d.ts
export interface Environment {
  production: boolean;
  googleMapsApiKey: string;
  googleMapsApiKeyIos: string; // Aceptando la clave para iOS
  apiUrlSec: string;
  token: string;
  apiUrlWeb: string;
  apiUrlWebBateries: string;
}