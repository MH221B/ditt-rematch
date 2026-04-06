import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './components/shell/navbar/navbar.component';
import { SidebarComponent } from './components/shell/sidebar/sidebar.component';
import { PluginViewportComponent } from './components/plugin-viewport/plugin-viewport.component';
import { Tool } from './models/tool.model';
import { FooterComponent } from "./components/shell/footer/footer.component";
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebarComponent, PluginViewportComponent, FooterComponent],
  template: `
    <div class="app-shell">
      <app-navbar />
      <div class="app-body">
        <!-- Show sidebar only on home page -->
        @if (isHomePage) {
          <app-sidebar (toolSelected)="onToolSelected($event)" />
          <main class="app-content">
            <app-plugin-viewport [selectedTool]="selectedTool" />
          </main>
        } @else {
          <!-- For other pages like upload, just show the routed content -->
          <main class="app-content">
            <router-outlet></router-outlet>
          </main>
        }
      </div>
      <app-footer />
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

    .app-content::-webkit-scrollbar {
      display: none;
    }
  `]
})
export class AppComponent implements OnInit {
  selectedTool: Tool | null = null;
  isHomePage = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Set initial state based on current URL
    this.isHomePage = this.router.url === '/';
    
    // Listen for navigation changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.isHomePage = event.url === '/';
      });
  }

  onToolSelected(tool: Tool): void {
    this.selectedTool = tool;
  }
}