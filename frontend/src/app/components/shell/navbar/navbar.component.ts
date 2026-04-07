import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchDropdownComponent } from '../search-dropdown/search-dropdown.component';
import { Tool } from '../../../models/tool.model';

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
              @if (!isAdmin) {
                <button class="btn btn-outline-light me-2" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasMenu" aria-controls="offcanvasMenu">
                  <i class="bi bi-list fs-2"></i>
                </button>
              }

              <!-- Navbar Brand -->
              <a class="navbar-brand" [href]="isAdmin ? '/admin' : '/'">DITT</a>

              <!-- Nav Links -->
              <ul class="navbar-nav">
                <li class="nav-item">
                  <a class="nav-link" href="/upload">Upload</a>
                </li>
                @if (isAdmin) {
                  <li class="nav-item">
                    <a class="nav-link" href="/admin/manage-request">Manage Requests</a>
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

            <!-- Search Dropdown -->
            @if (!isAdmin) {
              <app-search-dropdown
                [isAdmin]="isAdmin"
                (toolSelected)="onToolSelected($event)"
              ></app-search-dropdown>
            }

            <!-- Dynamic User Dropdown or Login/Signup Buttons -->
            <div class="ms-auto">
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
                    <li><a class="dropdown-item" href="#" (click)="logout()">Logout</a></li>
                  </ul>
                </div>
              } @else {
                <!-- Login and Signup Buttons -->
                <a href="/login" class="btn btn-outline-light me-2">Login</a>
                <a href="/signup" class="btn btn-primary">Sign Up</a>
              }
            </div>
          </div>
        </nav>
      </div>
    </header>
  `
})
export class NavbarComponent {
  @Output() toolSelected = new EventEmitter<Tool>();

  // Mock user state (replace with auth service later)
  isLoggedIn = false;
  username = 'User';
  isAdmin = false;
  isPremium = false;

  onToolSelected(tool: Tool): void {
    this.toolSelected.emit(tool);
  }

  setPremium(): void {
    console.log('Premium subscription feature not yet implemented');
  }

  logout(): void {
    console.log('Logout feature not yet implemented');
  }
}