import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tool } from '../../models/tool.model';

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
          <!-- Phase 5+: Web Component renders here -->
          <!-- For now show basic tool interaction -->
          <div class="tool-placeholder">
            <p>{{ selectedTool.description }}</p>
            <p class="hint">Frontend UI coming in Phase 5</p>
          </div>
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

    .tool-placeholder {
      color: var(--text-color);
      opacity: 0.7;
      text-align: center;
      margin-top: 2rem;
    }

    .hint {
      font-size: 0.85rem;
      color: var(--text-color);
      opacity: 0.5;
      font-style: italic;
    }
  `]
})
export class PluginViewportComponent implements OnChanges {
  @Input() selectedTool: Tool | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedTool'] && this.selectedTool) {
      console.log(`Loading tool: ${this.selectedTool.name}`);
    }
  }
}