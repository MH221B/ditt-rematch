import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToolService } from '../../services/tool.service';

@Component({
  selector: 'tool-json-minify',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-container d-flex flex-column h-100 p-4">

      <!-- Header -->
      <div class="tool-header border-bottom border-secondary pb-3 mb-4">
        <h2 class="tool-title fs-2 fw-bold mb-2">JSON Minify</h2>
        <p class="tool-description text-muted mb-0">Minify and compress your JSON by removing unnecessary whitespace.</p>
      </div>

      <!-- Content Grid -->
      <div class="row g-3 flex-grow-1 overflow-auto">

        <!-- INPUT SECTION -->
        <div class="col-lg-6 col-12">
          <div class="card card-section h-100">
            <div class="card-header border-secondary">
              <h3 class="card-title fw-semibold mb-0">Your Raw JSON</h3>
            </div>
            <div class="card-body d-flex flex-column gap-3">
              <!-- Input Area -->
              <div class="flex-grow-1 d-flex flex-column">
                <label for="rawJsonInput" class="form-label text-uppercase small fw-semibold">JSON to minify</label>
                <textarea
                  id="rawJsonInput"
                  class="form-control form-control-input"
                  [(ngModel)]="rawJsonInput"
                  placeholder="Paste your raw JSON here..."
                  rows="10">
                </textarea>
              </div>

              <!-- Action Button -->
              <div class="d-flex gap-2">
                <button
                  type="button"
                  class="btn btn-primary"
                  (click)="minify()"
                  [disabled]="minifyLoading">
                  @if (minifyLoading) {
                    <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  }
                  Minify
                </button>
              </div>

              <!-- Error -->
              @if (minifyError) {
                <div class="alert alert-danger mb-0" role="alert">{{ minifyError }}</div>
              }
            </div>
          </div>
        </div>

        <!-- OUTPUT SECTION -->
        <div class="col-lg-6 col-12">
          <div class="card card-section h-100">
            <div class="card-header border-secondary">
              <h3 class="card-title fw-semibold mb-0">Minified Version</h3>
            </div>
            <div class="card-body d-flex flex-column gap-3">
              <!-- Output Area -->
              <div class="flex-grow-1 d-flex flex-column">
                <label for="minifiedJsonOutput" class="form-label text-uppercase small fw-semibold">Minified JSON</label>
                <pre id="minifiedJsonOutput" class="result-content flex-grow-1 mb-0">{{ minifiedJsonOutput || 'The minified version of your JSON will appear here' }}</pre>
              </div>

              <!-- Stats -->
              @if (minifiedJsonOutput) {
                <div class="stats-container">
                  <div class="stat-item">
                    <span class="stat-label">Original Size:</span>
                    <span class="stat-value">{{ originalSize }} bytes</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Minified Size:</span>
                    <span class="stat-value">{{ minifiedSize }} bytes</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Compression Ratio:</span>
                    <span class="stat-value">{{ compressionRatio }}%</span>
                  </div>
                </div>
              }

              <!-- Action Button -->
              @if (minifiedJsonOutput) {
                <div class="d-flex gap-2">
                  <button
                    type="button"
                    class="btn btn-outline-light w-100"
                    (click)="copyToClipboard()">
                    Copy Minified JSON
                  </button>
                </div>
              }
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host {
      --bs-primary-color: #088395;
      --bs-secondary-color: #37B7C3;
      --bs-background-color: #071952;
      --bs-dark-bg: #0A2463;
      --bs-border-color: #2A9DAF;
      --bs-text-color: #EBF4F6;
      --bs-body-bg: var(--bs-background-color);
      --bs-body-color: var(--bs-text-color);
      display: block;
      height: 100%;
    }

    .tool-container {
      height: 100%;
      overflow: hidden;
    }

    .tool-header {
      flex-shrink: 0;
    }

    .tool-title {
      margin-bottom: 0.5rem !important;
      color: var(--bs-text-color);
    }

    .tool-description {
      margin-bottom: 0 !important;
    }

    .card-section {
      background-color: var(--bs-dark-bg);
      border: 1px solid var(--bs-border-color);
    }

    .card-section .card-header {
      background-color: transparent;
      border-color: var(--bs-border-color);
      padding: 1rem;
    }

    .card-section .card-title {
      color: var(--bs-text-color);
      margin: 0;
    }

    .card-section .card-body {
      color: var(--bs-text-color);
    }

    textarea {
      resize: none;
      background-color: rgba(255, 255, 255, 0.05);
      border-color: var(--bs-border-color);
      color: var(--bs-text-color);
    }

    textarea::placeholder {
      color: rgba(235, 244, 246, 0.5);
    }

    textarea:focus {
      background-color: rgba(255, 255, 255, 0.08);
      border-color: var(--bs-secondary-color);
      color: var(--bs-text-color);
      box-shadow: 0 0 0 0.25rem rgba(55, 183, 195, 0.25);
    }

    .form-control {
      background-color: rgba(255, 255, 255, 0.05);
      border-color: var(--bs-border-color);
      color: var(--bs-text-color);
    }

    .form-control::placeholder {
      color: rgba(235, 244, 246, 0.5);
    }

    .form-control:focus {
      background-color: rgba(255, 255, 255, 0.08);
      border-color: var(--bs-secondary-color);
      color: var(--bs-text-color);
      box-shadow: 0 0 0 0.25rem rgba(55, 183, 195, 0.25);
    }

    .form-label {
      color: var(--bs-text-color);
      font-size: 0.75rem;
      letter-spacing: 0.05em;
    }

    .result-content {
      background-color: rgba(0, 0, 0, 0.3);
      border: 1px solid var(--bs-border-color);
      border-radius: 4px;
      padding: 1rem;
      color: var(--bs-text-color);
      font-family: 'Courier New', monospace;
      font-size: 0.875rem;
      line-height: 1.5;
      white-space: pre-wrap;
      word-break: break-all;
      overflow-wrap: break-word;
    }

    .form-check-input {
      border-color: var(--bs-border-color);
      background-color: rgba(255, 255, 255, 0.05);
    }

    .form-check-input:checked {
      background-color: var(--bs-primary-color);
      border-color: var(--bs-primary-color);
    }

    .form-check-input:focus {
      border-color: var(--bs-secondary-color);
      box-shadow: 0 0 0 0.25rem rgba(55, 183, 195, 0.25);
    }

    .form-check-label {
      color: var(--bs-text-color);
      user-select: none;
      cursor: pointer;
    }

    /* Button Styles */
    .btn {
      font-weight: 600;
      border-radius: 4px;
      transition: all 0.2s ease;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      --bs-btn-bg: var(--bs-primary-color);
      --bs-btn-border-color: var(--bs-primary-color);
      --bs-btn-hover-bg: var(--bs-secondary-color);
      --bs-btn-hover-border-color: var(--bs-secondary-color);
      --bs-btn-active-bg: var(--bs-secondary-color);
      --bs-btn-active-border-color: var(--bs-secondary-color);
      color: var(--bs-text-color);
    }

    .btn-outline-light {
      --bs-btn-color: var(--bs-text-color);
      --bs-btn-border-color: var(--bs-text-color);
      --bs-btn-hover-color: var(--bs-text-color);
      --bs-btn-hover-bg: rgba(55, 183, 195, 0.2);
      --bs-btn-hover-border-color: var(--bs-secondary-color);
      --bs-btn-active-color: var(--bs-text-color);
      --bs-btn-active-bg: rgba(55, 183, 195, 0.3);
      --bs-btn-active-border-color: var(--bs-secondary-color);
    }

    .alert {
      background-color: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--bs-border-color);
      color: var(--bs-text-color);
    }

    .alert-danger {
      border-color: #dc3545;
      background-color: rgba(220, 53, 69, 0.1);
      color: #ff6b6b;
    }

    .stats-container {
      background-color: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--bs-border-color);
      border-radius: 4px;
      padding: 1rem;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 1rem;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .stat-label {
      font-size: 0.75rem;
      color: rgba(235, 244, 246, 0.7);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .stat-value {
      font-size: 1rem;
      font-weight: 600;
      color: var(--bs-secondary-color);
      font-family: 'Courier New', monospace;
    }
  `]
})
export class JsonMinifyComponent {
  rawJsonInput = '';
  minifiedJsonOutput = '';
  minifyLoading = false;
  minifyError = '';

  originalSize = 0;
  minifiedSize = 0;
  compressionRatio = 0;

  constructor(private toolService: ToolService) {}

  minify(): void {
    if (!this.rawJsonInput.trim()) {
      this.minifyError = 'Please enter JSON to minify';
      return;
    }

    this.minifyLoading = true;
    this.minifyError = '';
    this.minifiedJsonOutput = '';

    this.toolService.post('JsonMinify', 'minify', { rawJson: this.rawJsonInput }).subscribe({
      next: (response: any) => {
        if (response && response.minified) {
          this.minifiedJsonOutput = response.minified;
          this.originalSize = response.originalSize || this.rawJsonInput.length;
          this.minifiedSize = response.minifiedSize || response.minified.length;
          this.compressionRatio = response.compressionRatio || 0;
          this.minifyError = '';
        } else {
          this.minifyError = 'Unexpected response from server';
        }
        this.minifyLoading = false;
      },
      error: (err: any) => {
        // Try to parse error response if available
        if (err.error && err.error.Message) {
          this.minifyError = err.error.Message;
        } else if (err.error && err.error.Error) {
          this.minifyError = err.error.Error;
        } else {
          this.minifyError = 'Failed to minify JSON. Invalid JSON or server error.';
        }
        this.minifyLoading = false;
      }
    });
  }

  copyToClipboard(): void {
    if (!this.minifiedJsonOutput) {
      return;
    }

    navigator.clipboard.writeText(this.minifiedJsonOutput).catch(() => {
      alert('Failed to copy to clipboard');
    });
  }
}
