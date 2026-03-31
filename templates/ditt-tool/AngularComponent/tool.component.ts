import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'tool-ToolTemplate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-container">

      <div class="tool-header">
        <h2 class="tool-title">ToolTemplate</h2>
        <p class="tool-description">TOOL_DESCRIPTION</p>
      </div>

      <div class="tool-body">

        <!-- Input Area -->
        <div class="tool-input-group">
          <label class="tool-label" for="toolInput">Input</label>
          <textarea
            id="toolInput"
            class="tool-textarea custom-input"
            [(ngModel)]="inputValue"
            placeholder="Enter your input here..."
            rows="6">
          </textarea>
        </div>

        <!-- Action Buttons -->
        <div class="tool-actions">
          <button
            class="btn btn-secondary"
            (click)="run()"
            [disabled]="loading">
            @if (loading) {
              <span class="spinner-border spinner-border-sm me-2"></span>
            }
            Run
          </button>
          <button
            class="btn btn-outline-light"
            (click)="clear()"
            [disabled]="loading">
            Clear
          </button>
        </div>

        <!-- Error -->
        @if (error) {
          <div class="alert alert-danger mt-3">{{ error }}</div>
        }

        <!-- Result -->
        @if (result) {
          <div class="tool-result">
            <label class="tool-label">Result</label>
            <pre class="tool-result-content">{{ result }}</pre>
          </div>
        }

      </div>
    </div>
  `,
  styles: [`
    // These match the host app's CSS variables.
    // Do NOT hardcode colors — use these tokens.
    :host {
      --primary-color:     #088395;
      --secondary-color:   #37B7C3;
      --background-color:  #071952;
      --secondary-color-1: #0A2463;
      --secondary-color-2: #2A9DAF;
      --text-color:        #EBF4F6;
      --hover-color:       var(--secondary-color-2);
      display: block;
      height: 100%;
    }
    .tool-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 1.5rem;
      background-color: var(--background-color);
      color: var(--text-color);
    }
    .tool-header {
      margin-bottom: 1.5rem;
      border-bottom: 1px solid var(--secondary-color-1);
      padding-bottom: 1rem;
    }
    .tool-title {
      color: var(--secondary-color-2);
      font-weight: 700;
      margin-bottom: 0.25rem;
    }
    .tool-description {
      color: var(--text-color);
      opacity: 0.8;
      font-size: 0.9rem;
      margin: 0;
    }
    .tool-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .tool-label {
      display: block;
      font-weight: 600;
      margin-bottom: 0.4rem;
      color: var(--secondary-color-2);
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .tool-textarea {
      width: 100%;
      background-color: var(--secondary-color-1);
      border: 1px solid var(--secondary-color-2);
      color: var(--text-color);
      border-radius: 6px;
      padding: 0.75rem;
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
      resize: vertical;
    }
    .tool-textarea:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(8, 131, 149, 0.3);
    }
    .tool-textarea::placeholder {
      color: var(--text-color);
      opacity: 0.4;
    }
    .tool-actions {
      display: flex;
      gap: 0.75rem;
    }
    .tool-result {
      flex: 1;
    }
    .tool-result-content {
      background-color: var(--secondary-color-1);
      border: 1px solid var(--secondary-color-2);
      border-radius: 6px;
      padding: 1rem;
      color: var(--text-color);
      font-family: 'Courier New', monospace;
      font-size: 0.85rem;
      white-space: pre-wrap;
      word-break: break-all;
      margin: 0;
      min-height: 100px;
    }
  `]
})
export class ToolTemplateComponent {
  inputValue = '';
  result     = '';
  loading    = false;
  error      = '';

  private readonly apiBase = '/api/tools/ToolTemplate';

  constructor(private http: HttpClient) {}

  run(): void {
    if (!this.inputValue.trim()) {
      this.error = 'Please enter a value';
      return;
    }

    this.loading = true;
    this.error   = '';
    this.result  = '';

    this.http
      .post<{ success: boolean; data: string; error?: string }>(
        `${this.apiBase}/run`,
        { value: this.inputValue }
      )
      .subscribe({
        next: (res) => {
          if (res.success) this.result = res.data;
          else this.error = res.error ?? 'Unknown error';
          this.loading = false;
        },
        error: () => {
          this.error   = 'Failed to reach the API';
          this.loading = false;
        }
      });
  }

  clear(): void {
    this.inputValue = '';
    this.result     = '';
    this.error      = '';
  }
}
