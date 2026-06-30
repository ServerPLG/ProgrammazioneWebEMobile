// Ambiente di SVILUPPO (ng serve con proxy.conf.json, porta 4200).
// Le chiamate /api vengono inoltrate al backend su :3000 dal proxy di Angular.
export const environment = {
  production: false,
  // Il proxy.conf.json inoltra /api/* -> http://localhost:3000/api/* automaticamente.
  apiUrl: '',
  // App nativa (Android/iOS): non puo' usare percorsi relativi ne' "localhost"
  // (sul telefono punta al telefono). Emulatore Android: http://10.0.2.2:3000;
  // telefono reale: http://IP-LAN-del-PC:3000 (es. http://192.168.1.100:3000).
  nativeApiUrl: 'http://10.0.2.2:3000',
};
