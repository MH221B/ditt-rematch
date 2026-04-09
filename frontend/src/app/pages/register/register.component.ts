import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="register-container">
      <div class="register-card">
        <h2>Register</h2>

        @if (isSubmitted && errorMessage) {
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
              placeholder="Enter a strong password"
              [disabled]="isLoading"
              required
            />
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              class="form-control"
              [(ngModel)]="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm your password"
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
              <span>Registering...</span>
            } @else {
              <span>Register</span>
            }
          </button>
        </form>

        <div class="login-link">
          <p>Already have an account? <a routerLink="/login">Login here</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: var(--background-color);
      padding: 20px;
    }

    .register-card {
      width: 100%;
      max-width: 450px;
      background-color: var(--secondary-color-1);
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
      border: 1px solid var(--secondary-color);
    }

    .register-card h2 {
      text-align: center;
      margin-bottom: 30px;
      color: var(--text-color);
      font-size: 28px;
      font-weight: 600;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      color: var(--text-color);
      font-weight: 500;
      font-size: 14px;
    }

    .form-control {
      width: 100%;
      padding: 10px 15px;
      border: 1px solid var(--secondary-color-2);
      border-radius: 4px;
      font-size: 14px;
      transition: border-color 0.3s;
      background-color: var(--background-color);
      color: var(--text-color);
    }

    .form-control::placeholder {
      color: rgba(235, 244, 246, 0.5);
      opacity: 1;
    }

    .form-control:focus {
      outline: none;
      border-color: var(--secondary-color);
      background-color: var(--secondary-color-1);
      color: var(--text-color);
      box-shadow: none;
    }

    .form-control:disabled {
      background-color: #f5f5f5;
      cursor: not-allowed;
    }

    .form-text {
      display: block;
      margin-top: 5px;
      font-size: 12px;
      color: #999;
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
      background-color: var(--primary-color);
      color: var(--text-color);
    }

    .btn-primary:hover:not(:disabled) {
      background-color: var(--secondary-color);
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(8, 131, 149, 0.3);
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

    .login-link {
      text-align: center;
      margin-top: 20px;
      font-size: 14px;
      color: var(--text-color);
    }

    .login-link a {
      color: var(--secondary-color);
      text-decoration: none;
      font-weight: 600;
    }

    .login-link a:hover {
      text-decoration: underline;
    }
  `]
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  isSubmitted: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    // Validation
    this.isSubmitted = true;

    if (!this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    if (this.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters long';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(this.email, this.password).subscribe({
      next: (response) => {
        // Store token and user info
        this.authService.setToken(response.token);
        if (response.user) {
          this.authService.setCurrentUser(response.user);
        }

        // Navigate to home
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
