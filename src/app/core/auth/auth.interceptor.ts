import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);

export const authInterceptor: HttpInterceptorFn = (request, next) => {
    if (request.context.get(SKIP_AUTH)) {
        return next(request);
    }

    const authService = inject(AuthService);
    const accessToken = authService.getAccessToken();

    const authenticatedRequest = accessToken ? request.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } }) : request;

    return next(authenticatedRequest).pipe(
        catchError((error: unknown) => {
            if (!(error instanceof HttpErrorResponse) || error.status !== 401 || isAuthEndpoint(request.url)) {
                return throwError(() => error);
            }

            return authService.refreshToken().pipe(
                switchMap((response) => next(request.clone({ setHeaders: { Authorization: `Bearer ${response.accessToken}` } }))),
                catchError((refreshError) => {
                    authService.clearSession();
                    return throwError(() => refreshError);
                })
            );
        })
    );
};

function isAuthEndpoint(url: string): boolean {
    return ['/api/auth/login', '/api/auth/refresh', '/api/auth/logout'].some((endpoint) => url.includes(endpoint));
}
