import { Component, Input, OnChanges, OnInit, Output, SimpleChanges, Type, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Tool, ToolStatus } from '../../models/tool.model';
import { PluginElementLoaderService } from '../../services/plugin-element-loader.service';
import { PluginService } from '../../services/plugin.service';
import { AuthService } from '../../services/auth.service';
import { JsonMinifyComponent } from '../../tools/json-minify/json-minify.component';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-plugin-viewport',
  standalone: true,
  imports: [CommonModule, JsonMinifyComponent],
  template: `
    <div class="viewport">
      @if (!selectedTool) {
        <div class="viewport__empty container">
          @if (toggleError) {
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
              {{ toggleError }}
              <button type="button" class="btn-close" (click)="toggleError = null"></button>
            </div>
          }
          @if (toolsLoading) {
            <div class="loading-state">
              <div class="spinner"></div>
              <p>Loading tools...</p>
            </div>
          } @else if (toolsError) {
            <div class="error-state">
              <p class="error-title">Failed to load tools</p>
              <button class="btn btn-outline-primary mt-3" (click)="loadTools()">Retry</button>
            </div>
          } @else if (tools.length === 0) {
            <div class="empty-tools-state">
              <p>No tools available</p>
            </div>
          } @else {
            <div class="tools-grid-container p-0">
              <h2 class="tools-grid-title">Available Tools</h2>
              <div class="row g-3">
                @for (tool of tools; track tool.name) {
                  <div class="col-12 col-sm-6 col-md-4">
                    <div class="card tool-card h-100" (click)="selectToolFromGrid(tool)" role="button">
                      <div class="card-header">
                        <div class="card-header-content">
                          <div class="card-title-section">
                            <h5 class="card-title">
                              {{ tool.name }}
                              @if (tool.isPremium) {
                                <i class="bi bi-star-fill text-warning ms-2"></i>
                              }
                            </h5>
                          </div>
                          <div class="card-actions">
                            @if (isAdmin) {
                              <button class="btn status-toggle" 
                                      [class.active]="tool.status === 'Active'"
                                      (click)="toggleStatusTool(tool, $event); $event.stopPropagation()"
                                      [title]="tool.status === 'Active' ? 'Active - Click to disable' : 'Inactive - Click to enable'"
                                      type="button">
                                <i class="bi" [ngClass]="tool.status === 'Active' ? 'bi-toggle-on' : 'bi-toggle-off'"></i>
                              </button>
                              <div class="dropdown" (click)="$event.stopPropagation()">
                                <button class="btn btn-sm btn-link dropdown-toggle" type="button" [id]="'toolMenu-' + tool.name" data-bs-toggle="dropdown" aria-expanded="false">
                                  <i class="bi bi-three-dots-vertical"></i>
                                </button>
                                <ul class="dropdown-menu dropdown-menu-end" [attr.aria-labelledby]="'toolMenu-' + tool.name">
                                  <li>
                                    <a class="dropdown-item" href="#" (click)="togglePremiumTool(tool, $event)">
                                      <i class="bi" [ngClass]="tool.isPremium ? 'bi-star' : 'bi-star-fill'"></i>
                                      {{ tool.isPremium ? 'Remove Premium' : 'Make Premium' }}
                                    </a>
                                  </li>
                                  <li><hr class="dropdown-divider"></li>
                                  <li>
                                    <a class="dropdown-item text-danger" href="#" (click)="deleteTool(tool, $event)">
                                      <i class="bi bi-trash"></i> Delete
                                    </a>
                                  </li>
                                </ul>
                              </div>
                            }
                          </div>
                        </div>
                      </div>
                      <div class="card-body">
                        <p class="card-text">{{ tool.description || 'No description available' }}</p>
                      </div>
                      <div class="card-footer bg-transparent">
                        <span class="badge bg-secondary">v{{ tool.version }}</span>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
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
          @if (selectedTool.isBuiltIn) {
            <!-- Built-in tools: render component directly -->
            @switch (selectedTool.name) {
              @case ('JsonMinify') {
                <tool-json-minify></tool-json-minify>
              }
              @default {
                <!-- Fallback for built-in tools without UI -->
                <div class="tool-placeholder">
                  <p>{{ selectedTool.description }}</p>
                  <p class="hint">This tool is not yet implemented</p>
                </div>
              }
            }
          } @else {
            <!-- Plugin tools: load from bundle -->
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
              <!-- Fallback for plugins without frontend bundles (API-only mode) -->
              <div class="tool-placeholder">
                <p>{{ selectedTool.description }}</p>
                <p class="hint">This tool operates in API-only mode</p>
              </div>
            }
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
      padding: 2rem 0rem;
    }

    .loading-state,
    .error-state,
    .empty-tools-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      text-align: center;
    }

    .error-title {
      margin: 0;
      font-weight: 600;
    }

    .tools-grid-container {
      width: 100%;
      padding: 2rem;
    }

    .tools-grid-title {
      margin-bottom: 1.5rem;
      color: var(--text-color);
      font-size: 1.5rem;
      font-weight: 600;
    }

    .tool-card {
      cursor: pointer;
      border: 1px solid var(--secondary-color-1);
      background: var(--background-color);
      color: var(--text-color);
      transition: all 0.3s ease;
    }

    .tool-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      border-color: var(--primary-color, #0d6efd);
    }

    .tool-card .card-header {
      background: transparent;
      border-bottom: 1px solid var(--secondary-color-1);
      padding: 0.75rem 1rem;
    }

    .tool-card .card-title {
      margin: 0;
      font-size: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .tool-card .card-body {
      padding: 1rem;
      flex-grow: 1;
    }

    .tool-card .card-text {
      font-size: 0.9rem;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 2.8em;
      color: var(--text-color);
      opacity: 0.85;
    }

    .tool-card .card-footer {
      padding: 0.75rem 1rem;
      border-top: 1px solid var(--secondary-color-1);
    }

    .card-header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
    }

    .card-title-section {
      flex: 1;
    }

    .card-actions {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .status-toggle {
      color: var(--text-color);
      opacity: 0.4;
      transition: opacity 0.2s ease;
      padding: 0.5rem 0.75rem;
      border: none;
      background: transparent;
      font-size: 1.5rem;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .status-toggle i {
      font-size: 2rem;
    }

    .status-toggle.active {
      opacity: 1;
      color: #28a745;
    }

    .status-toggle:hover {
      opacity: 0.7;
    }

    .status-toggle:hover.active {
      opacity: 1;
    }

    .tool-card .btn-link {
      color: var(--text-color);
      text-decoration: none;
      padding: 0;
      opacity: 0.6;
      transition: opacity 0.2s ease;
    }

    .tool-card .btn-link:hover {
      opacity: 1;
    }

    .dropdown-menu {
      background: var(--background-color);
      border: 1px solid var(--secondary-color-1);
    }

    .dropdown-menu .dropdown-item {
      color: var(--text-color);
    }

    .dropdown-menu .dropdown-item:hover {
      background-color: var(--secondary-color-1);
      color: var(--text-color);
    }

    .dropdown-menu .text-danger {
      color: #dc3545 !important;
    }

    .dropdown-menu .text-danger:hover {
      background-color: rgba(220, 53, 69, 0.1);
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

    .alert {
      margin-bottom: 1.5rem;
      position: relative;
      z-index: 10;
    }

    .alert-danger {
      background-color: rgba(220, 53, 69, 0.1);
      border: 1px solid rgba(220, 53, 69, 0.3);
      color: #dc3545;
    }

    .alert.alert-dismissible {
      padding-right: 2.5rem;
    }

    .btn-close {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      opacity: 0.6;
    }

    .btn-close:hover {
      opacity: 1;
    }
  `]
})
export class PluginViewportComponent implements OnInit, OnChanges, OnDestroy {
  @Input() selectedTool: Tool | null = null;
  @Output() toolSelected = new EventEmitter<Tool>();

