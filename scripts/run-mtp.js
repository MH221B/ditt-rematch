const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const toolName = process.platform === 'win32' ? 'mtp.exe' : 'mtp';
const toolPath = path.resolve(__dirname, '..', 'tools', 'bin', toolName);

if (!fs.existsSync(toolPath)) {
  console.error(`Installed tool not found: ${toolPath}`);
  console.error('Run `npm run setup` to install the packaged CLI first.');
  process.exit(1);
}

const result = spawnSync(toolPath, process.argv.slice(2), {
  stdio: 'inherit',
  env: process.env,
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);