import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'tool-template',
  standalone: true,
  imports: [CommonModule, FormsModule],
  encapsulation: ViewEncapsulation.ShadowDom, // Style isolation
  template: `
    <div class="tool-container">

      <div class="tool-header">
        <h2 class="tool-title">Base64 string encoder/decoder</h2>
        <p class="tool-description">Simply encode and decode strings into their base64 representation.</p>
      </div>

      <div class="tool-body-wrapper">

        <!-- ENCODE SECTION -->
        <div class="encode-section">
          <div class="section-header">
            <h3 class="section-title">String to base64</h3>
          </div>

          <!-- URL-Safe Toggle -->
          <div class="toggle-section">
            <label class="checkbox-toggle-label">
              <input type="checkbox" [(ngModel)]="encodeUrlSafe" class="toggle-checkbox" />
              <span class="toggle-text">Encode URL safe</span>
            </label>
          </div>

          <!-- Input Area -->
          <div class="tool-input-group">
            <label class="tool-label">String to encode</label>
            <textarea
              class="tool-textarea"
              [(ngModel)]="encodeInput"
              placeholder="Put your string here..."
              rows="6">
            </textarea>
          </div>

          <!-- Result Area -->
          <div class="tool-result-group">
            <label class="tool-label">Base64 of string</label>
            <pre class="tool-result-content">{{ encodeResult || 'The base64 encoding of your string will be here' }}</pre>
          </div>

          <!-- Error -->
          @if (encodeError) {
            <div class="alert alert-danger">{{ encodeError }}</div>
          }

          <!-- Action Buttons -->
          <div class="section-actions">
            <button
              class="btn btn-secondary"
              (click)="encode()"
              [disabled]="encodeLoading">
              @if (encodeLoading) {
                <span class="spinner-border spinner-border-sm me-2"></span>
              }
              Encode
            </button>
            @if (encodeResult) {
              <button
                class="btn btn-outline-light"
                (click)="copyToClipboard(encodeResult, 'base64')">
                Copy base64
              </button>
            }
          </div>
        </div>

        <!-- DECODE SECTION -->
        <div class="decode-section">
          <div class="section-header">
            <h3 class="section-title">Base64 to string</h3>
          </div>

          <!-- URL-Safe Toggle -->
          <div class="toggle-section">
            <label class="checkbox-toggle-label">
              <input type="checkbox" [(ngModel)]="decodeUrlSafe" class="toggle-checkbox" />
              <span class="toggle-text">Decode URL safe</span>
            </label>
          </div>

          <!-- Input Area -->
          <div class="tool-input-group">
            <label class="tool-label">Base64 string to decode</label>
            <textarea
              class="tool-textarea"
              [(ngModel)]="decodeInput"
              placeholder="Your base64 string..."
              rows="6">
            </textarea>
          </div>

          <!-- Result Area -->
          <div class="tool-result-group">
            <label class="tool-label">Decoded string</label>
            <pre class="tool-result-content">{{ decodeResult || 'The decoded string will be here' }}</pre>
          </div>

          <!-- Error -->
          @if (decodeError) {
            <div class="alert alert-danger">{{ decodeError }}</div>
          }

          <!-- Action Buttons -->
          <div class="section-actions">
            <button
              class="btn btn-secondary"
              (click)="decode()"
              [disabled]="decodeLoading">
              @if (decodeLoading) {
                <span class="spinner-border spinner-border-sm me-2"></span>
              }
              Decode
            </button>
            @if (decodeResult) {
              <button
                class="btn btn-outline-light"
                (click)="copyToClipboard(decodeResult, 'decoded')">
                Copy decoded string
              </button>
            }
          </div>
        </div>

      </div>

      <!-- Global Clear Button -->
      <div class="global-actions">
        <button
          class="btn btn-outline-light"
          (click)="clear()">
          Clear All
        </button>
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
      font-size: 1.75rem;
    }

    .tool-description {
      color: var(--text-color);
      opacity: 0.8;
      font-size: 0.9rem;
      margin: 0;
    }

    .tool-body-wrapper {
      flex: 1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 1rem;
      overflow-y: auto;
    }

    @media (max-width: 1024px) {
      .tool-body-wrapper {
        grid-template-columns: 1fr;
      }
    }

    .encode-section,
    .decode-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid var(--secondary-color-1);
      border-radius: 8px;
      background-color: rgba(10, 36, 99, 0.3);
    }

    .section-header {
      border-bottom: 1px solid var(--secondary-color-2);
      padding-bottom: 0.75rem;
    }

    .section-title {
      color: var(--secondary-color);
      font-weight: 600;
      font-size: 1.1rem;
      margin: 0;
    }

    .toggle-section {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .checkbox-toggle-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      user-select: none;
    }

    .toggle-checkbox {
      width: 18px;
      height: 18px;
      cursor: pointer;
      accent-color: var(--primary-color);
    }

    .toggle-text {
      color: var(--text-color);
      font-size: 0.9rem;
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

    .tool-input-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .tool-result-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      flex: 1;
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
      min-height: 120px;
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
      max-height: 150px;
      overflow-y: auto;
    }

    .section-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .btn {
      cursor: pointer;
      border: none;
      border-radius: 4px;
      padding: 0.5rem 1.25rem;
      font-size: 0.9rem;
      transition: all 0.2s ease;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secondary {
      background-color: var(--primary-color);
      color: var(--text-color);
    }

    .btn-secondary:hover:not(:disabled) {
      background-color: var(--secondary-color);
    }

    .btn-outline-light {
      background: transparent;
      border: 1px solid var(--text-color);
      color: var(--text-color);
    }

    .btn-outline-light:hover:not(:disabled) {
      background-color: rgba(255, 255, 255, 0.1);
      border-color: var(--secondary-color);
    }

    .alert-danger {
      background-color: rgba(220, 53, 69, 0.2);
      border: 1px solid rgba(220, 53, 69, 0.5);
      color: #ff6b6b;
      padding: 0.75rem;
      border-radius: 4px;
      font-size: 0.9rem;
    }

    .global-actions {
      display: flex;
      gap: 0.75rem;
      margin-top: 1rem;
    }

    .spinner-border {
      display: inline-block;
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

  private readonly apiBase = '/api/tools/Base64Tool';

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

  clear(): void {
    this.encodeInput = '';
    this.encodeResult = '';
    this.encodeError = '';
    this.encodeUrlSafe = false;

    this.decodeInput = '';
    this.decodeResult = '';
    this.decodeError = '';
    this.decodeUrlSafe = false;
  }
}
