import type { CapacitorConfig } from '@capacitor/cli';

// Configurazione di Capacitor (wrapper nativo Android/iOS/Desktop).
// webDir punta alla cartella generata da "ionic build" / "ng build".
const config: CapacitorConfig = {
  appId: 'it.devcards.app',
  appName: 'DevCards',
  webDir: 'www',
};

export default config;
