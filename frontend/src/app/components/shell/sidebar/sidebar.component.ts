// frontend/DITT/src/app/components/shell/sidebar/sidebar.component.ts
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PluginService } from '../../../services/plugin.service';
import { Tool, ToolStatus } from '../../../models/tool.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="sidebar">
      <div class="sidebar__header">
        <span>Tools</span>
        <span class="sidebar__count">{{ tools.length }}</span>
      </div>

      @if (loading) {
        <div class="sidebar__loading">Loading tools...</div>
      } @else if (error) {
        <div class="sidebar__error">
          ⚠️ Failed to load tools
          <button (click)="loadTools()">Retry</button>
        </div>
      } @else {
        <!-- Built-in Tools -->
        @if (builtInTools.length > 0) {
          <div class="sidebar__group">
            <div class="sidebar__group-label">Built-in</div>
            @for (tool of builtInTools; track tool.name) {
              <button
                class="sidebar__item"
                [class.sidebar__item--active]="selectedTool?.name === tool.name"
                (click)="selectTool(tool)">
                <span class="sidebar__item-name">{{ tool.name }}</span>
                <span class="sidebar__item-version">v{{ tool.version }}</span>
              </button>
            }
          </div>
        }

        <!-- Plugin Tools -->
        @if (pluginTools.length > 0) {
          <div class="sidebar__group">
            <div class="sidebar__group-label">Plugins</div>
            @for (tool of pluginTools; track tool.name) {
              <button
                class="sidebar__item"
                [class.sidebar__item--active]="selectedTool?.name === tool.name"
                (click)="selectTool(tool)">
                <span class="sidebar__item-name">{{ tool.name }}</span>
                @if (tool.isPremium) {
                  <span class="sidebar__item-premium">★</span>
                }
                <span class="sidebar__item-version">v{{ tool.version }}</span>
              </button>
            }
          </div>
        }

        @if (tools.length === 0) {
          <div class="sidebar__empty">No tools available</div>
        }
      }
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 240px;
      min-width: 240px;
      background: #f5f5f5;
      border-right: 1px solid #e0e0e0;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
    }

    .sidebar__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      font-weight: 600;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #555;
      border-bottom: 1px solid #e0e0e0;
    }

    .sidebar__count {
      background: #1a1a2e;
      color: white;
      border-radius: 999px;
      padding: 0.1rem 0.5rem;
      font-size: 0.75rem;
    }

    .sidebar__group {
      padding: 0.5rem 0;
    }

    .sidebar__group-label {
      padding: 0.4rem 1rem;
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #999;
    }

    .sidebar__item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.6rem 1rem;
      background: none;
      border: none;
      text-align: left;
      cursor: pointer;
      transition: background 0.15s;
      font-size: 0.9rem;
    }

    .sidebar__item:hover {
      background: #e8e8e8;
    }

    .sidebar__item--active {
      background: #1a1a2e;
      color: white;
    }

    .sidebar__item-name {
      flex: 1;
    }

    .sidebar__item-version {
      font-size: 0.7rem;
      color: #aaa;
    }

    .sidebar__item--active .sidebar__item-version {
      color: #ccc;
    }

    .sidebar__item-premium {
      color: #f57f17;
      font-size: 0.75rem;
    }

    .sidebar__loading,
    .sidebar__empty,
    .sidebar__error {
      padding: 1rem;
      color: #888;
      font-size: 0.85rem;
      text-align: center;
    }

    .sidebar__error button {
      display: block;
      margin: 0.5rem auto 0;
      padding: 0.25rem 0.75rem;
      cursor: pointer;
    }
  `]
})
export class SidebarComponent implements OnInit {
  @Output() toolSelected = new EventEmitter<Tool>();

  tools: Tool[] = [];
  selectedTool: Tool | null = null;
  loading = false;
  error = false;

  get builtInTools(): Tool[] {
    return this.tools.filter(t => t.isBuiltIn);
  }

  get pluginTools(): Tool[] {
    return this.tools.filter(t => !t.isBuiltIn);
  }

  constructor(private pluginService: PluginService) {}

  ngOnInit(): void {
    this.loadTools();
  }

  loadTools(): void {
    this.loading = true;
    this.error = false;

    this.pluginService.getPlugins().subscribe({
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
    this.selectedTool = tool;
    this.toolSelected.emit(tool);
  }
}