import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aicompiler.app',
  appName: 'AI Compiler',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    backgroundColor: '#0f172a',
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    minVersion: 22,
    overrideUserAgent: 'AICompiler/1.0.0',
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0f172a'
    },
    ScreenOrientation: {
      allowedOrientations: ['portrait', 'landscape']
    }
  }
};

export default config;
