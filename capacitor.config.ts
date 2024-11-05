import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'mn.ecocarga.starter', // Asegúrate de que este appId sea el correcto para tu proyecto
  appName: 'EcoCarga', // Nombre de la app
  webDir: 'www', // Directorio donde se encuentra la app compilada
  bundledWebRuntime: false,
  server: {
    cleartext: true, // Permitir tráfico HTTP durante el desarrollo, pero preferible HTTPS en producción
    allowNavigation: [
      'https://ecocargaqa.minenergia.cl', // Dominio de la API que necesitas permitir
      // Si tu backend usa otros dominios, puedes agregarlos aquí
    ],
  },
  android: {
    allowMixedContent: true, // Permitir contenido mixto HTTP y HTTPS en Android si es necesario
  }
};

export default config;