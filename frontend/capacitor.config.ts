import type { CapacitorConfig } from '@capacitor/cli';

// Wrapper nativo (Android/iOS). webDir = build generata da "ng build".
const config: CapacitorConfig = {
  appId: 'it.devcards.app',
  appName: 'DevCards',
  webDir: 'www',
  server: {
    // WebView su http://localhost: evita il blocco "mixed content" quando l'app
    // chiama il backend in HTTP (es. http://10.0.2.2:3000), e abilita il traffico
    // in chiaro necessario in sviluppo (vedi nativeApiUrl in environment.ts).
    androidScheme: 'http',
    cleartext: true,
  },
};

export default config;
