---
id: ST-063
epic: EP-007
title: Product docs layer — epics, stories, memory
status: in-progress
priority: must
release: unset
breaking: false
scope: [docs/product, memory, CLAUDE.md, AGENTS.md, CONTRIBUTING.md, docs/index.md, plans/README.md]
api: docs/product/agentic-coding-guideline.md
---

# ST-063 — Product docs layer: epics, stories, memory

As a maintainer directing agents on this library,
I want a `docs/product/` layer that specifies work as epics and stories, plus a repo-local `memory/`
for durable facts,
so that an agent finds complete context in one place and no public API change lands without a trace.

## Acceptance criteria

- [x] `docs/product/agentic-coding-guideline.md` defines principles, layout, IDs, the epic and story
      templates, the seam, workflow, intake, the release reporting view, and DoR/DoD.
- [x] `docs/product/README.md` is the entry point: epic index, the **Next IDs** counter
      (`EP-008` / `ST-064`), the status vocabulary including the `pre-baseline` and `unset` `release`
      literals, the decision ladder, and the ID-collision rule.
- [x] One folder per epic under `docs/product/epics/EP-NNN-kebab-name/` with `epic.md` and
      `stories/ST-NNN-kebab-name.md` — EP-001…EP-007 exist and every epic has stories.
- [x] `memory/` holds the write-policy (`skills.md`) and a one-line-per-entry `INDEX.md`, with the
      rule that memory never tracks work status — that is a story.
- [x] `CLAUDE.md` routes to all of it: `docs/product/README.md` + guideline for product work,
      `plans/README.md` for technical plans, `memory/INDEX.md` for recall, `ai-contract.md` for DoD.
- [x] `CLAUDE.md` carries the operating rules an agent needs without loading the guideline: read the
      story and its `api:` page first, tick criteria, set `review` and **never** `done`, run intake
      for work with no story, ship docs in the same PR.
- [x] Two deliberate divergences from the SecoLab source are stated in the guideline's preamble.
- [x] `CONTRIBUTING.md` opens with the story gate (find the work's home before coding) and its PR
      checklist covers the story update, `product:lint`, and branching off `dev`; the glued item at
      line 11 is fixed.
- [x] `AGENTS.md` routes to the product layer and to `memory/INDEX.md`.
- [x] `docs/index.md` lists the product layer, the working guideline, git conventions and memory in
      *Start here*, and its `product/` row describes epics and stories.
- [x] `scripts/lint-product-docs.mjs` (`pnpm product:lint`) enforces unique IDs, frontmatter
      vocabulary, filename/`id`/folder agreement, epic-table/story status agreement, and a free
      ID counter.
- [x] `docs/conventions.md` defines the git topology this layer assumes: story branches off `dev`,
      squash-merge into `dev`, release `dev` → `main` + tag, hotfix back-merge.
- [ ] `plans/README.md` is reconciled with the guideline's *what/why* vs *how* split and its status
      table brought current (owned by ST-062).
- [ ] `CHANGELOG.md` records shipped `ST-NNN` ids, closing the loop the release reporting view
      depends on.

## Technical notes

- Adapted from the sibling **SecoLab** repo's `docs/product/agentic-coding-guideline.md`. Two
  divergences are deliberate and stated up front, because they change what "the contract" and "the
  board" mean here:
  1. **The seam is the public API surface**, not an HTTP contract — `src/index.ts`, `src/entries/*`,
     `peerDependencies`, `docs/components/nqui-<name>.md`, and the consumer skill SOT.
  2. **Releases plus `CHANGELOG.md` replace the Monday board** — a story carries `release:` and is
     named in the CHANGELOG section for that version. There is no external tracker to sync.
- EP-001…007 were written **retrospectively** from shipped source, releases 0.6.3→0.7.3, the five
  audit plans and `internal-notes/`. Every epic is `in-progress` because each has both shipped
  stories and a real open gap. `release: pre-baseline` marks work that shipped before the 0.7.x
  record, where the exact version is not reconstructable.
- The unticked criteria are all *reach* — the layer exists and is routed from `CLAUDE.md`, but the
  human-facing entry points (`CONTRIBUTING.md`, `AGENTS.md`, `docs/index.md`) and the release loop
  (`CHANGELOG.md` ids) have not caught up. That is why this story is `in-progress`.
- The ID counter in `docs/product/README.md` is the only allocator; concurrent branches can mint the
  same `ST-NNN`, so check it before merging (first merged keeps the number).

## Out of scope

- Migrating `internal-notes/` into the vault — ST-062 (this story only defines where things land).
- Restructuring `plans/`; the guideline keeps it as the *how* layer alongside `docs/product/`.
- Any external project board, issue tracker or automation that reads this frontmatter.
