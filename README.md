# App-EcoCarga

App-EcoCarga es una aplicación para la gestión y monitoreo de estaciones de carga de vehículos eléctricos.

## Despliegue del proyecto

### Requisitos previos
- Node.js >= 16.x
- Ionic CLI: `npm install -g @ionic/cli`
- Capacitor: `npm install @capacitor/core @capacitor/cli`

### Instalación del proyecto
1. Clona el repositorio:
   git clone https://gitlab.minenergia.cl/metasoft-soluciones/app-ecocarga.git
   cd app-ecocarga
  
2. Instala dependencias:
   npm install --legacy-peer-deps

3. Ejecuta el proyecto localmente:
   npm run start

4. Construye la versión para pruebas locales o desarrollo:
   ionic build --configuration development

5. Sincroniza con Capacitor y abre el proyecto en Android Studio:
   npx cap sync
   npx cap open android

6. Ejecuta la aplicación en modo de desarrollo:
   ionic serve

### Notas adicionales

1. Es altamente recomendable instalar Android Studio para gestionar los emuladores o dispositivos físicos de manera más eficiente. Puedes descargar Android Studio desde https://developer.android.com/studio.

2. `ionic serve` es ideal para el desarrollo diario, ya que proporciona un servidor local que actualiza automáticamente la vista al detectar cambios.

3. `npx cap sync` garantiza que cualquier cambio en las dependencias o configuraciones se refleje en las plataformas móviles como Android o iOS.

4. Asegúrate de tener los controladores USB instalados si vas a probar en un dispositivo físico Android.

Con este README, cualquier miembro del equipo o nuevo desarrollador podrá ejecutar y desplegar el proyecto de manera eficiente en cualquier máquina.
