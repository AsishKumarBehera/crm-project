import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Signup } from './features/auth/signup/signup';
import { Home } from './features/dashboard/pages/home';
import { LeadComponent } from './features/leads/main_lead/lead'; 
import { MainDashboard } from './features/dashboard/main-dashboard/main-dashboard';
import { authGuard } from './core/guards/auth.guard';
import { LeadMainComponent } from './features/leads/pages/lead-main/lead-main'
import { UploadLeadCsv } from './features/leads/pages/upload-lead-csv/upload-lead-csv'

export const routes: Routes = [
  // ✅ ROOT PATH - Redirect to dashboard if logged in, else to login
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  
  // Public routes (no guard)
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  
  // Protected routes (with guard)
  {
    path: 'dashboard',
    component: Home,
    canActivate: [authGuard],
    children: [
      { path: '', component: MainDashboard },
      { path: 'leads', component: LeadComponent },
      { path: 'leads/:id', component: LeadMainComponent },
      { path: 'leads/upload-csv', component: UploadLeadCsv }
    ]
  },

  // Catch-all for undefined routes
  { path: '**', redirectTo: '/login' }
];