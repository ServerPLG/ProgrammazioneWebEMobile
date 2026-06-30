// Ambiente di PRODUZIONE (build servita da Express con "npm run build").
// Sul web app e API stanno sulla stessa origine -> percorsi relativi.
export const environment = {
  production: true,
  // Web servito da Express (stessa origine) -> percorsi relativi "/api/...".
  apiUrl: '',
  // App nativa (Android/iOS): IP del PC che esegue il backend nella stessa rete.
  // Emulatore Android: http://10.0.2.2:3000; telefono reale: http://IP-LAN:3000.
  nativeApiUrl: 'http://10.0.2.2:3000',
};
