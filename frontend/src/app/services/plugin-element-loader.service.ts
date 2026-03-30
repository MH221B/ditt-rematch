import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PluginElementLoaderService {
  private loadedPlugins = new Set<string>();

  async loadPluginBundle(pluginName: string, bundleUrl: string): Promise<void> {
    if (this.loadedPlugins.has(pluginName)) return;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = bundleUrl;
      script.onload = () => {
        this.loadedPlugins.add(pluginName);
        resolve();
      };
      script.onerror = () => reject(new Error(`Failed to load plugin bundle: ${pluginName}`));
      document.head.appendChild(script);
    });
  }

  isLoaded(pluginName: string): boolean {
    return this.loadedPlugins.has(pluginName);
  }
}