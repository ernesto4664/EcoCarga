import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'EcoCarga',
  webDir: 'www',
  bundledWebRuntime: false,
  plugins: {
    GoogleMaps: {
      apiKey: 'AIzaSyBcpB4-Tq5jXCLIsrvlWmKsnv1Et6ZQ7mU',
    },
  },
};

export default config;