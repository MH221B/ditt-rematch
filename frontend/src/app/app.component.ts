import { Component } from '@angular/core';
import { NavbarComponent } from './components/shell/navbar/navbar.component';
import { SidebarComponent } from './components/shell/sidebar/sidebar.component';
import { PluginViewportComponent } from './components/plugin-viewport/plugin-viewport.component';
import { Tool } from './models/tool.model';
import { FooterComponent } from "./components/shell/footer/footer.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, PluginViewportComponent, FooterComponent],
  template: `
    <div class="app-shell">
      <app-navbar />
      <div class="app-body">
        <app-sidebar (toolSelected)="onToolSelected($event)" />
        <main class="app-content">
          <app-plugin-viewport [selectedTool]="selectedTool" />
        </main>
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
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
  `]
})
export class AppComponent {
  selectedTool: Tool | null = null;

  onToolSelected(tool: Tool): void {
    this.selectedTool = tool;
  }
}