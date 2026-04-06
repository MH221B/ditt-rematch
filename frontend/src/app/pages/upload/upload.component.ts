import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UploadService, UploadResponse } from '../../services/upload.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-5">
      <div class="title text-center mb-4">
        <h1 class="fw-bold text-primary">Upload Your Own Plugin in Just a Few Quick Steps</h1>
      </div>

      <div class="container mb-5">
        <div class="card">
          <div class="card-header h1 text-center text-uppercase">Upload Your Plugin</div>
          <div class="card-body">
            <div class="file-loading" (click)="fileInput.click()" (dragover)="onDragOver($event)" (dragleave)="onDragLeave()" (drop)="onFileSelected($event)" [class.drag-over]="isDragging">
              <div class="file-loading-text">Click or drag to select .mtpkg file</div>
              <input 
                #fileInput
                id="input-20" 
                type="file" 
                name="file"
                (change)="onFileSelected($event)"
                accept=".mtpkg"
              >
            </div>
            @if (selectedFile) {
              <div class="alert alert-info mt-3 d-flex justify-content-between align-items-center">
                <div>
                  <strong>Selected file:</strong> {{ selectedFile.name }}
                </div>
                <button 
                  type="button" 
                  class="btn btn-sm btn-secondary"
                  (click)="removeFile()"
                  title="Remove selected file"
                >
                  Remove
                </button>
              </div>
            }
          </div>
          <div class="card-footer">
            <button 
              type="button" 
              class="btn btn-primary w-100"
              (click)="onUpload()"
              [disabled]="!selectedFile || uploading"
            >
              @if (uploading) {
                <span class="spinner-border spinner-border-sm me-2"></span>
                Uploading...
              } @else {
                Upload
              }
            </button>
          </div>
        </div>
      </div>

      @if (successMessage) {
        <div class="container mb-5">
          <div class="alert alert-success alert-dismissible fade show" role="alert">
            <strong>Success!</strong> {{ successMessage }}
            @if (uploadResponse?.package) {
              <div class="mt-2">
                <small>
                  Plugin: {{ uploadResponse!.package!.name }} (v{{ uploadResponse!.package!.version }})
                </small>
              </div>
            }
            <button type="button" class="btn-close" (click)="clearMessages()"></button>
          </div>
        </div>
      }

      @if (errorMessage) {
        <div class="container mb-5">
          <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>Error!</strong> {{ errorMessage }}
            <button type="button" class="btn-close" (click)="clearMessages()"></button>
          </div>
        </div>
      }

      <div class="container instruction-container mt-5 mb-5">
        <div class="row">
          <div class="col-md-6 mb-4 d-flex align-items-start">
            <div class="step-circle me-3">1</div>
            <div>
              <h5 class="fw-bold">Prepare Your Plugin</h5>
              <p>Create a <strong>.mtpkg</strong> file containing your plugin. It should include:</p>
              <ul>
                <li>A compiled <code>.dll</code> file with your C# code implementing <code>IToolPlugin</code></li>
                <li>Optional: A bundled <code>plugin-bundle.js</code> file containing your Angular frontend component</li>
              </ul>
            </div>
          </div>
          <div class="col-md-6 mb-4 d-flex align-items-start">
            <div class="step-circle me-3">2</div>
            <div>
              <h5 class="fw-bold">Upload the Plugin Package</h5>
              <p>Use the form above to upload your plugin <strong>.mtpkg</strong> file. Make sure it follows the correct structure.</p>
            </div>
          </div>
          <div class="col-md-6 mb-4 d-flex align-items-start">
            <div class="step-circle me-3">3</div>
            <div>
              <h5 class="fw-bold">System Validates & Loads</h5>
              <p>The system will extract the mtpkg, validate the plugin structure, and dynamically load it into the platform.</p>
            </div>
          </div>
          <div class="col-md-6 mb-4 d-flex align-items-start">
            <div class="step-circle me-3">4</div>
            <div>
              <h5 class="fw-bold">Access Your Tool</h5>
              <p>Once loaded, your tool becomes instantly available in the tools menu, complete with its own frontend and backend integration.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      color: var(--text-color);
    }

    .title {
      margin-bottom: 2rem;
    }

    .title h1 {
      color: var(--text-color);
      font-size: 2.5rem;
      font-weight: bold;
    }

    .title p {
      color: var(--text-color);
      font-size: 1.25rem;
    }

    .card {
      background-color: var(--card-bg, rgba(255, 255, 255, 0.05));
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
      color: var(--text-color);
    }

    .card-header {
      background-color: var(--card-header-bg, rgba(255, 255, 255, 0.08));
      border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
      color: var(--text-color);
      padding: 1rem;
    }

    .card-body {
      padding: 2rem;
    }

    .card-footer {
      background-color: var(--card-footer-bg, rgba(255, 255, 255, 0.05));
      border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
      padding: 1rem;
    }

    /* DRAG AND DROP ZONE UPDATES */
    .file-loading {
      position: relative;
      padding: 4rem 2rem; /* Increased padding */
      min-height: 200px; /* Added minimum height */
      display: flex; /* Centers the content vertically and horizontally */
      align-items: center;
      justify-content: center;
      border: 2px dashed var(--primary-color, #0d6efd);
      border-radius: 8px;
      text-align: center;
      background-color: rgba(13, 110, 253, 0.05);
      transition: all 0.2s ease-in-out;
    }

    .file-loading input[type="file"] {
      display: block;
      width: 100%;
      cursor: pointer;
      opacity: 0;
      pointer-events: none;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      font-size: 0; /* Prevents browsers from rendering weird icons inside the invisible input */
      z-index: 2;
    }

    .file-loading::before {
      display: none;
    }

    .file-loading-text {
      color: var(--text-color);
      font-size: 1.25rem;
      font-weight: 500;
      pointer-events: none;
      z-index: 1;
    }

    .file-loading.drag-over {
      background-color: rgba(13, 110, 253, 0.15);
      border-color: var(--primary-color);
      box-shadow: 0 0 12px rgba(13, 110, 253, 0.3);
      transform: scale(1.02); /* Slight pop effect when dragging over */
    }
    /* END DRAG AND DROP ZONE UPDATES */

    .alert {
      color: var(--text-color);
    }

    .alert-info {
      background-color: rgba(23, 162, 184, 0.1);
      border: 1px solid rgba(23, 162, 184, 0.3);
      color: var(--text-color);
    }

    .alert-success {
      background-color: rgba(40, 167, 69, 0.1);
      border: 1px solid rgba(40, 167, 69, 0.3);
      color: var(--text-color);
    }

    .alert-danger {
      background-color: rgba(220, 53, 69, 0.1);
      border: 1px solid rgba(220, 53, 69, 0.3);
      color: var(--text-color);
    }

    .btn-primary {
      background-color: var(--primary-color, #0d6efd);
      border-color: var(--primary-color, #0d6efd);
      color: white;
      font-weight: bold;
      padding: 0.75rem 1.5rem;
      transition: all 0.3s ease;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: var(--primary-color-hover, #0b5ed7);
      border-color: var(--primary-color-hover, #0b5ed7);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(13, 110, 253, 0.4);
    }

    .btn-primary:active:not(:disabled) {
      transform: translateY(0);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background-color: var(--secondary-color-3, #4D55CC);
      border-color: var(--secondary-color-3, #4D55CC);
      color: white;
      font-weight: 500;
    }

    .btn-secondary:hover:not(:disabled) {
      background-color: var(--secondary-color-4, #7A73D1);
      border-color: var(--secondary-color-4, #7A73D1);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(77, 85, 204, 0.3);
    }

    .btn-secondary:active:not(:disabled) {
      transform: translateY(0);
    }

    .instruction-container {
      color: var(--text-color);
      background-color: var(--secondary-bg, rgba(255, 255, 255, 0.05));
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
      padding: 30px;
      border-radius: 8px;
    }

    .instruction-container h5 {
      color: var(--text-color);
      margin-top: 0;
    }

    .instruction-container p {
      color: var(--text-color);
    }

    .instruction-container ul {
      color: var(--text-color);
    }

    .instruction-container li {
      color: var(--text-color);
      margin-bottom: 0.5rem;
    }

    .step-circle {
      width: 40px;
      height: 40px;
      background-color: var(--secondary-color, #17a2b8);
      color: white;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-size: 18px;
      box-sizing: border-box;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(23, 162, 184, 0.3);
    }

    code {
      background-color: var(--code-bg, rgba(233, 236, 239, 0.1));
      color: var(--code-color, #ff6b6b);
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 0.9em;
      font-family: 'Courier New', monospace;
    }

    .spinner-border {
      color: white;
    }

    .btn-close {
      background-color: var(--text-color);
    }

    strong {
      color: var(--text-color);
      font-weight: bold;
    }
  `]
})
export class UploadComponent {
  selectedFile: File | null = null;
  uploading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  uploadResponse: UploadResponse | null = null;
  isDragging = false;

  constructor(private uploadService: UploadService, private router: Router) {}

  onFileSelected(event: Event): void {
    this.isDragging = false;
    let files: FileList | null = null;

    if (event instanceof DragEvent && event.dataTransfer) {
      files = event.dataTransfer.files;
      event.preventDefault();
    } else {
      const input = event.target as HTMLInputElement;
      files = input.files;
    }

    if (files && files.length > 0) {
      const file = files[0];
      if (!file.name.toLowerCase().endsWith('.mtpkg')) {
        this.errorMessage = 'Invalid file type. Please select a .mtpkg file.';
        this.selectedFile = null;
        return;
      }
      this.selectedFile = file;
      this.clearMessages();
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(): void {
    this.isDragging = false;
  }

  removeFile(): void {
    this.selectedFile = null;
    this.clearMessages();
  }

  onUpload(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Please select a file to upload.';
      return;
    }

    if (!this.selectedFile.name.toLowerCase().endsWith('.mtpkg')) {
      this.errorMessage = 'Invalid file type. Only .mtpkg files are allowed.';
      return;
    }

    this.uploading = true;
    this.clearMessages();

    this.uploadService.uploadPlugin(this.selectedFile).subscribe({
      next: (response: UploadResponse) => {
        this.uploading = false;
        this.successMessage = response.message;
        this.uploadResponse = response;
        this.selectedFile = null;
        // Redirect to admin page after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/admin']);
        }, 2000);
      },
      error: (error: any) => {
        this.uploading = false;
        if (error.error?.error) {
          this.errorMessage = error.error.error;
        } else if (error.status === 0) {
          this.errorMessage = 'Connection error. Please check your internet connection.';
        } else if (error.status === 413) {
          this.errorMessage = 'File is too large. Please select a smaller file.';
        } else if (error.status === 400) {
          this.errorMessage = 'Invalid file format or structure. Please check your plugin file.';
        } else if (error.status === 409) {
          this.errorMessage = 'A plugin with this name already exists.';
        } else {
          this.errorMessage = 'An error occurred during upload. Please try again.';
        }
      }
    });
  }

  clearMessages(): void {
    this.successMessage = null;
    this.errorMessage = null;
  }
}