import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ToolService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Generic method to invoke tool endpoints with any HTTP method
  invoke(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    pluginName: string,
    path: string,
    body?: any
  ): Observable<any> {
    const url = `${this.baseUrl}/api/tools/${pluginName}/${path}`;

    switch (method) {
      case 'GET':
        return this.http.get(url);
      case 'POST':
        return this.http.post(url, body);
      case 'PUT':
        return this.http.put(url, body);
      case 'DELETE':
        return this.http.delete(url);
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  }

  // Convenience methods
  get(pluginName: string, path: string): Observable<any> {
    return this.invoke('GET', pluginName, path);
  }

  post(pluginName: string, path: string, body: any): Observable<any> {
    return this.invoke('POST', pluginName, path, body);
  }

  put(pluginName: string, path: string, body: any): Observable<any> {
    return this.invoke('PUT', pluginName, path, body);
  }

  delete(pluginName: string, path: string): Observable<any> {
    return this.invoke('DELETE', pluginName, path);
  }
}
