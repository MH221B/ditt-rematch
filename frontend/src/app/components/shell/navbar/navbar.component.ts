import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SearchDropdownComponent } from '../search-dropdown/search-dropdown.component';
import { Tool } from '../../../models/tool.model';
import { AuthService } from '../../../services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, SearchDropdownComponent],
  template: `
    <header class="p-1 navbar-bg">
      <div class="container p-0">
        <nav class="navbar navbar-expand-xxl">
          <div class="container-fluid">
            <!-- Navbar Brand and Offcanvas Toggle Button -->
            <div class="d-flex align-items-center">
              <!-- Menu Icon Button -->
              <button class="btn btn-outline-light me-2" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasMenu" aria-controls="offcanvasMenu">
                <i class="bi bi-list fs-2"></i>
              </button>

              <!-- Navbar Brand -->
              <a class="navbar-brand" [href]="isAdmin ? '/admin' : '/'">DITT</a>

              <!-- Nav Links -->
              <ul class="navbar-nav">
                @if (!isAdmin) {
                  <li class="nav-item">
                    <a class="nav-link" href="/upload">Upload</a>
                  </li>
                }
              </ul>

              <!-- Favorite Tools Link (non-admin only) -->
              @if (!isAdmin) {
                <ul class="navbar-nav ms-2">
                  <li class="nav-item">
                    <a class="nav-link" href="/favorites">Favorite Tools</a>
                  </li>
                </ul>
              }
            </div>

            <!-- Dynamic User Dropdown or Login/Signup Buttons -->
            <div class="ms-auto d-flex align-items-center">
              <!-- Search Dropdown -->
              <app-search-dropdown
                [isAdmin]="isAdmin"
                (toolSelected)="onToolSelected($event)"
                class="me-3"
              ></app-search-dropdown>
              @if (isLoggedIn) {
                <!-- Dropdown Menu for Logged-In User -->
                <div class="dropdown">
                  <button class="btn btn-outline-light dropdown-toggle d-flex align-items-center" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="bi bi-person-circle me-2"></i>
                    <span>{{ username }}</span>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                    @if (!isAdmin && !isPremium) {
                      <li>
                        <a class="dropdown-item" href="#" (click)="setPremium()">Go Premium</a>
                      </li>
                    }
                    @if (!isAdmin && isPremium) {
                      <li>
                        <a class="dropdown-item text-muted" href="#">Go Premium</a>
                      </li>
                    }
                    <li>
                      <a class="dropdown-item" href="#" (click)="logout()" [class.loading]="isLoggingOut">
                        @if (isLoggingOut) {
                          <span>Logging out...</span>
                        } @else {
                          <span>Logout</span>
                        }
                      </a>
                    </li>
                  </ul>
                </div>
              } @else {
                <!-- Login and Register Buttons -->
                <a href="/login" class="btn btn-outline-light me-2">Login</a>
                <a href="/register" class="btn btn-primary">Sign Up</a>
              }
            </div>
          </div>
        </nav>
      </div>
    </header>
  `
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Output() toolSelected = new EventEmitter<Tool>();

  isLoggedIn = false;
  username = 'User';
  isAdmin = false;
  isPremium = false;
  isLoggingOut = false;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Initial state update
    this.updateAuthState();

    // Subscribe to auth state changes
    this.authService.userChanged
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateAuthState();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateAuthState(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
    if (this.isLoggedIn) {
      this.username = this.authService.getUserEmail() || 'User';
      
      // Extract admin/premium roles from user
      const roles = this.authService.getUserRoles();
      this.isAdmin = roles.includes('Admin');
      this.isPremium = roles.includes('PremiumUser');
    } else {
      this.username = 'User';
      this.isAdmin = false;
      this.isPremium = false;
    }
  }

  onToolSelected(tool: Tool): void {
    this.toolSelected.emit(tool);
  }

  setPremium(): void {
    if (this.isLoggingOut) return;

    this.isLoggingOut = true;

    this.authService.upgradeToPremium()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          // Update user info with new roles
          const currentUser = this.authService.getCurrentUser();
          if (currentUser && response.user) {
            currentUser.roles = response.user.roles;
            this.authService.setCurrentUser(currentUser);
          }

          // Show success message
          Swal.fire({
            title: 'Success',
            text: 'Successfully upgraded to Premium!',
            icon: 'success'
          });
          this.isLoggingOut = false;
        },
        error: (error) => {
          this.isLoggingOut = false;
          const errorMessage = error.error?.message || 'Failed to upgrade to premium';
          Swal.fire({
            title: 'Error',
            text: errorMessage,
            icon: 'error'
          });
          console.error('Premium upgrade error:', error);
        },
        complete: () => {
          this.isLoggingOut = false;
        }
      });
  }

  logout(): void {
    if (this.isLoggingOut) return;

    this.isLoggingOut = true;

    this.authService.logout()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Clear auth state
          this.authService.clearAuth();

          // Show success message
          Swal.fire({
            title: 'Success',
            text: 'Logged out successfully',
            icon: 'success'
          });

          // Redirect to login
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.isLoggingOut = false;
          // Still clear auth state even if logout fails on backend
          this.authService.clearAuth();
          Swal.fire({
            title: 'Notice',
            text: 'Logout complete (backend error, but local session cleared)',
            icon: 'info'
          });
          this.router.navigate(['/login']);
        },
        complete: () => {
          this.isLoggingOut = false;
        }
      });
  }
}