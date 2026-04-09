// frontend/DITT/src/app/components/shell/sidebar/sidebar.component.ts
import { Component, EventEmitter, OnInit, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PluginService } from '../../../services/plugin.service';
import { AuthService } from '../../../services/auth.service';
import { Tool, ToolStatus } from '../../../models/tool.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="custom-offcanvas offcanvas offcanvas-start" tabindex="-1" id="offcanvasMenu" aria-labelledby="offcanvasMenuLabel" data-bs-scroll="true" data-bs-backdrop="false">
      <div class="offcanvas-header">
        <div class="offcanvas-title">
          <h4 class="fw-bold">DITT</h4>
          <p class="mb-0">Developers' IT Tools</p>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>

      <div class="offcanvas-body">
        @if (loading) {
          <div class="text-center text-muted">
            <div class="spinner-border spinner-border-sm mb-2" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p>Loading tools...</p>
          </div>
        } @else if (error) {
          <div class="alert alert-warning" role="alert">
            ⚠️ Failed to load tools
            <button class="btn btn-sm btn-outline-warning d-block w-100 mt-2" (click)="loadTools()">Retry</button>
          </div>
        } @else if (tools.length === 0) {
          <p class="text-muted text-center">No tools available</p>
        } @else {
          <ul class="list-unstyled">
            @for (tool of tools; track tool.name) {
              <li class="mb-2">
                <a href="#" class="d-flex align-items-center justify-content-between text-decoration-none tool-item" (click)="selectTool(tool); $event.preventDefault()">
                  <span class="tool-name">{{ tool.name }}</span>
                  @if (tool.isPremium) {
                    <i class="bi bi-star-fill text-warning ms-2"></i>
                  }
                  <span class="tool-version ms-2">v{{ tool.version }}</span>
                </a>
              </li>
            }
          </ul>
        }
      </div>
    </div>
  `
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Output() toolSelected = new EventEmitter<Tool>();

  tools: Tool[] = [];
  loading = false;
  error = false;

  private destroy$ = new Subject<void>();

  constructor(private pluginService: PluginService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadTools();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTools(): void {
    this.loading = true;
    this.error = false;

    // Subscribe to shared state - will get cached value and all future updates
    this.pluginService
      .getPlugins()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tools) => {
          this.tools = tools;
          this.loading = false;
        },
        error: () => {
          this.error = true;
          this.loading = false;
        }
      });
  }

  selectTool(tool: Tool): void {
    // Check if tool is premium and user doesn't have premium access (admins can always access)
    const roles = this.authService.getUserRoles();
    const isPremium = roles.includes('PremiumUser');
    const isAdmin = roles.includes('Admin');
    
    if (tool.isPremium && !isPremium && !isAdmin) {
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
}