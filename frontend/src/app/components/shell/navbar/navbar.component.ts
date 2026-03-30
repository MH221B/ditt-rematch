import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="navbar">
      <div class="navbar__brand">
        <span class="navbar__logo">🔧</span>
        <span class="navbar__title">DITT</span>
        <span class="navbar__subtitle">Developer IT Tools</span>
      </div>
      <div class="navbar__actions">
        <span class="navbar__version">v1.0.0</span>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      height: 56px;
      background: #1a1a2e;
      color: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .navbar__brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .navbar__logo {
      font-size: 1.5rem;
    }

    .navbar__title {
      font-size: 1.2rem;
      font-weight: 700;
      letter-spacing: 2px;
    }

    .navbar__subtitle {
      font-size: 0.75rem;
      color: #aaa;
      margin-left: 0.25rem;
    }

    .navbar__version {
      font-size: 0.75rem;
      color: #aaa;
    }
  `]
})
export class NavbarComponent {}