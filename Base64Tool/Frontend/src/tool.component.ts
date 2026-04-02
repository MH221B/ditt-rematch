import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'tool-template',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-container d-flex flex-column h-100 p-4">

      <!-- Header -->
      <div class="tool-header border-bottom border-secondary pb-3 mb-4">
        <h2 class="tool-title fs-2 fw-bold mb-2">Base64 string encoder/decoder</h2>
        <p class="tool-description text-muted mb-0">Simply encode and decode strings into their base64 representation.</p>
      </div>

      <!-- Content Grid -->
      <div class="row g-3 flex-grow-1 overflow-auto">

        <!-- ENCODE SECTION -->
        <div class="col-lg-6 col-12">
          <div class="card card-section h-100">
            <div class="card-header border-secondary">
              <h3 class="card-title text-secondary fw-semibold mb-0">String to base64</h3>
            </div>
            <div class="card-body d-flex flex-column gap-3">

              <!-- URL-Safe Toggle -->
              <div class="form-check">
                <input
                  type="checkbox"
                  class="form-check-input"
                  id="encodeUrlSafe"
                  [(ngModel)]="encodeUrlSafe" />
                <label class="form-check-label" for="encodeUrlSafe">
                  Encode URL safe
                </label>
              </div>

              <!-- Input Area -->
              <div>
                <label for="encodeInput" class="form-label text-uppercase small fw-semibold">String to encode</label>
                <textarea
                  id="encodeInput"
                  class="form-control form-control-input"
                  [(ngModel)]="encodeInput"
                  placeholder="Put your string here..."
                  rows="5">
                </textarea>
              </div>

              <!-- Result Area -->
              <div class="flex-grow-1 d-flex flex-column">
                <label for="encodeResult" class="form-label text-uppercase small fw-semibold">Base64 of string</label>
                <pre id="encodeResult" class="result-content flex-grow-1 mb-0">{{ encodeResult || 'The base64 encoding of your string will be here' }}</pre>
              </div>

              <!-- Error -->
              @if (encodeError) {
                <div class="alert alert-danger mb-0" role="alert">{{ encodeError }}</div>
              }

              <!-- Action Buttons -->
              <div class="d-flex gap-2 flex-wrap">
                <button
                  type="button"
                  class="btn btn-primary"
                  (click)="encode()"
                  [disabled]="encodeLoading">
                  @if (encodeLoading) {
                    <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  }
                  Encode
                </button>
                @if (encodeResult) {
                  <button
                    type="button"
                    class="btn btn-outline-light"
                    (click)="copyToClipboard(encodeResult, 'base64')">
                    Copy base64
                  </button>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- DECODE SECTION -->
        <div class="col-lg-6 col-12">
          <div class="card card-section h-100">
            <div class="card-header border-secondary">
              <h3 class="card-title text-secondary fw-semibold mb-0">Base64 to string</h3>
            </div>
            <div class="card-body d-flex flex-column gap-3">

              <!-- URL-Safe Toggle -->
              <div class="form-check">
                <input
                  type="checkbox"
                  class="form-check-input"
                  id="decodeUrlSafe"
                  [(ngModel)]="decodeUrlSafe" />
                <label class="form-check-label" for="decodeUrlSafe">
                  Decode URL safe
                </label>
              </div>

              <!-- Input Area -->
              <div>
                <label for="decodeInput" class="form-label text-uppercase small fw-semibold">Base64 string to decode</label>
                <textarea
                  id="decodeInput"
                  class="form-control form-control-input"
                  [(ngModel)]="decodeInput"
                  placeholder="Your base64 string..."
                  rows="5">
                </textarea>
              </div>

              <!-- Result Area -->
              <div class="flex-grow-1 d-flex flex-column">
                <label for="decodeResult" class="form-label text-uppercase small fw-semibold">Decoded string</label>
                <pre id="decodeResult" class="result-content flex-grow-1 mb-0">{{ decodeResult || 'The decoded string will be here' }}</pre>
              </div>

              <!-- Error -->
              @if (decodeError) {
                <div class="alert alert-danger mb-0" role="alert">{{ decodeError }}</div>
              }

              <!-- Action Buttons -->
              <div class="d-flex gap-2 flex-wrap">
                <button
                  type="button"
                  class="btn btn-primary"
                  (click)="decode()"
                  [disabled]="decodeLoading">
                  @if (decodeLoading) {
                    <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  }
                  Decode
                </button>
                @if (decodeResult) {
                  <button
                    type="button"
                    class="btn btn-outline-light"
                    (click)="copyToClipboard(decodeResult, 'decoded')">
                    Copy decoded string
                  </button>
                }
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  `,
  styles: [`
    :host {
      --bs-primary-color:        #088395;
      --bs-secondary-color:      #37B7C3;
      --bs-background-color:     #071952;
      --bs-dark-bg:              #0A2463;
      --bs-border-color:         #2A9DAF;
      --bs-text-color:           #EBF4F6;
      --bs-body-bg: var(--bs-background-color);
      --bs-body-color: var(--bs-text-color);
      display: block;
      height: 100%;
    }

    /* Override Bootstrap color schema */
    .btn-primary {
      --bs-btn-bg: var(--bs-primary-color);
      --bs-btn-border-color: var(--bs-primary-color);
      --bs-btn-hover-bg: var(--bs-secondary-color);
      --bs-btn-hover-border-color: var(--bs-secondary-color);
    }

    .btn-outline-light {
      --bs-btn-color: var(--bs-text-color);
      --bs-btn-border-color: var(--bs-text-color);
      --bs-btn-hover-color: var(--bs-text-color);
      --bs-btn-hover-bg: rgba(255, 255, 255, 0.1);
      --bs-btn-hover-border-color: var(--bs-secondary-color);
    }

    .btn:disabled {
      opacity: 0.5;
    }

    .form-control,
    .form-control-input {
      --bs-form-control-bg: var(--bs-dark-bg);
      --bs-form-control-color: var(--bs-text-color);
      --bs-form-control-border-color: var(--bs-border-color);
      --bs-form-control-placeholder-color: rgba(235, 244, 246, 0.4);
      font-family: "Courier New", monospace;
      font-size: 0.9rem;
    }

    .form-control:focus,
    .form-control-input:focus {
      --bs-form-control-border-color: var(--bs-primary-color);
      color: var(--bs-text-color);
      background-color: var(--bs-dark-bg);
      box-shadow: 0 0 0 0.25rem rgba(8, 131, 149, 0.25);
    }

    .form-label {
      color: var(--bs-border-color);
      font-weight: 600;
    }

    .form-check-label {
      color: var(--bs-text-color);
      cursor: pointer;
    }

    .form-check-input {
      border-color: var(--bs-border-color);
      accent-color: var(--bs-primary-color);
    }

    .form-check-input:checked {
      background-color: var(--bs-primary-color);
      border-color: var(--bs-primary-color);
    }

    .card {
      --bs-card-bg: rgba(10, 36, 99, 0.3);
      --bs-card-border-color: var(--bs-dark-bg);
      border: 1px solid var(--bs-dark-bg);
    }

    .card-header {
      --bs-card-header-bg: transparent;
      --bs-card-header-border-color: var(--bs-border-color);
      border-bottom: 1px solid var(--bs-border-color);
    }

    .card-title {
      color: var(--bs-secondary-color);
      margin: 0;
    }

    .result-content {
      background-color: var(--bs-dark-bg);
      border: 1px solid var(--bs-border-color);
      border-radius: 0.375rem;
      padding: 1rem;
      color: var(--bs-text-color);
      font-family: "Courier New", monospace;
      font-size: 0.875rem;
      white-space: pre-wrap;
      word-break: break-all;
      max-height: 150px;
      overflow-y: auto;
    }

    .alert-danger {
      --bs-alert-bg: rgba(220, 53, 69, 0.15);
      --bs-alert-border-color: rgba(220, 53, 69, 0.3);
      --bs-alert-color: #ff6b6b;
    }

    .tool-header {
      border-color: var(--bs-dark-bg);
    }

    .tool-title {
      color: var(--bs-border-color);
    }

    .tool-description {
      color: var(--bs-text-color);
      opacity: 0.8;
    }

    .tool-container {
      background-color: var(--bs-background-color);
      color: var(--bs-text-color);
    }

    .card-section {
      display: flex;
      flex-direction: column;
    }

    .spinner-border {
      animation: spin 0.75s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class Base64ToolComponent {
  // Encode state
  encodeInput = '';
  encodeResult = '';
  encodeLoading = false;
  encodeError = '';
  encodeUrlSafe = false;

  // Decode state
  decodeInput = '';
  decodeResult = '';
  decodeLoading = false;
  decodeError = '';
  decodeUrlSafe = false;

  private readonly apiBase = 'http://localhost:5000/api/tools/Base64Tool';

  constructor(private http: HttpClient) {}

  encode(): void {
    if (!this.encodeInput.trim()) {
      this.encodeError = 'Please enter a string to encode';
      return;
    }

    this.encodeLoading = true;
    this.encodeError = '';
    this.encodeResult = '';

    this.http
      .post<{ success: boolean; data: string; error?: string }>(
        `${this.apiBase}/encode`,
        { value: this.encodeInput, urlSafe: this.encodeUrlSafe }
      )
      .subscribe({
        next: (res: { success: boolean; data: string; error?: string }) => {
          if (res.success) {
            this.encodeResult = res.data;
          } else {
            this.encodeError = res.error ?? 'Encoding failed';
          }
          this.encodeLoading = false;
        },
        error: () => {
          this.encodeError = 'Failed to reach the API';
          this.encodeLoading = false;
        }
      });
  }

  decode(): void {
    if (!this.decodeInput.trim()) {
      this.decodeError = 'Please enter a base64 string to decode';
      return;
    }

    this.decodeLoading = true;
    this.decodeError = '';
    this.decodeResult = '';

    this.http
      .post<{ success: boolean; data: string; error?: string }>(
        `${this.apiBase}/decode`,
        { value: this.decodeInput, urlSafe: this.decodeUrlSafe }
      )
      .subscribe({
        next: (res: { success: boolean; data: string; error?: string }) => {
          if (res.success) {
            this.decodeResult = res.data;
          } else {
            this.decodeError = res.error ?? 'Decoding failed';
          }
          this.decodeLoading = false;
        },
        error: () => {
          this.decodeError = 'Failed to reach the API';
          this.decodeLoading = false;
        }
      });
  }

  copyToClipboard(text: string, type: string): void {
    navigator.clipboard.writeText(text).then(() => {
      // Success feedback could be added here (toast/notification)
    }).catch(() => {
      alert(`Failed to copy ${type} to clipboard`);
    });
  }
}
