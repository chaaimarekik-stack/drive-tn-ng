import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.initializeSession().pipe(map((isAuthenticated) => (isAuthenticated ? true : router.createUrlTree(['/auth/login']))));
};

export const loginRedirectGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.initializeSession().pipe(map((isAuthenticated) => (isAuthenticated ? router.createUrlTree(['/']) : true)));
};
