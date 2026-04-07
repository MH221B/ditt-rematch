import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PluginService } from './plugin.service';
import { Tool } from '../models/tool.model';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private toolsCache: Tool[] = [];
  private cacheLoaded = false;

  constructor(private pluginService: PluginService) {}

  /**
   * Search tools by name and description.
   * Ensures tools are loaded first, then filters client-side.
   */
  searchTools(query: string): Observable<Tool[]> {
    return this.ensureToolsLoaded().pipe(
      map(() => this.filterTools(query))
    );
  }

  /**
   * Load tools from backend and cache them for future searches.
   */
  private loadToolsFromBackend(): Observable<Tool[]> {
    return this.pluginService.getPlugins().pipe(
      map((tools) => {
        this.toolsCache = tools;
        this.cacheLoaded = true;
        return tools;
      })
    );
  }

  /**
   * Filter tools by query string matching name or description.
   */
  private filterTools(query: string): Tool[] {
    if (!query.trim()) {
      return this.toolsCache;
    }

    const lowerQuery = query.toLowerCase();
    return this.toolsCache.filter(
      (tool) =>
        tool.name.toLowerCase().includes(lowerQuery) ||
        tool.description.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Ensure cache is loaded. Returns immediately if already loaded.
   */
  ensureToolsLoaded(): Observable<Tool[]> {
    if (this.cacheLoaded) {
      return new Observable((observer) => {
        observer.next(this.toolsCache);
        observer.complete();
      });
    }

    return this.loadToolsFromBackend();
  }

  /**
   * Get cached tools immediately (empty if not yet loaded).
   */
  getTools(): Tool[] {
    return this.toolsCache;
  }

  /**
   * Force reload tools from backend and clear cache.
   */
  reloadTools(): Observable<Tool[]> {
    this.cacheLoaded = false;
    this.toolsCache = [];
    return this.loadToolsFromBackend();
  }
}
