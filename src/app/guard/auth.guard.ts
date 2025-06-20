import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const AuthGuard: CanActivateFn = (route, state) => {
  const token = sessionStorage.getItem('authToken');

  if (token) {
    return true;
  } else {
    const router = inject(Router);
    return router.parseUrl('/login');
  }
};
