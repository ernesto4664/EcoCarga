import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'EcoCarga',
  webDir: 'www',
  bundledWebRuntime: false,
  plugins: {
    GoogleMaps: {
      apiKey: 'AIzaSyCNM9lXDeD3hLfe7Es4KNqkL8J2jsZ_W8I',
    },
  },
};

export default config;