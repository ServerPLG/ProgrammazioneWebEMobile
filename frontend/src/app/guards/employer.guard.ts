import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Consente l'accesso solo ai datori di lavoro loggati. */
export const employerGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn() && auth.isEmployer()) {
    return true;
  }
  return router.parseUrl('/login');
};
