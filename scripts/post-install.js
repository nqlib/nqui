#!/usr/bin/env node

/**
 * Post-install: print next steps for nqui setup.
 * Runs after npm/pnpm/yarn install. Also invokable via: npx nqui-setup
 *
 * Auto-injects Cursor rules so consumers don't need to remember init-cursor.
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

// Skip in CI to reduce noise
if (process.env.CI === 'true' || process.env.CI === '1') process.exit(0);

function detectPackageManager() {
  const cwd = process.cwd();
  if (existsSync(resolve(cwd, 'pnpm-lock.yaml'))) return 'pnpm';
  if (existsSync(resolve(cwd, 'yarn.lock'))) return 'yarn';
  if (existsSync(resolve(cwd, 'bun.lockb'))) return 'bun';
  return 'npm';
}

function getInstallCmd(pkgs) {
  const pm = detectPackageManager();
  const list = pkgs.join(' ');
  switch (pm) {
    case 'pnpm':
      return `pnpm add ${list}`;
    case 'yarn':
      return `yarn add ${list}`;
    case 'bun':
      return `bun add ${list}`;
    default:
      return `npm install ${list}`;
  }
}

function addNquiInitScript() {
  const cwd = process.cwd();
  const packageJsonPath = resolve(cwd, 'package.json');
  
  if (!existsSync(packageJsonPath)) return false;
  
  try {
    const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    
    // Check if script already exists
    if (pkg.scripts?.['nqui:init']) {
      return false; // Already exists
    }
    
    // Add the script
    pkg.scripts = pkg.scripts || {};
    pkg.scripts['nqui:init'] = 'npx @nqlib/nqui install-peers && npx @nqlib/nqui init-cursor && npx @nqlib/nqui init-skills && npx @nqlib/nqui init-css --sidebar --force';
    
    writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n');
    return true;
  } catch (e) {
    return false;
  }
}

import { FULL_PEER_LIST } from './peer-deps.js';
import { writeCursorRule } from './init-cursor.js';
import { resolveTargetDir } from './resolve-target-dir.js';

const requiredPeers = [];
const recommended = ['tw-animate-css', 'next-themes'];

const installRequired = getInstallCmd(requiredPeers);
const installFull = getInstallCmd(['@nqlib/nqui', ...FULL_PEER_LIST]);
const installRecommended = getInstallCmd(recommended);

// Auto-add nqui:init script to package.json
const scriptAdded = addNquiInitScript();

const msg = `
╔══════════════════════════════════════════════════════════════════╗
║  nqui – Next steps                                           ║
╚══════════════════════════════════════════════════════════════════╝

${scriptAdded ? '✅ Added "nqui:init" script to package.json\n' : ''}Run the full setup:

   npm run nqui:init

Or step by step:

   npx @nqlib/nqui init-css --sidebar      # CSS + sidebar layout
   npx @nqlib/nqui install-peers          # Install dependencies
   npx @nqlib/nqui init-cursor            # Setup Cursor skills

Manual commands:
   - Full peers: npx @nqlib/nqui install-peers
   - Refresh skills: npx @nqlib/nqui init-skills

→ Run "npx nqui-setup" anytime to see this again.
`;
console.log(msg);

// Auto-inject Cursor rules (writes to package that has nqui in monorepos)
const targetDir = resolveTargetDir(process.cwd());
writeCursorRule(targetDir);
console.log(`   Skills written to: ${targetDir}/.cursor/\n`);
