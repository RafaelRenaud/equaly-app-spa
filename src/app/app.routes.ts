import { Routes } from '@angular/router';
import { AuthGuard } from './guard/auth.guard';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
  { path: '**', component: LoginComponent }
];
