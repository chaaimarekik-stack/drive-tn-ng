import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (): boolean | UrlTree => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.getAccessToken() ? true : router.createUrlTree(['/auth/login']);
};

export const loginRedirectGuard: CanActivateFn = (): boolean | UrlTree => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.getAccessToken() ? router.createUrlTree(['/']) : true;
};
