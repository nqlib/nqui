#!/usr/bin/env node

/**
 * Installs @nqlib/nqui + all required and optional peer dependencies.
 * Use when you want full library support (Sortable, Carousel, DataTable, etc.).
 *
 * Usage: npx @nqlib/nqui install-peers
 */

import { existsSync } from 'fs';
import { resolve } from 'path';
import { execSync } from 'child_process';
import { FULL_PEER_LIST } from './peer-deps.js';

const cwd = process.cwd();

function detectPackageManager() {
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

const pkgs = ['@nqlib/nqui', ...FULL_PEER_LIST];
const cmd = getInstallCmd(pkgs);

console.log(`\nInstalling nqui + all peer dependencies...\n  ${cmd}\n`);
execSync(cmd, { stdio: 'inherit', cwd });
