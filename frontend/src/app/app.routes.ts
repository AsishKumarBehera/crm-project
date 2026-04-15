import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Signup } from './auth/signup/signup';
import { Home } from './dashboard/home';
import { authGuard } from './guards/auth.guard';


export const routes: Routes = [
  { path: '', component: Login },
  { path: 'signup', component: Signup },
  { path: 'dashboard', component: Home, canActivate: [authGuard] },
];
