#!/usr/bin/env node
/**
 * Sync consumer skill SOT to agent install dirs and HTTP discovery paths.
 *
 * SOT: skills/consumer/nqui/
 * Targets:
 *   .agents/skills/nqui/
 *   public/.well-known/agent-skills/nqui/
 *   docs/nqui-skills/SKILL.md (hub entry only — npm tarball)
 *   public/.well-known/agent-skills/index.json
 */

import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  cpSync,
  readdirSync,
  statSync,
} from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SOT_DIR = join(ROOT, 'skills', 'consumer', 'nqui');
const SOT_SKILL = join(SOT_DIR, 'SKILL.md');
const NQUI_SKILLS_DIR = join(ROOT, 'docs', 'nqui-skills');
const AGENTS_DEST = join(ROOT, '.agents', 'skills', 'nqui');
const HTTP_DEST = join(ROOT, 'public', '.well-known', 'agent-skills', 'nqui');
const INDEX_PATH = join(ROOT, 'public', '.well-known', 'agent-skills', 'index.json');
const NPM_HUB = join(NQUI_SKILLS_DIR, 'SKILL.md');

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const fm = {};
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.+)$/);
    if (kv) fm[kv[1]] = kv[2].replace(/^["']|["']$/g, '');
    const desc = line.match(/^description:\s*>?-?\s*$/);
    if (desc) {
      // multiline description — read until next key
    }
  }
  // Better YAML-lite parse for name + description
  const nameMatch = match[1].match(/^name:\s*(.+)$/m);
  const descBlock = match[1].match(/description:\s*>-?\s*\n((?:  .+\n?)+)/);
  const descLine = match[1].match(/^description:\s*(.+)$/m);
  fm.name = nameMatch?.[1]?.trim();
  if (descBlock) {
    fm.description = descBlock[1]
      .split('\n')
      .map((l) => l.replace(/^  /, ''))
      .join(' ')
      .trim();
  } else if (descLine) {
    fm.description = descLine[1].trim();
  }
  return fm;
}

function copyDir(src, dest, { exclude = [] } = {}) {
  ensureDir(dest);
  for (const entry of readdirSync(src)) {
    if (exclude.includes(entry)) continue;
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    if (statSync(srcPath).isDirectory()) {
      cpSync(srcPath, destPath, { recursive: true, force: true });
    } else {
      cpSync(srcPath, destPath, { force: true });
    }
  }
}

function syncConsumerSkill() {
  if (!existsSync(SOT_SKILL)) {
    console.error('❌ Consumer SOT not found:', SOT_SKILL);
    process.exit(1);
  }

  // 1. .agents/skills/nqui/ — consumer skill + full nqui-skills bundle as references
  ensureDir(AGENTS_DEST);
  cpSync(SOT_SKILL, join(AGENTS_DEST, 'SKILL.md'), { force: true });
  const refsDest = join(AGENTS_DEST, 'references');
  if (existsSync(NQUI_SKILLS_DIR)) {
    copyDir(NQUI_SKILLS_DIR, refsDest, { exclude: ['SKILL.md'] });
  }
  console.log('✅ Synced →', AGENTS_DEST);

  // 2. public/.well-known/agent-skills/nqui/
  ensureDir(HTTP_DEST);
  cpSync(SOT_SKILL, join(HTTP_DEST, 'SKILL.md'), { force: true });
  const httpRefs = join(HTTP_DEST, 'references');
  if (existsSync(NQUI_SKILLS_DIR)) {
    copyDir(NQUI_SKILLS_DIR, httpRefs, { exclude: ['SKILL.md'] });
  }
  console.log('✅ Synced →', HTTP_DEST);

  // 3. docs/nqui-skills/SKILL.md — update frontmatter from SOT, preserve extended hub body
  if (existsSync(NPM_HUB)) {
    const sotContent = readFileSync(SOT_SKILL, 'utf8');
    const existingHub = readFileSync(NPM_HUB, 'utf8');
    const sotFm = sotContent.match(/^---\r?\n[\s\S]*?\r?\n---/);
    const hubBody = existingHub.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
    if (sotFm) {
      writeFileSync(NPM_HUB, sotFm[0] + '\n\n' + hubBody.replace(/^\n+/, ''), 'utf8');
      console.log('✅ Updated npm hub frontmatter →', NPM_HUB);
    }
  }

  // 4. Generate index.json
  const fm = parseFrontmatter(readFileSync(SOT_SKILL, 'utf8'));
  if (!fm?.name || !fm?.description) {
    console.error('❌ SOT SKILL.md missing name or description in frontmatter');
    process.exit(1);
  }
  const index = {
    skills: [
      {
        name: fm.name,
        description: fm.description,
        path: `${fm.name}/SKILL.md`,
      },
    ],
  };
  ensureDir(dirname(INDEX_PATH));
  writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2) + '\n', 'utf8');
  console.log('✅ Generated →', INDEX_PATH);
}

syncConsumerSkill();
