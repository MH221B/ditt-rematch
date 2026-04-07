import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, shareReplay, filter } from 'rxjs/operators';
import { Tool, ToolStatus } from '../models/tool.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PluginService {
  private baseUrl = environment.apiUrl;

  // Shared state for all plugins and active plugins
  private plugins$ = new BehaviorSubject<Tool[] | null>(null);
  private activePlugins$ = new BehaviorSubject<Tool[] | null>(null);
  
  private pluginsLoaded = false;
  private activePluginsLoaded = false;

  constructor(private http: HttpClient) {}

  // Get all plugins (admin: all statuses, user: filtered by role)
  // Returns shared BehaviorSubject that caches data and broadcasts updates
  getPlugins(): Observable<Tool[]> {
    // If not loaded yet, kick off the HTTP request
    if (!this.pluginsLoaded) {
      this.pluginsLoaded = true;
      this.http.get<Tool[]>(`${this.baseUrl}/api/plugins`).subscribe({
        next: (tools) => this.plugins$.next(tools),
        error: (error) => {
          this.pluginsLoaded = false; // Reset so we retry on next call
          console.error('Failed to load plugins:', error);
        }
      });
    }

    // Return the BehaviorSubject as Observable, filtering out null values
    return this.plugins$.asObservable().pipe(
      filter((tools) => tools !== null),
      shareReplay(1)
    );
  }

  // Get only active plugins
  getActivePlugins(): Observable<Tool[]> {
    // If not loaded yet, kick off the HTTP request
    if (!this.activePluginsLoaded) {
      this.activePluginsLoaded = true;
      this.http.get<Tool[]>(`${this.baseUrl}/api/plugins/active`).subscribe({
        next: (tools) => this.activePlugins$.next(tools),
        error: (error) => {
          this.activePluginsLoaded = false; // Reset so we retry on next call
          console.error('Failed to load active plugins:', error);
        }
      });
    }

    return this.activePlugins$.asObservable().pipe(
      filter((tools) => tools !== null),
      shareReplay(1)
    );
  }

  // Get single plugin details
  getPlugin(name: string): Observable<Tool> {
    return this.http.get<Tool>(`${this.baseUrl}/api/plugins/${name}`);
  }

  // Update tool status and broadcast to all subscribers
  updateToolStatus(name: string, status: ToolStatus): Observable<Tool> {
    return this.http.put<Tool>(`${this.baseUrl}/api/plugins/${name}/status`, { status }).pipe(
      tap((updatedTool) => this.updateToolInCache(updatedTool))
    );
  }

  // Update tool premium status and broadcast to all subscribers
  updateToolPremium(name: string, isPremium: boolean): Observable<Tool> {
    return this.http.put<Tool>(`${this.baseUrl}/api/plugins/${name}/premium`, { isPremium }).pipe(
      tap((updatedTool) => this.updateToolInCache(updatedTool))
    );
  }

  // Private method: update tool in both caches and emit new state
  private updateToolInCache(updatedTool: Tool): void {
    // Update in all plugins cache
    const currentPlugins = this.plugins$.value;
    if (currentPlugins) {
      const index = currentPlugins.findIndex((t) => t.name === updatedTool.name);
      if (index !== -1) {
        const newPlugins = [...currentPlugins];
        newPlugins[index] = updatedTool;
        this.plugins$.next(newPlugins);
      }
    }

    // Update in active plugins cache
    const currentActivePlugins = this.activePlugins$.value;
    if (currentActivePlugins) {
      const index = currentActivePlugins.findIndex((t) => t.name === updatedTool.name);
      if (index !== -1) {
        const newActivePlugins = [...currentActivePlugins];
        newActivePlugins[index] = updatedTool;
        this.activePlugins$.next(newActivePlugins);
      }
    }
  }

  // Upload plugin DLL and refresh cache
  uploadPlugin(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/api/plugins/upload`, formData).pipe(
      tap(() => this.refreshAllCaches())
    );
  }

  // Unload plugin and refresh cache
  unloadPlugin(name: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/plugins/unload?name=${name}`, {}).pipe(
      tap(() => this.refreshAllCaches())
    );
  }

  // Delete tool (soft delete for built-in, hard delete for plugins)
  deleteTool(toolName: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/api/plugins/${toolName}`).pipe(
      tap(() => {
        // Refresh the tools cache after successful deletion
        this.refreshAllCaches();
      })
    );
  }

  // Public method to refresh all caches from API
  refreshAllCaches(): void {
    this.pluginsLoaded = false;
    this.activePluginsLoaded = false;
    // Trigger reload
    this.getPlugins().subscribe();
    this.getActivePlugins().subscribe();
  }
}