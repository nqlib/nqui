# nqui Agent Skills

## Audience

| Skill | Who | Install |
|-------|-----|---------|
| **nqui** (consumer) | Teams using `@nqlib/nqui` in their app | See below |
| **nqui-dev** | Maintainers changing library source / build | Already in repo: `.agents/skills/nqui-dev/` |
| **nqui-docs** | Maintainers changing component docs / showcase | Already in repo: `.agents/skills/nqui-docs/` |

**Rule:** Consumer and maintainer skills never overlap scope.

## Consumer skill install

### npm package + CLI (recommended)

```bash
npm install @nqlib/nqui
npx @nqlib/nqui init-skills        # → .cursor/nqui-skills/ + AGENTS.md
npx @nqlib/nqui init-claude-skills # → ~/.claude/skills/
```

### Skills CLI (GitHub)

```bash
npx skills add nqlib/nqui --skill nqui -y
```

Installs from `.agents/skills/nqui/` (synced from SOT on build).

### HTTP (when showcase is deployed)

```
https://<host>/.well-known/agent-skills/nqui/SKILL.md
https://<host>/llms.txt
```

## Source of truth

Edit **only** `skills/consumer/nqui/`. Sync copies to:

1. `.agents/skills/nqui/` — skills CLI / local agents
2. `public/.well-known/agent-skills/nqui/` — HTTP static bundle
3. `docs/nqui-skills/SKILL.md` — npm tarball hub (frontmatter synced; extended body preserved)

Detailed sub-skills (nqui-components, impeccable, etc.) remain in `docs/nqui-skills/` until migrated.

## Maintainer sync

```bash
npm run sync:skills    # copy SOT → agent dirs + HTTP
npm run skill:validate # verify SKILL.md frontmatter
```

Wired into `npm run build`.
