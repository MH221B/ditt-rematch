import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { ToolTemplateComponent } from './tool.component';

(async () => {
  const app = await createApplication({
    providers: [provideHttpClient()]
  });

  // Convert Angular Component → Web Component
  const toolElement = createCustomElement(ToolTemplateComponent, {
    injector: app.injector
  });

  // Register with the browser as a custom HTML element
  customElements.define('ditt-plugin-ToolTemplate', toolElement);
})();