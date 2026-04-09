import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthRequest, User } from '../models/auth.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/api/auth`;
  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'user_info';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  /**
   * Login with email and password
   */
  login(email: string, password: string): Observable<any> {
    const request: AuthRequest = { email, password };
    return this.http.post(`${this.apiUrl}/login`, request);
  }

  /**
   * Register with email and password
   */
  register(email: string, password: string): Observable<any> {
    const request: AuthRequest = { email, password };
    return this.http.post(`${this.apiUrl}/register`, request);
  }

  /**
   * Logout current user
   */
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {});
  }

  /**
   * Store token in localStorage
   */
  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * Get token from localStorage
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Store user info in localStorage
   */
  setCurrentUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  /**
   * Get current user info from localStorage
   */
  getCurrentUser(): User | null {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired();
  }

  /**
   * Check if token is expired
   * Decodes JWT and checks exp claim
   */
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  /**
   * Clear auth state (token and user info)
   */
  clearAuth(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  /**
   * Get user email (for navbar display)
   */
  getUserEmail(): string {
    const user = this.getCurrentUser();
    return user?.email || '';
  }

  /**
   * Get user roles
   */
  getUserRoles(): string[] {
    const user = this.getCurrentUser();
    return user?.roles || [];
  }
}
