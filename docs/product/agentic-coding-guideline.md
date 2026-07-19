# Agentic coding guideline — nqui

How work is specified, tracked and documented in **this repository**, and how agents (Claude Code,
Cursor, Codex) work against it. Docs live with the code; the repo is the single source of truth.

Adapted from the SecoLab product guideline. Two things differ because nqui is a **library, not an
app**:

- The seam isn't an HTTP contract, it's the **public API surface** (`src/entries/*`, exported types,
  `docs/components/*.md`, the consumer skill).
- There's no project board. The **release** is the reporting view: a story carries a `release:` and
  shows up in `CHANGELOG.md` when that version ships.

---

## 1. Core principles

1. **Docs-as-code.** A PR that changes behavior updates its spec in the same PR.
2. **Top-down flow.** Architecture → API surface → epics → stories → code.
3. **Vertical slices.** A story delivers consumer value end-to-end: component + types + exports +
   docs page + skill + tests. Never split "the component" and "its docs" into separate stories.
4. **API-first.** The exported surface and its doc page change before, or with, the implementation —
   never silently after.
5. **Agent-ready context.** Naming and structure exist so an agent finds complete context in one
   place without guessing.

---

## 2. Layout

```
CLAUDE.md                          # root agent index + routing
AGENTS.md                          # skill routing
memory/                            # durable, shared, non-derivable facts (INDEX.md + skills.md)
docs/
  index.md                         # vault index
  architecture/overview.md         # layers, build pipeline, package layout
  components/                      # PUBLIC API docs — the seam
  product/
    README.md                      # epic index + decision ladder  ← start here
    agentic-coding-guideline.md    # this file
    roadmap.md                     # direction, not tracking
    ai-contract.md                 # Definition of Done checklists
    epics/
      EP-00N-kebab-name/
        epic.md
        stories/ST-NNN-kebab-name.md
      _archive/                    # closed epics that stopped being useful as reference
plans/                             # the HOW: phased technical blueprints
skills/consumer/nqui/              # consumer skill SOT (synced outward)
```

Rules:
- One folder per epic; its stories live inside it.
- `docs/product/README.md` is the entry point for *what/why*; `plans/README.md` for *how*.
- Epics that are `done` stay visible while they're still useful as capability documentation; archive
  only when they stop being read.

---

## 3. Naming & IDs

| Item | Format | Example |
|---|---|---|
| Epic ID | `EP-NNN` | `EP-003` |
| Story ID | `ST-NNN` | `ST-014` |
| Epic folder | `EP-NNN-kebab-name/` | `EP-003-drag-and-drop/` |
| Story file | `ST-NNN-kebab-name.md` | `ST-014-sortable-on-pragmatic.md` |
| Branch | `<type>/st-NNN-kebab-name`, or `<type>/ep-NNN-…` when one branch carries several stories — always off `dev`, never off `main` ([`docs/conventions.md`](../conventions.md)) | `feat/st-014-sortable-on-pragmatic` |
| Commit / PR title | conventional + story ref | `feat(dnd): Kanban board primitives (ST-012)` |
| Release commit | `Release X.Y.Z: <summary>` (existing repo style), body lists the shipped `ST-NNN` | |

IDs are **global and never reused** — they are the join key for cross-links, branches, commits and
CHANGELOG entries. The "next ID" counter lives in `docs/product/README.md`; bump it in the same PR
that mints the ID.

`pnpm product:lint` (`scripts/lint-product-docs.mjs`) enforces the mechanical half of this layer:
frontmatter completeness and vocabulary, unique IDs, filename/`id`/folder agreement, every story
present in its epic's table with a matching status, and a next-ID counter that is actually free.

---

## 4. Epic template (`epic.md`)

