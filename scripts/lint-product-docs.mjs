#!/usr/bin/env node
/**
 * Lint the product docs layer (docs/product/epics/**).
 *
 * Enforces the invariants that the guideline states but prose can't hold:
 *  - epic/story frontmatter is present, complete, and uses the allowed vocabulary
 *  - IDs are unique across the repo (concurrent branches can mint the same ST-NNN)
 *  - a story's `epic:` matches the folder it lives in, and its `id:` matches its filename
 *  - every story appears in its epic's story table, with the same status
 *  - docs/product/README.md's "Next IDs" counter is ahead of every minted ID
 *
 * Exit 1 on any error. Warnings never fail.
 * See docs/product/agentic-coding-guideline.md §3–§5.
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const PRODUCT = join(ROOT, 'docs/product');
const EPICS = join(PRODUCT, 'epics');

const EPIC_STATUS = ['planned', 'in-progress', 'done'];
const STORY_STATUS = ['backlog', 'ready', 'in-progress', 'review', 'done'];
const PRIORITY = ['must', 'should', 'could'];
const RELEASE_LITERALS = ['pre-baseline', 'unset'];

const errors = [];
const warnings = [];
const err = (file, msg) => errors.push(`${file}: ${msg}`);
const warn = (file, msg) => warnings.push(`${file}: ${msg}`);

/** Minimal frontmatter reader — flat `key: value` pairs only, which is all the template uses. */
function frontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const out = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (kv) out[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

function checkRelease(file, value) {
  if (value === undefined || value === '') return;
  if (RELEASE_LITERALS.includes(value)) return;
  if (/^\d+\.\d+\.\d+$/.test(value)) return;
  err(file, `release: "${value}" is not a version or one of ${RELEASE_LITERALS.join(' / ')}`);
}

const seenIds = new Map(); // id -> file
function claimId(file, id) {
  if (seenIds.has(id)) err(file, `duplicate id ${id} — also in ${seenIds.get(id)}`);
  else seenIds.set(id, file);
}

if (!existsSync(EPICS)) {
  console.error(`No epics directory at ${EPICS}`);
  process.exit(1);
}

const epicDirs = readdirSync(EPICS)
  .filter((d) => d !== '_archive' && statSync(join(EPICS, d)).isDirectory())
  .sort();

let maxEpic = 0;
let maxStory = 0;

for (const dir of epicDirs) {
  const epicFile = join(EPICS, dir, 'epic.md');
  const rel = `docs/product/epics/${dir}/epic.md`;

  if (!/^EP-\d{3}-[a-z0-9-]+$/.test(dir)) {
    err(`docs/product/epics/${dir}`, 'folder must be named EP-NNN-kebab-name');
    continue;
  }
  if (!existsSync(epicFile)) {
    err(rel, 'missing epic.md');
    continue;
  }

  const epicText = readFileSync(epicFile, 'utf8');
  const fm = frontmatter(epicText);
  if (!fm) {
    err(rel, 'missing frontmatter');
    continue;
  }
  for (const key of ['id', 'title', 'status', 'owner']) {
    if (!fm[key]) err(rel, `frontmatter missing ${key}`);
  }
  if (fm.id !== dir.slice(0, 6)) err(rel, `id ${fm.id} does not match folder ${dir}`);
  if (fm.status && !EPIC_STATUS.includes(fm.status)) {
    err(rel, `status "${fm.status}" not in ${EPIC_STATUS.join(' | ')}`);
  }
  if (fm.id) {
    claimId(rel, fm.id);
    maxEpic = Math.max(maxEpic, Number(fm.id.slice(3)));
  }

  // Story table: | ST-NNN | Title | status | release |
  const table = new Map();
  for (const row of epicText.matchAll(/^\|\s*(ST-\d{3})\s*\|([^|]*)\|\s*([a-z-]+)\s*\|/gm)) {
    table.set(row[1], row[3]);
  }

  const storyDir = join(EPICS, dir, 'stories');
  if (!existsSync(storyDir)) {
    if (table.size) err(rel, `story table lists ${table.size} stories but stories/ does not exist`);
    continue;
  }

  const storyFiles = readdirSync(storyDir).filter((f) => f.endsWith('.md')).sort();
  const seenInDir = new Set();

  for (const f of storyFiles) {
    const srel = `docs/product/epics/${dir}/stories/${f}`;
    if (!/^ST-\d{3}-[a-z0-9-]+\.md$/.test(f)) {
      err(srel, 'file must be named ST-NNN-kebab-name.md');
      continue;
    }
    const sfm = frontmatter(readFileSync(join(storyDir, f), 'utf8'));
    if (!sfm) {
      err(srel, 'missing frontmatter');
      continue;
    }
    for (const key of ['id', 'epic', 'title', 'status', 'priority']) {
      if (!sfm[key]) err(srel, `frontmatter missing ${key}`);
    }
    const fileId = basename(f).slice(0, 6);
    if (sfm.id !== fileId) err(srel, `id ${sfm.id} does not match filename`);
    if (sfm.epic !== fm.id) err(srel, `epic: ${sfm.epic} but lives under ${fm.id}`);
    if (sfm.status && !STORY_STATUS.includes(sfm.status)) {
      err(srel, `status "${sfm.status}" not in ${STORY_STATUS.join(' | ')}`);
    }
    if (sfm.priority && !PRIORITY.includes(sfm.priority)) {
      err(srel, `priority "${sfm.priority}" not in ${PRIORITY.join(' | ')}`);
    }
    checkRelease(srel, sfm.release);
    if (sfm.status === 'ready' && !/^- \[[ x]\] /m.test(readFileSync(join(storyDir, f), 'utf8'))) {
      err(srel, 'status ready with no acceptance criteria');
    }
    if (sfm.id) {
      claimId(srel, sfm.id);
      maxStory = Math.max(maxStory, Number(sfm.id.slice(3)));
      seenInDir.add(sfm.id);
      if (!table.has(sfm.id)) err(rel, `story table missing ${sfm.id}`);
      else if (table.get(sfm.id) !== sfm.status) {
        err(rel, `story table says ${sfm.id} is "${table.get(sfm.id)}", story says "${sfm.status}"`);
      }
    }
  }

  for (const id of table.keys()) {
    if (!seenInDir.has(id)) err(rel, `story table lists ${id} but no story file exists`);
  }
}

// Next-ID counter
const readme = join(PRODUCT, 'README.md');
if (existsSync(readme)) {
  const m = readFileSync(readme, 'utf8').match(/Next IDs:\s*`?EP-(\d{3})`?\s*\/\s*`?ST-(\d{3})`?/);
  if (!m) warn('docs/product/README.md', 'no "Next IDs: EP-NNN / ST-NNN" counter found');
  else {
    if (Number(m[1]) <= maxEpic) err('docs/product/README.md', `next epic id EP-${m[1]} is already used`);
    if (Number(m[2]) <= maxStory) err('docs/product/README.md', `next story id ST-${m[2]} is already used`);
  }
}

for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`error ${e}`);

const epicCount = epicDirs.length;
const storyCount = [...seenIds.keys()].filter((id) => id.startsWith('ST-')).length;
if (errors.length) {
  console.error(`\n${errors.length} error(s) across ${epicCount} epics / ${storyCount} stories.`);
  process.exit(1);
}
console.log(`product docs OK — ${epicCount} epics, ${storyCount} stories, next ST-${String(maxStory + 1).padStart(3, '0')}.`);
