import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Evita che il browser serva risposte API in cache: alle GET verso /api
 * aggiunge un parametro anti-cache e gli header no-cache. Così, dopo aver
 * modificato i dati, una nuova GET restituisce sempre i valori aggiornati
 * (il problema dell'anteprima che si aggiornava solo ricaricando la pagina).
 */
export const apiNoCacheInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method === 'GET' && req.url.includes('/api/')) {
    const fresh = req.clone({
      setParams: { _ts: Date.now().toString() },
      setHeaders: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    });
    return next(fresh);
  }
  return next(req);
};
