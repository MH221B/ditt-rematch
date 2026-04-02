import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { Base64ToolComponent } from './tool.component';

(async () => {
  const app = await createApplication({
    providers: [provideHttpClient()]
  });

  // Convert Angular Component → Web Component
  const toolElement = createCustomElement(Base64ToolComponent, {
    injector: app.injector
  });

  // Register with the browser as a custom HTML element
  customElements.define('ditt-plugin-Base64Tool', toolElement);
})();