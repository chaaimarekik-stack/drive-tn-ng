import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, finalize, shareReplay, tap, throwError } from 'rxjs';
import { AuthResponse, LoginRequest } from './auth.model';
import { SKIP_AUTH } from './auth.interceptor';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly http = inject(HttpClient);

    private readonly apiBaseUrl = 'http://localhost:63998/api/auth';

    private readonly accessTokenSubject = new BehaviorSubject<string | null>(null);

    private readonly isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

    private refreshRequest$: Observable<AuthResponse> | null = null;

    readonly isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

    login(request: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiBaseUrl}/login`, request, { withCredentials: true, context: new HttpContext().set(SKIP_AUTH, true) }).pipe(
            tap((response) => this.setSession(response.accessToken))
        );
    }

    refreshToken(): Observable<AuthResponse> {
        if (this.refreshRequest$) {
            return this.refreshRequest$;
        }

        this.refreshRequest$ = this.http.post<AuthResponse>(`${this.apiBaseUrl}/refresh`, {}, { withCredentials: true, context: new HttpContext().set(SKIP_AUTH, true) }).pipe(
            tap((response) => this.setSession(response.accessToken)),
            catchError((error) => {
                this.clearSession();
                return throwError(() => error);
            }),
            finalize(() => {
                this.refreshRequest$ = null;
            }),
            shareReplay(1)
        );

        return this.refreshRequest$;
    }

    logout(): Observable<void> {
        return this.http.post<void>(`${this.apiBaseUrl}/logout`, {}, { withCredentials: true, context: new HttpContext().set(SKIP_AUTH, true) }).pipe(
            finalize(() => this.clearSession())
        );
    }

    getAccessToken(): string | null {
        return this.accessTokenSubject.value;
    }

    clearSession(): void {
        this.accessTokenSubject.next(null);
        this.isAuthenticatedSubject.next(false);
    }

    private setSession(accessToken: string): void {
        this.accessTokenSubject.next(accessToken);
        this.isAuthenticatedSubject.next(true);
    }
}
