import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>Login</h2>

        @if (errorMessage) {
          <div class="alert alert-danger" role="alert">
            {{ errorMessage }}
          </div>
        }

        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email:</label>
            <input
              type="email"
              id="email"
              class="form-control"
              [(ngModel)]="email"
              name="email"
              placeholder="Enter your email"
              [disabled]="isLoading"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">Password:</label>
            <input
              type="password"
              id="password"
              class="form-control"
              [(ngModel)]="password"
              name="password"
              placeholder="Enter your password"
              [disabled]="isLoading"
              required
            />
          </div>

          <button
            type="submit"
            class="btn btn-primary w-100"
            [disabled]="isLoading"
          >
            @if (isLoading) {
              <span>Logging in...</span>
            } @else {
              <span>Login</span>
            }
          </button>
        </form>

        <div class="signup-link">
          <p>Don't have an account? <a routerLink="/register">Sign up here</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    }

    .login-card h2 {
      text-align: center;
      margin-bottom: 30px;
      color: #333;
      font-size: 28px;
      font-weight: 600;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      color: #555;
      font-weight: 500;
      font-size: 14px;
    }

    .form-control {
      width: 100%;
      padding: 10px 15px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      transition: border-color 0.3s;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-control:disabled {
      background-color: #f5f5f5;
      cursor: not-allowed;
    }

    .btn {
      padding: 10px 15px;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background-color: #667eea;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #5568d3;
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
    }

    .btn-primary:disabled {
      background-color: #ccc;
      cursor: not-allowed;
      opacity: 0.7;
    }

    .w-100 {
      width: 100%;
    }

    .alert {
      padding: 12px 15px;
      border-radius: 4px;
      margin-bottom: 20px;
      font-size: 14px;
    }

    .alert-danger {
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      color: #721c24;
    }

    .signup-link {
      text-align: center;
      margin-top: 20px;
      font-size: 14px;
    }

    .signup-link a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }

    .signup-link a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        // Store token and user info
        this.authService.setToken(response.token);
        if (response.user) {
          this.authService.setCurrentUser(response.user);
        }

        // Redirect to home
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Login failed. Please try again.';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
