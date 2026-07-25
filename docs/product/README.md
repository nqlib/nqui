# Product layer — epics & stories

The backlog and the capability record for `@nqlib/nqui`, following
[`agentic-coding-guideline.md`](agentic-coding-guideline.md): one folder per epic
(`EP-NNN-kebab-name/epic.md` + `stories/ST-NNN-*.md`), IDs global and never reused.

**Start here** for *what and why*. For *how* (phased technical blueprints) see
[`plans/README.md`](../../plans/README.md). For the shipped Definition of Done see
[`ai-contract.md`](ai-contract.md).

## Epic index

| ID | Epic | Status |
|---|---|---|
| [EP-001](epics/EP-001-design-tokens-theming/epic.md) | Design tokens & theming | **in-progress** |
| [EP-002](epics/EP-002-core-component-surface/epic.md) | Core component surface | **in-progress** |
| [EP-003](epics/EP-003-layout-scroll-app-shell/epic.md) | Layout, scroll & app shell | **in-progress** |
| [EP-004](epics/EP-004-drag-and-drop/epic.md) | Drag & drop | **in-progress** |
| [EP-005](epics/EP-005-packaging-entries-publishing/epic.md) | Packaging, entries & publishing | **in-progress** |
| [EP-006](epics/EP-006-quality-baseline/epic.md) | Quality baseline | **in-progress** |
| [EP-007](epics/EP-007-docs-vault-agent-skills/epic.md) | Docs vault & agent skills | **in-progress** |

**Next IDs: `EP-008` / `ST-065`.** Bump this counter in the same PR that mints an ID.

## About this baseline (2026-07-19)

EP-001…007 were written **retrospectively** from the shipped source, the release history
(0.6.3 → 0.7.3), the five audit plans in `plans/`, and `internal-notes/` — they are the library's
capability record as much as its backlog. That is why every epic is `in-progress`: each has shipped
stories *and* a real open gap.

Done epics stay visible here (rather than moving to `epics/_archive/`) while they still double as
capability documentation. New work follows the guideline normally: story written first → `ready` →
implemented → `review` → a human sets `done`.

## Status vocabulary

**Epic:** `planned` · `in-progress` · `done`
**Story:** `backlog` · `ready` · `in-progress` · `review` · `done` — an agent may set `review`,
never `done`.

`release:` is the target version and the CHANGELOG join key. Two literals are allowed beyond a
version number:

- `pre-baseline` — shipped before the 0.7.x record; the exact version isn't reconstructable.
- `unset` — no target version chosen yet.

## The decision ladder — what needs a story

| Work | Story? |
|---|---|
| New component, or new export from any entry | **yes** |
| Prop added, renamed or removed on a shipped component | **yes** |
| Peer dependency added, removed, or made optional | **yes** |
| Build / publish / CI change a consumer can observe | **yes** |
| Bug fix restoring documented behavior | no — a dated line under the owning story's `## Bugs` |
| Docs typo, internal refactor, lint fix, added test | no |

Work with no home yet: see the guideline [§8 Intake](agentic-coding-guideline.md#8-intake--work-that-arrives-without-a-story).

## Reporting view — releases, not a board

There is no external project board. A story carries `release: X.Y.Z`; when that version ships, its
`CHANGELOG.md` section names the stories it closed (`- Kanban board primitives (ST-031)`). Breaking
stories (`breaking: true`) drive the version bump and get a **Migration** line.

[`roadmap.md`](roadmap.md) states direction and points at the epics that carry it — it does not
duplicate their status.

## Guarding IDs

IDs come from the counter above, so two concurrent branches can mint the same `ST-NNN`. Check the
counter is still free before merging. On a collision: **first merged keeps the number, the later
story renumbers** (file name, frontmatter `id`, the epic's story table, this counter). IDs are never
reused.
