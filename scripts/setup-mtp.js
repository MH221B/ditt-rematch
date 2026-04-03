const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const toolBinDir = path.join(rootDir, 'tools', 'bin');

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: 'inherit',
    env: process.env,
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if ((result.status ?? 1) !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (fs.existsSync(toolBinDir)) {
  fs.rmSync(toolBinDir, { recursive: true, force: true });
}

run('dotnet', ['pack', 'sdk/DITT.SDK', '--configuration', 'Release', '--output', './nupkgs']);
run('dotnet', ['pack', 'tools/DITT.CLI', '--configuration', 'Release', '--output', './nupkgs']);
run('dotnet', ['tool', 'install', 'DITT.CLI', '--tool-path', './tools/bin', '--add-source', './nupkgs']);