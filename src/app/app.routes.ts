import { Routes } from '@angular/router';
import { UserTableComponent } from './user-table/user-table';
import { LoginComponent } from './auth/login';
import { SignupComponent } from './auth/signup';
import { AuthGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'users', component: UserTableComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'login' }
];
