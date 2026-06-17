// L'app viene servita da Express, quindi le API sono relative ("/api/...").
// In sviluppo con "ionic serve" si puo' puntare al backend impostando apiUrl.
export const environment = {
  production: false,
  // Lascia vuoto per usare percorsi relativi (build servita da Express).
  // Per "ionic serve" su porta diversa, usa: 'http://localhost:3333'
  apiUrl: '',
};
