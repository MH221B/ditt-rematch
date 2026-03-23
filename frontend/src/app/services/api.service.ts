// frontend/my-tool-platform/src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Health check — verifies API is reachable
  getHealth(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/health`);
  }
}