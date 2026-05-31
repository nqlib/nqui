#!/usr/bin/env node
/**
 * Install nqui skills for Claude Code / Claude Desktop.
 *
 * Usage: npx @nqlib/nqui init-claude-skills [--force]
 *
 * Copies packages/nqui/docs/nqui-skills/* → ~/.claude/skills/<skill-name>/
 * Hub markdown → ~/.claude/skills/nqui/
 * Component docs → ~/.claude/skills/nqui-components/components/
 */

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { getPackageRoot } from './getPackageRoot.js';

const root = getPackageRoot();
const SKILLS_SOURCE = join(root, 'docs', 'nqui-skills');
const COMPONENTS_SOURCE = join(root, 'docs', 'components');
const CLAUDE_SKILLS = join(homedir(), '.claude', 'skills');

// Root docs that live in the nqui hub directory (~/.claude/skills/nqui/)
const HUB_FILES = [
  'SKILL.md',
  'README.md',
  'HUMAN_GUIDE.md',
  'COMPOSITION.md',
  'COMPONENTS_INDEX.md',
  'READ_BUDGET.md',
  // Apple-craft + production AI skills (v0.6+)
  'RECIPES.md',
  'STATES.md',
  'WRITING.md',
  'MOTION.md',
  'ELEVATION.md',
  'AGENT_PROMPT.md',
  'EVAL.md',
  'THEMING.md',
  'MIGRATION.md',
];

// Slash-command entry points (/design, /edit) — bundled in docs/_claude-commands/
const SLASH_COMMANDS = ['design', 'edit'];

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function isSkillDir(name) {
  const path = join(SKILLS_SOURCE, name);
  return statSync(path).isDirectory() && existsSync(join(path, 'SKILL.md'));
}

function patchHubSkill(destSkillPath) {
  let content = readFileSync(destSkillPath, 'utf8');
  content = content.replace(
    /Installed into `\.cursor\/nqui-skills\/` via `npx @nqlib\/nqui init-skills`\./,
    'Installed into `~/.claude/skills/` via `npx @nqlib/nqui init-claude-skills`.',
  );
  content = content.replace(
    /- `\.cursor\/nqui-skills\/components\/nqui-<name>\.md` \(after init-skills\)/,
    '- `~/.claude/skills/nqui-components/components/nqui-<name>.md`',
  );
  content = content.replace(
    /SSOT: `packages\/nqui\/docs\/nqui-skills\/`/,
    'SSOT: `packages/nqui/docs/nqui-skills/` (repo) · installed: `~/.claude/skills/`',
  );
  writeFileSync(destSkillPath, content);
}

export async function installClaudeSkills({ force = true } = {}) {
  if (!existsSync(SKILLS_SOURCE)) {
    console.error('Source skills not found:', SKILLS_SOURCE);
    process.exit(1);
  }

  ensureDir(CLAUDE_SKILLS);

  const hubDest = join(CLAUDE_SKILLS, 'nqui');
  if (existsSync(hubDest) && !force) {
    console.log('⏭️  ~/.claude/skills/nqui exists. Use --force to overwrite.');
  } else {
    ensureDir(hubDest);
    for (const file of HUB_FILES) {
      const src = join(SKILLS_SOURCE, file);
      if (existsSync(src)) cpSync(src, join(hubDest, file), { force: true });
    }
    patchHubSkill(join(hubDest, 'SKILL.md'));
    console.log('✅ Hub →', hubDest);
  }

  for (const name of readdirSync(SKILLS_SOURCE)) {
    if (!isSkillDir(name)) continue;
    const dest = join(CLAUDE_SKILLS, name);
    if (existsSync(dest) && !force) {
      console.log(`⏭️  ${name} — use --force to overwrite`);
      continue;
    }
    cpSync(join(SKILLS_SOURCE, name), dest, { recursive: true, force: true });
    console.log('✅', name, '→', dest);
  }

  // Per-component docs go in the hub at nqui/components/ (where AGENT_PROMPT.md
  // and READ_BUDGET.md route to). Also keep a copy at nqui-components/components/
  // for backward compatibility with the previous routing.
  if (existsSync(COMPONENTS_SOURCE)) {
    const hubComponentsDest = join(CLAUDE_SKILLS, 'nqui', 'components');
    const legacyComponentsDest = join(CLAUDE_SKILLS, 'nqui-components', 'components');
    if (existsSync(hubComponentsDest) && !force) {
      console.log('⏭️  nqui/components — use --force to overwrite');
    } else {
      ensureDir(join(CLAUDE_SKILLS, 'nqui'));
      cpSync(COMPONENTS_SOURCE, hubComponentsDest, { recursive: true, force: true });
      console.log('✅ Component docs →', hubComponentsDest);
    }
    if (existsSync(join(CLAUDE_SKILLS, 'nqui-components'))) {
      cpSync(COMPONENTS_SOURCE, legacyComponentsDest, { recursive: true, force: true });
    }
  }

  // Slash command entry points — /design and /edit become Claude Code tools
  const slashSrc = join(SKILLS_SOURCE, '_claude-commands');
  if (existsSync(slashSrc)) {
    for (const cmd of SLASH_COMMANDS) {
      const cmdSrc = join(slashSrc, cmd);
      const cmdDest = join(CLAUDE_SKILLS, cmd);
      if (!existsSync(cmdSrc)) continue;
      if (existsSync(cmdDest) && !force) {
        console.log(`⏭️  /${cmd} — use --force to overwrite`);
        continue;
      }
      cpSync(cmdSrc, cmdDest, { recursive: true, force: true });
      console.log(`✅ /${cmd} →`, cmdDest);
    }
  }

  console.log('\n📚 Claude skills installed under ~/.claude/skills/');
  console.log('   Restart Claude Code or Claude Desktop to pick them up.');
  console.log('   Try: /design [a login form]    — build a new screen');
  console.log('        /edit  [the sprint page]  — refine existing UI');
  console.log('   Hub: /nqui · Components: /nqui-components · Tokens: /nqui-design-system');
}

const force = process.argv.includes('--force') || !process.argv.includes('--no-force');
installClaudeSkills({ force }).catch((err) => {
  console.error(err);
  process.exit(1);
});
