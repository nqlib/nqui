# LLM and agent usage

## Audience split

| Audience | Resource | Must NOT use for |
|----------|----------|------------------|
| External app teams | `skills/consumer/nqui/` | Repo internals, publish pipeline |
| Library maintainers | `.agents/skills/nqui-dev/` | External app integration |
| Docs maintainers | `.agents/skills/nqui-docs/` | External app integration |

## How consumers get skills

| Path | Command / location |
|------|------------------|
| npm + CLI | `npx @nqlib/nqui init-skills` → `.cursor/nqui-skills/` |
| Skills CLI | `npx skills add nqlib/nqui --skill nqui -y` → `.agents/skills/nqui/` |
| HTTP (deployed showcase) | `/.well-known/agent-skills/nqui/SKILL.md` |

## Token discipline

Consumer agents should read **1–3 files** per task:

1. `HUMAN_GUIDE.md` — task → doc routing
2. `COMPONENTS_INDEX.md` — pick one `nqui-*.md`
3. One `components/nqui-<name>.md`

Do not bulk-read the full skills folder (~5000 lines).

## HTTP agent discovery

Synced on `npm run sync:skills`:

- `public/.well-known/agent-skills/index.json`
- `public/.well-known/agent-skills/nqui/SKILL.md` + references
- `public/llms.txt`

See [`skills/README.md`](../../skills/README.md) for install commands.
