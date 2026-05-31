/**
 * Skill templates injected by init-cursor into consumer projects.
 * SSOT: packages/nqui/docs/.agents/skills/ (used by download-skills.js)
 *
 * These functions are kept for init-cursor to write .mdc rules.
 * The skill content itself is read from the SSOT by download-skills.
 */

import { readFileSync, existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { FULL_PEER_LIST } from './peer-deps.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Full body for `.cursor/rules/nqui-components.mdc` (shipped next to this file in the npm package).
 */
export function buildCursorRule() {
  const shipped = resolve(__dirname, 'cursor-rule-nqui-components.mdc');
  if (existsSync(shipped)) {
    return readFileSync(shipped, 'utf8');
  }
  const monorepo = resolve(__dirname, '../.cursor/rules/nqui-components.mdc');
  if (existsSync(monorepo)) {
    return readFileSync(monorepo, 'utf8');
  }
  throw new Error(
    'nqui: missing cursor rule template. Expected cursor-rule-nqui-components.mdc next to skill-templates.js'
  );
}

const fullInstallCmd = `pnpm add @nqlib/nqui ${FULL_PEER_LIST.join(' ')}`;
const npmInstallCmd = `npm install @nqlib/nqui ${FULL_PEER_LIST.join(' ')}`;

export function buildInstallSkill() {
  return `---
name: nqui-install
description: Install and setup nqui. Use when user wants to install nqui, set up project, fix missing peers, or run setup commands. Execute these commands in the project root.
---

# nqui Install & Setup

**When to load:** User asks to install nqui, set up a new project, fix "module not found" or missing peer deps, or run setup.

**Action:** Execute the relevant command(s) below in the project root. Run in sequence when doing full setup.

## 1. Install nqui + peers

**Minimal (icons only):**
\`\`\`bash
pnpm add @nqlib/nqui
\`\`\`
(npm: \`npm install @nqlib/nqui\`)

**Full (all optional components):**
\`\`\`bash
npx @nqlib/nqui install-peers
\`\`\`
Or manually:
\`\`\`bash
${fullInstallCmd}
\`\`\`
(npm: \`${npmInstallCmd}\`)

## 2. Setup CSS (required)

\`\`\`bash
npx @nqlib/nqui init-css
\`\`\`

Then add to main CSS (app/globals.css or src/index.css): \`@import "@nqlib/nqui/styles";\`
Or copy contents of \`nqui/nqui-setup.css\` to top of main CSS.

## 3. Refresh Cursor rules (optional)

\`\`\`bash
npx @nqlib/nqui init-cursor
\`\`\`

## File locations

- Docs: \`node_modules/@nqlib/nqui/docs/components/README.md\` (index) and \`node_modules/@nqlib/nqui/docs/components/nqui-<name>.md\` (per component)
- Skills (after init-skills): \`.cursor/nqui-skills/SKILL.md\` — hub
- Check setup: \`npx nqui-setup\`
`;
}

export function buildComponentsSkill() {
  return `---
name: nqui-components
description: Component implementation for nqui. Use when building UI with @nqlib/nqui, choosing components, or implementing a specific component. Always read from docs path before implementing.
---

# nqui Components

**When to load:** User asks about nqui components, which component to use, how to implement X, or builds UI with nqui.

**Action:** Read from the docs path before implementing. Do not guess – the docs have exact import, props, and examples.

## Prefer local copy (after \`npx @nqlib/nqui init-skills\`)

Token-efficient order:

1. \`.cursor/nqui-skills/HUMAN_GUIDE.md\` — task → docs (forms, toolbar, empty state, …)
2. \`.cursor/nqui-skills/COMPONENTS_INDEX.md\` — which single \`nqui-*.md\` to open
3. \`.cursor/nqui-skills/components/nqui-<kebab>.md\` — **one** component at a time
4. \`.cursor/nqui-skills/components/README.md\` — full index (large; use sections only)

## Fallback (npm only, or before init-skills)

\`\`\`
node_modules/@nqlib/nqui/docs/components/
\`\`\`

## File resolution

| User asks | File to read |
|-----------|--------------|
| Which doc file for component X | \`.cursor/nqui-skills/COMPONENTS_INDEX.md\` (after init-skills) or \`node_modules/@nqlib/nqui/docs/components/\` + \`nqui-<kebab>.md\` |
| Component index, use cases, which component for X | \`README.md\` in the paths above (skim sections) |
| How to use Button | \`nqui-button.md\` (same folder) |
| How to use ToggleGroup | \`nqui-toggle-group.md\` |
| Any component X | \`nqui-<kebab-name>.md\` (e.g. nqui-data-table.md) |

**Rule:** Open **one** per-component doc unless you need cross-component context. For any component question, read the doc first — import, variants, props, and examples.

## Quick rules (details in README.md)

- **Toolbar/inline selection** → ToggleGroup (never RadioGroup)
- **Form context** → RadioGroup, Checkbox
- **Actions** → Button, ButtonGroup
- **Context-first:** Place controls in realistic layout (toolbar, chart settings), not floating alone

## Import

\`\`\`tsx
import { Button, ToggleGroup, ToggleGroupItem } from "@nqlib/nqui"
\`\`\`

CSS: \`@import "@nqlib/nqui/styles"\` in main CSS (run \`npx @nqlib/nqui init-css\` first).
`;
}
