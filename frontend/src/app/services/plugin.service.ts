import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tool } from '../models/tool.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PluginService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Get all loaded plugins
  getPlugins(): Observable<Tool[]> {
    return this.http.get<Tool[]>(`${this.baseUrl}/api/plugins`);
  }

  // Get single plugin details
  getPlugin(name: string): Observable<Tool> {
    return this.http.get<Tool>(`${this.baseUrl}/api/plugins/${name}`);
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