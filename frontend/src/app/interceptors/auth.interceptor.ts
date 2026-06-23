import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor di autenticazione JWT.
 * - Allega l'header "Authorization: Bearer <token>" alle chiamate /api quando
 *   c'è un token salvato (le rotte protette del backend lo richiedono).
 * - Se il server risponde 401 (token mancante/scaduto) pulisce la sessione e
 *   riporta l'utente al login.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getToken();

  let authReq = req;
  if (token && req.url.includes('/api/')) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        auth.clear();
        router.navigateByUrl('/login');
      }
      return throwError(() => error);
    })
  );
};
