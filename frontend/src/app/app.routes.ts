import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { UploadComponent } from './pages/upload/upload.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AuthGuard } from './guards/auth.guard';
import { AlreadyLoggedInGuard } from './guards/already-logged-in.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [AlreadyLoggedInGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [AlreadyLoggedInGuard] },
  { path: '', component: HomeComponent },
  { path: 'upload', component: UploadComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'login' }
];
