#!/usr/bin/env node
/**
 * Validate all SKILL.md files have required frontmatter (name + description).
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const SKILL_DIRS = [
  join(ROOT, 'skills', 'consumer', 'nqui'),
  join(ROOT, '.agents', 'skills', 'nqui-dev'),
  join(ROOT, '.agents', 'skills', 'nqui-docs'),
];

function findSkillFiles(dir, results = []) {
  if (!statSync(dir, { throwIfNoEntry: false })?.isDirectory()) return results;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      findSkillFiles(full, results);
    } else if (entry === 'SKILL.md') {
      results.push(full);
    }
  }
  return results;
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const block = match[1];
  const name = block.match(/^name:\s*(.+)$/m)?.[1]?.trim();
  const descBlock = block.match(/description:\s*>-?\s*\n((?:  .+\n?)+)/);
  const descLine = block.match(/^description:\s*(.+)$/m);
  let description;
  if (descBlock) {
    description = descBlock[1]
      .split('\n')
      .map((l) => l.replace(/^  /, ''))
      .join(' ')
      .trim();
  } else if (descLine) {
    description = descLine[1].trim();
  }
  return { name, description };
}

let failed = false;

for (const dir of SKILL_DIRS) {
  const files = findSkillFiles(dir);
  if (files.length === 0) {
    console.warn(`⚠️  No SKILL.md in ${dir}`);
    continue;
  }
  for (const file of files) {
    const content = readFileSync(file, 'utf8');
    const fm = parseFrontmatter(content);
    const rel = file.replace(ROOT + '/', '');
    if (!fm?.name) {
      console.error(`❌ ${rel}: missing frontmatter 'name'`);
      failed = true;
    }
    if (!fm?.description) {
      console.error(`❌ ${rel}: missing frontmatter 'description'`);
      failed = true;
    }
    if (fm?.name && fm?.description) {
      console.log(`✅ ${rel}`);
    }
  }
}

if (failed) process.exit(1);
console.log('All skills validated.');
