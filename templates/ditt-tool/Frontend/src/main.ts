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

  // tooltemplate gets replaced with lowercase plugin name automatically
  customElements.define('ditt-plugin-tooltemplate', toolElement);
})();