const fs = require('fs-extra');
const concat = require('concat');

(async function build() {
  const files = [
    './dist/frontend/browser/polyfills.js',
    './dist/frontend/browser/main.js'
  ];

  await fs.ensureDir('preview');
  await concat(files, 'preview/plugin-bundle.js');
  console.log('✅ Web Component built: preview/plugin-bundle.js');
})();