// app.routes.ts
import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Signup } from './features/auth/signup/signup';
import { Home } from './features/dashboard/pages/home';
import { LeadComponent } from './features/leads/main_lead/lead'; 
import { MainDashboard } from './features/dashboard/main-dashboard/main-dashboard';
import { authGuard } from './core/guards/auth.guard';
import { LeadMainComponent } from './features/leads/pages/lead-main/lead-main'

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  
  {
    path: 'dashboard',
    component: Home,
    canActivate: [authGuard],   // ← guard on parent protects ALL children
    children: [
      { path: '', component: MainDashboard },
      { path: 'leads', component: LeadComponent },
      { path: 'leads/:id', component: LeadMainComponent }
    ]
  }
];