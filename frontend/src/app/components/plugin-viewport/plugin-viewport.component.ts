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
          <h2>{{ selectedTool.name }}</h2>
          <span class="version">v{{ selectedTool.version }}</span>
          @if (selectedTool.isBuiltIn) {
            <span class="badge badge--builtin">Built-in</span>
          }
          @if (selectedTool.isPremium) {
            <span class="badge badge--premium">Premium</span>
          }
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
      color: #666;
    }

    .viewport__header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e0e0e0;
      background: #fafafa;
    }

    .viewport__header h2 {
      margin: 0;
      font-size: 1.25rem;
    }

    .version {
      color: #888;
      font-size: 0.85rem;
    }

    .badge {
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .badge--builtin {
      background: #e3f2fd;
      color: #1565c0;
    }

    .badge--premium {
      background: #fff8e1;
      color: #f57f17;
    }

    .viewport__content {
      flex: 1;
      padding: 1.5rem;
      overflow-y: auto;
    }

    .tool-placeholder {
      color: #666;
      text-align: center;
      margin-top: 2rem;
    }

    .hint {
      font-size: 0.85rem;
      color: #aaa;
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