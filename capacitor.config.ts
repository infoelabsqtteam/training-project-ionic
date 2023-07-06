import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tech.elabs.ionic',
  appName: 'E-Labs',
  webDir: 'www',
  bundledWebRuntime: false,
  server: {
    "url": "http://192.168.1.18:8100",
    "cleartext": true
  },
};

export default config;
