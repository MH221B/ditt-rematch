import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tool, ToolStatus } from '../models/tool.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PluginService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Get all plugins (admin: all statuses, user: filtered by role)
  getPlugins(): Observable<Tool[]> {
    return this.http.get<Tool[]>(`${this.baseUrl}/api/plugins`);
  }

  // Get only active plugins
  getActivePlugins(): Observable<Tool[]> {
    return this.http.get<Tool[]>(`${this.baseUrl}/api/plugins/active`);
  }

  // Get single plugin details
  getPlugin(name: string): Observable<Tool> {
    return this.http.get<Tool>(`${this.baseUrl}/api/plugins/${name}`);
  }

  // Update tool status
  updateToolStatus(name: string, status: ToolStatus): Observable<Tool> {
    return this.http.put<Tool>(`${this.baseUrl}/api/plugins/${name}/status`, { status });
  }

  // Upload plugin DLL
  uploadPlugin(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/api/plugins/upload`, formData);
  }

  // Unload plugin
  unloadPlugin(name: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/plugins/unload?name=${name}`, {});
  }
}