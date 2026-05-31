#!/usr/bin/env node

/**
 * nqui CLI dispatcher. Routes subcommands to the correct script.
 *
 * Usage:
 *   npx @nqlib/nqui init-css [output.css]
 *   npx @nqlib/nqui init-cursor
 *   npx @nqlib/nqui init-claude-skills
 *   npx @nqlib/nqui install-peers
 *   npx @nqlib/nqui init-debug
 *   npx @nqlib/nqui setup
 */

import { spawnSync } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const subcommand = process.argv[2];

const routes = {
  'init-cursor': './init-cursor.js',
  'init-skills': './download-skills.js',
  'init-claude-skills': './install-claude-skills.js',
  'install-peers': './install-peers.js',
  'init-debug': './init-debug-css.js',
  'init-debug-css': './init-debug-css.js',
  setup: './post-install.js',
};

if (routes[subcommand]) {
  const script = resolve(__dirname, routes[subcommand]);
  const result = spawnSync(process.execPath, [script, ...process.argv.slice(3)], {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
  process.exit(result.status ?? 1);
}

// Default: init-css (pass all args through)
const initCss = resolve(__dirname, 'init-css.js');
const result = spawnSync(process.execPath, [initCss, ...process.argv.slice(2)], {
  stdio: 'inherit',
  cwd: process.cwd(),
});
process.exit(result.status ?? 1);
