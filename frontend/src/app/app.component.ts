import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './components/shell/navbar/navbar.component';
import { SidebarComponent } from './components/shell/sidebar/sidebar.component';
import { PluginViewportComponent } from './components/plugin-viewport/plugin-viewport.component';
import { Tool } from './models/tool.model';
import { FooterComponent } from "./components/shell/footer/footer.component";
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebarComponent, PluginViewportComponent, FooterComponent],
  template: `
    <div class="app-shell">
      @if (!isAuthPage) {
        <app-navbar (toolSelected)="onToolSelected($event)" />
      }
      <div class="app-body">
        <!-- Sidebar available on all pages except login/register -->
        @if (!isAuthPage) {
          <app-sidebar (toolSelected)="onToolSelected($event)" />
        }
        @if (isHomePage) {
          <main class="app-content">
            <app-plugin-viewport [selectedTool]="selectedTool" (toolSelected)="onToolSelected($event)" />
          </main>
        } @else {
          <!-- For other pages, show the routed content -->
          <main class="app-content" [class.full-width]="isAuthPage">
            <router-outlet></router-outlet>
          </main>
        }
      </div>
      @if (!isAuthPage) {
        <app-footer />
      }
    </div>
  `,
  styles: [`
    .app-shell {
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }

    .app-body {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .app-content {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    .app-content.full-width {
      width: 100%;
    }

    .app-content::-webkit-scrollbar {
      display: none;
    }
  `]
})
export class AppComponent implements OnInit {
  selectedTool: Tool | null = null;
  isHomePage = true;
  isAuthPage = false;
  isAuthenticated = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Set initial state based on current URL and authentication
    this.updateAuthState();
    
    // Listen for navigation changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.isHomePage = event.url === '/';
        this.isAuthPage = event.url === '/login' || event.url === '/register';
        this.updateAuthState();
      });
  }

  private updateAuthState(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
  }

  onToolSelected(tool: Tool): void {
    this.selectedTool = tool;
  }
}