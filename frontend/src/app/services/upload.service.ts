import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UploadResponse {
  message: string;
  package: {
    id: string;
    name: string;
    version: string;
    author?: string;
    description?: string;
    status: string;
    uploadedAt?: string;
    frontendBundlePath?: string;
  };
  tool?: any;
}

export interface UploadError {
  error: string;
}

@Injectable({ providedIn: 'root' })
export class UploadService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  uploadPlugin(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<UploadResponse>(`${this.baseUrl}/api/packages/upload`, formData);
  }
}
