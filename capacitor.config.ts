import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bochelmicrocredito.app',
  appName: 'Bochel Microcrédito',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  },
  android: {
    webContentsDebuggingEnabled: false
  },
  ios: {
    webContentsDebuggingEnabled: false
  }
};

export default config;