import { Routes } from '@angular/router';
import { Access } from './access';
import { Login } from './login';
import { Error } from './error';
import { authGuard, loginRedirectGuard } from '@/app/core/auth/auth.guard';

export default [
    { path: 'access', component: Access, canActivate: [authGuard] },
    { path: 'error', component: Error, canActivate: [authGuard] },
    { path: 'login', component: Login, canActivate: [loginRedirectGuard] }
] as Routes;
