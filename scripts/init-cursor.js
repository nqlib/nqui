#!/usr/bin/env node

/**
 * Injects nqui Cursor/IDE rules so AI assistants have instructions
 * for building components correctly with @nqlib/nqui.
 *
 * Usage: npx nqui init-cursor
 *
 * SSOT for skills: packages/nqui/docs/nqui-skills/
 * This script writes .cursor/rules/nqui-components.mdc (static rule file)
 * and delegates skill copying to download-skills.js (copies from SSOT).
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { resolve, dirname, relative } from 'path';
import { fileURLToPath } from 'url';
import { FULL_PEER_LIST } from './peer-deps.js';
import { buildCursorRule } from './skill-templates.js';
import { resolveTargetDir } from './resolve-target-dir.js';
import { downloadSkills } from './download-skills.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cwd = process.cwd();

export function writeCursorRule(targetCwd) {
  const cursorDir = resolve(targetCwd, '.cursor');
  const rulesDir = resolve(cursorDir, 'rules');

  if (!existsSync(cursorDir)) mkdirSync(cursorDir, { recursive: true });
  if (!existsSync(rulesDir)) mkdirSync(rulesDir, { recursive: true });

  writeFileSync(resolve(rulesDir, 'nqui-components.mdc'), buildCursorRule(), 'utf8');
}

function main() {
  const targetDir = resolveTargetDir(cwd);
  const nquiPath = resolve(targetDir, 'node_modules/@nqlib/nqui');
  const inMonorepo = existsSync(resolve(__dirname, '../docs/components/README.md'));
  if (!existsSync(nquiPath) && !inMonorepo) {
    console.warn('⚠️  @nqlib/nqui not found in node_modules. Rule created; install nqui for full docs path.');
  }

  const displayPath = targetDir === cwd ? '.' : relative(cwd, targetDir) || '.';

  console.log('\n📁 Installing Cursor rules...');
  writeCursorRule(targetDir);

  console.log('\n📚 Installing nqui + impeccable skills from SSOT...');
  downloadSkills({ force: false });

  console.log(`
✅ Cursor rules + skills installed

   ${displayPath}/.cursor/rules/nqui-components.mdc
   ${displayPath}/.cursor/nqui-skills/   ← all nqui + impeccable skills

   Open this folder in Cursor for skills to take effect.
   Per-component docs: .cursor/nqui-skills/components/ (after init-skills)
   or node_modules/@nqlib/nqui/docs/components/
`);
}

const isMain = process.argv[1]?.includes('init-cursor');
if (isMain) main();
