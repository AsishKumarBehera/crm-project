import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Signup } from './features/auth/signup/signup';
import { Home } from './features/dashboard/pages/home';
import { Profile } from './features/profile/profile';
import { LeadComponent } from './features/leads/main_lead/lead'; 
import { MainDashboard } from './features/dashboard/main-dashboard/main-dashboard';


export const routes: Routes = [
  { path: '', component: Login },
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: 'profile', component: Profile },

  {
  path: 'dashboard',
  component: Home,
  children: [
    { path: '', component: MainDashboard },
    { path: 'leads', component: LeadComponent },
  ]
}
];