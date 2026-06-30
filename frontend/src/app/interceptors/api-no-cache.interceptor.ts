import { HttpInterceptorFn } from '@angular/common/http';

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
