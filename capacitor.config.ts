import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.0a6e2f1926974f15a0c4428a2e61560b',
  appName: 'boch-lend-flow-ai',
  webDir: 'dist',
  server: {
    url: "https://0a6e2f19-2697-4f15-a0c4-428a2e61560b.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;