import { Routes } from '@angular/router';
import { Login } from './login/login';

export const routes: Routes = [
  { path: 'login', component: Login, title: 'Anmelden – Science Helpdesk' },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
