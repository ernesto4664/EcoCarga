// src/environments/environment.ts
import { Environment } from './environment.d';

export const environment: Environment = {
  production: false,
  googleMapsApiKey: 'AIzaSyC68WH6r39VEl-d3vP_h2XOT4hNs7KSmH4',
  googleMapsApiKeyIos: 'AIzaSyA7Hxp4ZsqFI8Mny-mydfmieGvqJhd_AsY', // Clave para iOS
  apiUrlSec: 'https://backend.electromovilidadenlinea.cl/locations',
  token: 'eyJraWQiOiJvSWM1K3NpU25yWnZ3...', // Token (truncado por seguridad)
  apiUrlWeb: 'https://ecocarga.minenergia.cl/api/TermsAndConditionsApi',
  apiUrlWebBateries: 'https://ecocarga.minenergia.cl/api/BateriasApi'
};