  tools: Tool[] = [];
  toolsLoading = false;
  toolsError: string | null = null;

  bundleLoading = false;
  bundleError: string | null = null;
  hasFrontendBundle = false;

  toggleError: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private pluginElementLoaderService: PluginElementLoaderService,
    private pluginService: PluginService,
    private authService: AuthService
  ) {}

  /**
   * Check if current user is an admin
   */
  get isAdmin(): boolean {
    const roles = this.authService.getUserRoles();
    return roles.includes('Admin');
  }

  ngOnInit(): void {
    this.loadTools();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleStatusTool(tool: Tool, event: Event): void {
    event.preventDefault();
    
    // Determine new status: Active -> Disabled, Disabled -> Active, Inactive stays as is
    let newStatus = tool.status;
    if (tool.status === ToolStatus.Active) {
      newStatus = ToolStatus.Disabled;
    } else if (tool.status === ToolStatus.Disabled) {
      newStatus = ToolStatus.Active;
    }
    
    const oldStatus = tool.status;
    
    // Optimistic UI update
    tool.status = newStatus;
    this.toggleError = null;
    
    // Call backend to persist the change
    // PluginService.updateToolStatus() will automatically update the shared cache
    this.pluginService.updateToolStatus(tool.name, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedTool) => {
          console.log(`✅ Tool '${tool.name}' status updated to: ${newStatus}`);
          // Cache is already updated by PluginService, but update local reference too
          Object.assign(tool, updatedTool);
        },
        error: (error) => {
          console.error(`❌ Failed to update tool '${tool.name}' status:`, error);
          
          // Revert the UI change
          tool.status = oldStatus;
          
          // Show error message
          this.toggleError = error?.error?.message || `Failed to update ${tool.name} status`;
          
          // Auto-clear error after 5 seconds
          setTimeout(() => {
            this.toggleError = null;
          }, 5000);
        }
      });
  }

  togglePremiumTool(tool: Tool, event: Event): void {
    event.preventDefault();
    
    const newPremiumValue = !tool.isPremium;
    const oldPremiumValue = tool.isPremium;
    
    // Optimistic UI update
    tool.isPremium = newPremiumValue;
    this.toggleError = null;
    
    // Call backend to persist the change
    // PluginService.updateToolPremium() will automatically update the shared cache
    this.pluginService.updateToolPremium(tool.name, newPremiumValue)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedTool) => {
          console.log(`✅ Tool '${tool.name}' premium status updated to: ${newPremiumValue}`);
          // Cache is already updated by PluginService, but update local reference too
          Object.assign(tool, updatedTool);
        },
        error: (error) => {
          console.error(`❌ Failed to update tool '${tool.name}' premium status:`, error);
          
          // Revert the UI change
          tool.isPremium = oldPremiumValue;
          
          // Show error message
          this.toggleError = error?.error?.message || `Failed to update ${tool.name} premium status`;
          
          // Auto-clear error after 5 seconds
          setTimeout(() => {
            this.toggleError = null;
          }, 5000);
        }
      });
  }

  deleteTool(tool: Tool, event: Event): void {
    event.preventDefault();
    
    // Use different confirmation messages for built-in vs plugin tools
    const message = tool.isBuiltIn 
      ? `Disable "${tool.name}"? It can be re-enabled later.`
      : `Delete "${tool.name}"? This will permanently remove the plugin.`;
    
    if (confirm(message)) {
      console.log(`Deleting tool: ${tool.name}`);
      
      // If the tool is currently selected, deselect it after deletion
      const isSelected = this.selectedTool?.name === tool.name;
      
      this.pluginService.deleteTool(tool.name)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log(`✅ Tool '${tool.name}' deleted successfully:`, response);
            
            // Remove from local tools array
            this.tools = this.tools.filter(t => t.name !== tool.name);
            
            // Deselect if it was the currently selected tool
            if (isSelected) {
              this.selectedTool = null;
              this.bundleLoading = false;
              this.bundleError = null;
            }
            
            this.toggleError = null;
          },
          error: (error) => {
            console.error(`❌ Failed to delete tool '${tool.name}':`, error);
            
            // Show error message
            this.toggleError = error?.error?.error || error?.error?.message || `Failed to delete ${tool.name}`;
            
            // Auto-clear error after 5 seconds
            setTimeout(() => {
              this.toggleError = null;
            }, 5000);
          }
        });
    }
  }

  loadTools(): void {
    this.toolsLoading = true;
    this.toolsError = null;

    const toolsObservable = this.isAdmin 
      ? this.pluginService.getPlugins() 
      : this.pluginService.getActivePlugins();

    // Subscribe to shared state - will get cached value and all future updates from any component
    toolsObservable
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tools) => {
          this.tools = tools;
          this.toolsLoading = false;
        },
        error: (error) => {
          console.error('Failed to load tools:', error);
          this.toolsError = error?.error?.message || 'Failed to load tools';
          this.toolsLoading = false;
        }
      });
  }

  selectToolFromGrid(tool: Tool): void {
    // Check if tool is premium and user doesn't have premium access
    if (tool.isPremium && !this.authService.isPremiumUser()) {
      Swal.fire({
        title: 'Premium Tool',
        text: 'This tool requires a premium subscription. Upgrade to access it.',
        icon: 'warning',
        confirmButtonText: 'Go Premium',
        showCancelButton: true,
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          // Navigate to premium upgrade page
          // TODO: Update this route based on your actual premium/upgrade route
          // this.router.navigate(['/premium']);
        }
      });
      return; // Don't select the tool
    }
    this.toolSelected.emit(tool);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedTool'] && this.selectedTool) {
      // Skip bundle loading for built-in tools (they're rendered directly)
      if (!this.selectedTool.isBuiltIn) {
        this.loadBundle();
      }
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
      this.mountWebComponent();
      console.log(`Tool ${this.selectedTool.name} bundle already loaded`);
      return;
    }

    // Load the bundle
    this.bundleLoading = true;
    this.bundleError = null;

    try {
      // Construct the full bundle URL using the API URL
      const bundleUrl = `${environment.apiUrl}${this.selectedTool.frontendBundleUrl}`;
      console.log(`Loading bundle for ${this.selectedTool.name}: ${bundleUrl}`);
      await this.pluginElementLoaderService.loadPluginBundle(
        this.selectedTool.name,
        bundleUrl
      );

      this.hasFrontendBundle = true;
      this.bundleLoading = false;
      
      // Create and mount the Web Component
      this.mountWebComponent();
      
      console.log(`✅ Bundle loaded for ${this.selectedTool.name}`);
    } catch (error: any) {
      this.bundleLoading = false;
      const errorMsg = error?.message || 'Unknown error loading bundle';
      this.bundleError = errorMsg;
      console.error(`❌ Failed to load bundle for ${this.selectedTool.name}:`, error);
    }
  }

  private mountWebComponent(): void {
    if (!this.selectedTool) return;

    // Use setTimeout to ensure DOM has been updated with the container
    setTimeout(() => {
      try {
        const elementName = `ditt-plugin-${this.selectedTool!.name.toLowerCase()}`;
        const container = document.querySelector('.web-component-host');
        
        if (!container) {
          console.warn(`Container .web-component-host not found for ${this.selectedTool!.name}`);
          return;
        }

        // Clear previous content
        container.innerHTML = '';

        // Create and mount the Web Component
        const element = document.createElement(elementName);
        container.appendChild(element);
        
        console.log(`✅ Web Component ${elementName} mounted to DOM`);
      } catch (error) {
        console.error(`Failed to mount web component for ${this.selectedTool!.name}:`, error);
      }
    }, 0);
  }
}