```markdown
---
id: EP-003
title: Drag & drop
status: in-progress        # planned | in-progress | done
owner: maintainer
---

# EP-003 — Drag & drop

## Goal
What consumer capability this delivers, and for whom (app author? agent? both?).

## Success metrics
- e.g. a Kanban board in a consumer app in <30 lines, no dnd-kit peer needed

## Scope — In
## Scope — Out (explicit)
## Dependencies
## Public API surface
Entries, exports and doc pages this epic owns — the seam it is allowed to change.

## Stories
| ID | Title | Status | Release |
|---|---|---|---|
| ST-012 | DnD primitives | done | 0.8.0 |

## Implementation references
Plans (`plans/*.md`), audits, handoff notes that built it.
```

---

## 5. Story template (`ST-NNN-name.md`)

```markdown
---
id: ST-014
epic: EP-003
title: Sortable rebuilt on Pragmatic DnD
status: ready              # backlog | ready | in-progress | review | done
priority: must             # must | should | could
release: 0.9.0             # target version; the CHANGELOG join key
breaking: true             # does it change or remove a public export?
scope: [src/components/dnd, src/entries/dnd.ts, docs, skills, tests]
api: docs/components/nqui-dnd.md
---

# ST-014 — Sortable rebuilt on Pragmatic DnD

As an app author using `@nqlib/nqui/sortable`,
I want reordering built on Pragmatic DnD,
so that I don't install dnd-kit peers for a single widget.

## Acceptance criteria
- [ ] `./sortable` exports the same public props as 0.7.x (or the break is listed below)
- [ ] dnd-kit no longer appears in `peerDependencies`
- [ ] `docs/components/nqui-sortable.md` matches the shipped props
- [ ] Consumer skill regenerated (`sync:skills` + `skill:validate`)
- [ ] Smoke test covers drag, drop, and keyboard reorder
- [ ] `pnpm size` shows no unexplained gzip increase

## Technical notes
Edge cases, constraints, links to the plan that designs it.

## Breaking changes
Only when `breaking: true` — old export → new export, and the migration line for CHANGELOG.

## Out of scope

## Bugs
- YYYY-MM-DD — <symptom> — fixed in <PR/commit>   (append-only; never delete lines)
```

Rules:
- **No acceptance criteria = not `ready`.**
- Frontmatter keys are machine-read — keep them exactly as above.
- `api` links the doc page(s) that define the surface this story touches; omit only for internal work
  with no public surface.
- `breaking: true` requires a **Breaking changes** section and a major/minor bump decision in the
  epic.
- Agents tick criteria as they go and set `status: review` — **never `done`**. A human closes stories.

---

## 6. The seam — public API surface

nqui's equivalent of an API contract:

| Layer | File(s) | Rule |
|---|---|---|
| Exports | `src/index.ts`, `src/entries/*.ts` | Adding/removing an export is a story-level change, never incidental |
| Peers | `package.json` `peerDependencies` / `peerDependenciesMeta` | An optional peer must never be imported from the main entry |
| Docs | `docs/components/nqui-<name>.md` + `docs/components/README.md` row | Must match the shipped props |
| Agent-facing | `skills/consumer/nqui/` (SOT) → synced copies | Edit the SOT only; run `sync:skills` in the same PR |

Change the surface **in the same PR** as the implementation. A doc page that disagrees with the
source is a bug, not drift to fix later.

---

## 7. Workflow

1. **Plan** — write/refine the epic and its stories.
2. **Ready check** — template complete, acceptance criteria written, dependencies unblocked →
   `status: ready`.
3. **Assign to an agent** — *"Implement ST-014. Read the story and its `api` doc first, then propose
   a plan before coding."*
4. **Implement** — branch per §3, tick criteria, set `status: review`.
5. **Review** — a human reviews code **and** spec together, then sets `status: done` and updates the
   epic's story table.
6. **Release** — the version that ships the story records it in `CHANGELOG.md` (§9).
7. **Epic closes** — all stories done → epic `status: done`.

**Blueprint discipline:** if implementation shows the design is wrong, stop, change the story/plan/
API doc, then continue. Code never silently diverges from spec.

---

## 8. Intake — work that arrives without a story

**New capability:**

1. Search `docs/product/epics/**/stories/ST-*.md` for a story that covers it.
2. Found → normal workflow.
3. Not found → ask the maintainer: *"does this belong to an existing epic?"*
   - Story-sized → write the story first (next `ST` ID), confirm acceptance criteria, then implement.
     Story + code ship in the same PR.
   - Epic-sized → break it down *with* the maintainer (`epic.md` + stories at `backlog`/`ready`),
     then implement only the first story.
4. **No public API change lands without a trace in `docs/product/`.**

**Decision ladder — what needs a story:**

| Work | Needs a story? |
|---|---|
| New component, or new export from any entry | **yes** |
| Prop added/renamed/removed on a shipped component | **yes** |
| Peer dependency added, removed, or made optional | **yes** |
| Build/publish/CI change that consumers can observe | **yes** |
| Bug fix restoring documented behavior | no — log under the owning story's `## Bugs` |
| Docs typo, internal refactor, lint fix, test added | no |

**Bug fix:** a bug is a violated acceptance criterion.
1. Identify the owning story; if ambiguous, propose the best match and ask.
2. Log `- YYYY-MM-DD — <symptom> — fixed in <PR/commit>` under its `## Bugs`.
3. Fix + doc line ship in the **same PR**. A bug that reopens a `done` story flips it back to
   `in-progress` (and its epic table row).
4. If the "bug" is a *missing* behavior, that's a new story.

---

## 9. Release = the reporting view

There is no external board. Reporting happens through versions:

- Each story carries `release: X.Y.Z` (its target; correct it if it slips).
- When a version ships, its `CHANGELOG.md` section lists the stories it closed, e.g.
  `- Kanban board primitives on Pragmatic DnD (ST-012, ST-013)`.
- `breaking: true` stories decide the bump: any breaking public-surface change → minor bump while
  pre-1.0, major after 1.0, and it gets a **Migration** line in the CHANGELOG.
- `docs/product/README.md`'s epic index is the "board"; `roadmap.md` states direction and links to
  the epics that carry it — it does not duplicate their status.

---

## 10. Definition of Ready / Done

**Ready:** template complete • acceptance criteria written • `api` identified • dependencies
unblocked.

**Done:** all criteria checked • `docs/product/ai-contract.md` checklist passes • docs page and
consumer skill match the source • tests and build green • epic table and CHANGELOG updated • a human
set the status.

---

## 11. Do / Don't

| Do | Don't |
|---|---|
| Ship spec + code in one PR | Let a doc page drift from the source |
| Split stories by capability | Split "component" and "its docs" into separate stories |
| Change the export surface deliberately, in a story | Add an export because something needed it |
| Record decisions in `memory/` (rarely) | Track work status in `memory/` — that's a story |
| Let agents set `review` | Let agents set `done` |
