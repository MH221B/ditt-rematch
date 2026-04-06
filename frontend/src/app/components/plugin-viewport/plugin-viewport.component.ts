import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tool } from '../../models/tool.model';
import { PluginElementLoaderService } from '../../services/plugin-element-loader.service';

@Component({
  selector: 'app-plugin-viewport',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="viewport">
      @if (!selectedTool) {
        <div class="viewport__empty">
          <h2>Select a tool from the sidebar</h2>
          <p>Choose a tool to get started</p>
        </div>
      } @else {
        <div class="viewport__header">
          <div class="container">
            <h2>{{ selectedTool.name }}</h2>
            <span class="version">v{{ selectedTool.version }}</span>
            @if (selectedTool.isBuiltIn) {
              <span class="badge badge--builtin">Built-in</span>
            }
            @if (selectedTool.isPremium) {
              <span class="badge badge--premium">Premium</span>
            }
          </div>
        </div>
        <div class="viewport__content">
          @if (bundleLoading) {
            <div class="loading-spinner">
              <div class="spinner"></div>
              <p>Loading {{ selectedTool.name }}...</p>
            </div>
          } @else if (bundleError) {
            <div class="error-message">
              <p class="error-title">Failed to load plugin UI</p>
              <p class="error-text">{{ bundleError }}</p>
              <p class="hint">The plugin backend is available, but the frontend UI could not be loaded.</p>
            </div>
          } @else if (hasFrontendBundle) {
            <!-- Web component will render here after bundle loads -->
            <div class="web-component-host" [id]="'plugin-' + selectedTool.name.toLowerCase()"></div>
          } @else {
            <!-- Fallback for tools without frontend bundles (API-only mode) -->
            <div class="tool-placeholder">
              <p>{{ selectedTool.description }}</p>
              <p class="hint">This tool operates in API-only mode</p>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .viewport {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .viewport__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--text-color);
    }

    .viewport__header {
      padding: 1rem 0;
      border-bottom: 1px solid var(--secondary-color-1);
      background: var(--secondary-color-1);
    }

    .viewport__header .container {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .viewport__header h2 {
      margin: 0;
      font-size: 1.25rem;
      color: var(--text-color);
    }

    .version {
      color: var(--text-color);
      opacity: 0.6;
      font-size: 0.85rem;
    }

    .badge {
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .badge--builtin {
      background: var(--secondary-color-3);
      opacity: 0.8;
      color: var(--text-color);
    }

    .badge--premium {
      background: var(--secondary-color-4);
      opacity: 0.8;
      color: var(--text-color);
    }

    .viewport__content {
      flex: 1;
      padding: 1.5rem;
      overflow-y: auto;
      background: var(--background-color);
    }

    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 1rem;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(13, 110, 253, 0.1);
      border-top-color: var(--primary-color, #0d6efd);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .loading-spinner p {
      color: var(--text-color);
      font-size: 1rem;
    }

    .error-message {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 1rem;
      padding: 2rem;
      text-align: center;
    }

    .error-title {
      color: var(--text-color);
      font-size: 1.1rem;
      font-weight: bold;
      margin: 0;
    }

    .error-text {
      color: var(--text-color);
      opacity: 0.7;
      margin: 0;
      font-family: monospace;
      font-size: 0.9rem;
      background: rgba(220, 53, 69, 0.1);
      padding: 0.75rem;
      border-radius: 4px;
      word-break: break-word;
    }

    .hint {
      font-size: 0.85rem;
      color: var(--text-color);
      opacity: 0.5;
      font-style: italic;
      margin: 0;
    }

    .tool-placeholder {
      color: var(--text-color);
      opacity: 0.7;
      text-align: center;
      margin-top: 2rem;
    }

    .web-component-host {
      width: 100%;
      height: 100%;
    }
  `]
})
export class PluginViewportComponent implements OnChanges {
  @Input() selectedTool: Tool | null = null;

  bundleLoading = false;
  bundleError: string | null = null;
  hasFrontendBundle = false;

  constructor(private pluginElementLoaderService: PluginElementLoaderService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedTool'] && this.selectedTool) {
      this.loadBundle();
    }
  }

  private async loadBundle(): Promise<void> {
    if (!this.selectedTool) return;

    // Check if tool has a frontend bundle
    if (!this.selectedTool.frontendBundleUrl) {
      this.hasFrontendBundle = false;
      this.bundleLoading = false;
      this.bundleError = null;
      console.log(`Tool ${this.selectedTool.name} has no frontend bundle (API-only mode)`);
      return;
    }

    // Check if already loaded
    if (this.pluginElementLoaderService.isLoaded(this.selectedTool.name)) {
      this.hasFrontendBundle = true;
      this.bundleLoading = false;
      this.bundleError = null;
      console.log(`Tool ${this.selectedTool.name} bundle already loaded`);
      return;
    }

    // Load the bundle
    this.bundleLoading = true;
    this.bundleError = null;

    try {
      console.log(`Loading bundle for ${this.selectedTool.name}: ${this.selectedTool.frontendBundleUrl}`);
      await this.pluginElementLoaderService.loadPluginBundle(
        this.selectedTool.name,
        this.selectedTool.frontendBundleUrl
      );

      this.hasFrontendBundle = true;
      this.bundleLoading = false;
      console.log(`✅ Bundle loaded for ${this.selectedTool.name}`);
    } catch (error: any) {
      this.bundleLoading = false;
      const errorMsg = error?.message || 'Unknown error loading bundle';
      this.bundleError = errorMsg;
      console.error(`❌ Failed to load bundle for ${this.selectedTool.name}:`, error);
    }
  }
}