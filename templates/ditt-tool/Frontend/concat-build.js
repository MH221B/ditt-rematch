const fs = require('fs-extra');
const concat = require('concat');

(async function build() {
  const files = [
    './dist/frontend/polyfills.js',
    './dist/frontend/main.js'
  ];

  await fs.ensureDir('preview');
  await concat(files, 'preview/plugin-bundle.js');
  console.log('✅ Web Component built: preview/plugin-bundle.js');
})();