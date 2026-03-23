// frontend/my-tool-platform/src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/shell/navbar/navbar.component';
import { SidebarComponent } from './components/shell/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent],
  template: `
    <div class="app-shell">
      <app-navbar />
      <div class="app-body">
        <app-sidebar />
        <main class="app-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .app-shell { display: flex; flex-direction: column; height: 100vh; }
    .app-body { display: flex; flex: 1; overflow: hidden; }
    .app-content { flex: 1; overflow-y: auto; padding: 1rem; }
  `]
})
export class AppComponent { }