---
id: ST-058
epic: EP-007
title: HTTP agent-skill discovery
status: done
priority: should
release: pre-baseline
breaking: false
scope: [public/.well-known/agent-skills, public/llms.txt, scripts/sync-consumer-skills.mjs]
api: public/.well-known/agent-skills/index.json
---

# ST-058 — HTTP agent-skill discovery

As an agent working in a consumer app that has not installed `@nqlib/nqui` yet,
I want to fetch nqui's skill over plain HTTP from a well-known path,
so that I can learn the library's rules without the maintainer pasting anything into my context.

## Acceptance criteria

- [x] `public/.well-known/agent-skills/index.json` lists the skill as
      `{ name, description, path }` — a machine-readable entry point.
- [x] `index.json` is **generated**, never hand-written: `scripts/sync-consumer-skills.mjs` derives
      `name`/`description` from the SOT frontmatter and writes `path` as `<name>/SKILL.md`.
- [x] `public/.well-known/agent-skills/nqui/SKILL.md` is the fetchable skill body.
- [x] `public/.well-known/agent-skills/nqui/references/` mirrors the full `docs/nqui-skills/` bundle
      (guides plus the per-command sub-skill directories), so a fetched skill's links resolve.
- [x] `public/llms.txt` exists as the human/LLM-readable entry alongside the well-known route.
- [x] The published paths documented in `skills/README.md` match what the sync script writes
      (`/.well-known/agent-skills/nqui/SKILL.md`, `/llms.txt`).
- [ ] The routes are live at a public host.

## Technical notes

- `public/` is Vite's static root, so everything here is served verbatim from the site root. The
  bundle is therefore *deployable* today but not *deployed* — `skills/README.md` hedges the section
  as "HTTP (when showcase is deployed)", and `plans/README.md` lists deploying the showcase as an
  open direction option. That is the one unticked criterion; it is a hosting decision, not code.
- Deployment moved to the sibling **nqui-showcase** repo with ST-060. Whoever deploys it must serve
  this repo's `public/.well-known/` tree (or regenerate it there) for the route to resolve — the
  files being correct here does not make them reachable.
- `index.json` currently lists exactly one skill because the SOT is a single `SKILL.md`. The
  generator hard-fails on missing `name`/`description`, so a malformed SOT breaks the build rather
  than publishing an empty index.
- The maintainer skills (`nqui-dev`, `nqui-docs`) are deliberately **not** in the HTTP bundle — they
  are repo-only and out of scope for consumers.

## Out of scope

- Hosting, DNS and CDN for the showcase site — sibling repo.
- Serving component API pages over HTTP; `docs/components/` reaches consumers via the npm tarball.
- Publishing maintainer skills for external discovery.
