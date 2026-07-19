---
id: ST-062
epic: EP-007
title: Migrate internal-notes/ into the vault
status: ready
priority: should
release: unset
breaking: false
scope: [internal-notes, docs, docs/components, docs/nqui-skills, plans/README.md, CONTRIBUTING.md, Makefile, docs/index.md]
api: docs/components/README.md
---

# ST-062 — Migrate `internal-notes/` into the vault

As a maintainer or agent looking for why something in nqui is the way it is,
I want every durable note to live under `docs/` with the rest of the vault,
so that `docs/index.md` is the only index I have to read and stale scratch files stop being cited as
if they were current.

## Acceptance criteria

- [ ] Every file in `internal-notes/` has a disposition applied per the table below — moved,
      merged, or deleted; nothing is left "to triage".
- [ ] Every moved file is linked from `docs/index.md` or from the doc that supersedes it.
- [ ] Inbound references are updated in the same PR: `Makefile:26`, `CONTRIBUTING.md` "Publishing",
      `docs/index.md` "Related", and `EP-007 epic.md`'s implementation reference to
      `SKILLS-ARCHITECTURE.md`.
- [ ] `internal-notes/INSTALLATION.md` is deleted — the root `INSTALLATION.md` is the one that ships
      (`package.json` `files`), and two copies guarantee the unshipped one goes stale.
- [ ] `internal-notes/progress.md` is reconciled into `docs/components/nqui-progress.md` (ST-056)
      and removed.
- [ ] `internal-notes/PEER_DEPENDENCIES.md` is re-verified against the 0.7.x
      `peerDependencies`/`peerDependenciesMeta` before it is moved, or moved with a dated
      "verified against" line.
- [ ] `plans/README.md`'s status table is reconciled with what actually shipped — it is written
      against commit `6e2f8cb` (2026-06-10) and still marks plans 001–005 `TODO` although 0.7.0
      shipped "dependency hygiene, subpath entries, and publish hardening".
- [ ] `internal-notes/` is either empty and deleted, or contains only `dnd-rebase-handoff.md` with a
      one-line README saying it is a live handoff owned by EP-004.
- [ ] `docs/index.md`'s "Related" row no longer describes `internal-notes/` as "legacy maintainer
      notes (migrate into vault over time)".

## Disposition

| File | Class | Disposition |
|---|---|---|
| `dnd-rebase-handoff.md` | active handoff | **Keep in place** until EP-004 lands, then fold into the story's Technical notes and delete |
| `PUBLISHING.md` | active runbook | Move to `docs/meta/` and reconcile with the existing `docs/meta/publishing.md`; update `Makefile:26` and `CONTRIBUTING.md` |
| `SKILLS-ARCHITECTURE.md` | completed record | Move to `docs/architecture/`; it is EP-007's rationale (LLM-native skills over a docs site) and the epic already cites it |
| `APP_BUILDER_PACKAGE.md` | completed record | Move to `docs/architecture/` |
| `BUILD_VERIFICATION.md` | completed record | Move to `docs/architecture/` beside `overview.md` (build pipeline) |
| `DASHBOARD_LAYOUT_DESIGN.md` | completed record | Move to `docs/architecture/`; large, EP-003 background |
| `FROSTED_GLASS_FIX.md` | completed record | Move to `docs/architecture/`; cross-link `docs/components/nqui-frosted-glass.md` |
| `PEER_DEPENDENCIES.md` | completed record, unverified | Re-verify against 0.7.x, then move to `docs/architecture/` |
| `layoutdesign.md` | overlapping record | Merge the still-true parts into `docs/nqui-skills/ELEVATION.md`, then delete |
| `progress.md` | misfiled | Merge into `docs/components/nqui-progress.md` (ST-056), then delete |
| `stacked-avatar-implementation.md` | misfiled | Fold the pattern into `docs/nqui-skills/RECIPES.md`, then delete |
| `temp.md` | stale junk | Delete — a pasted pnpm peer-warning tree against 0.6.0 |
| `landing-demo.html` | stale junk | Delete — untracked 53 KB demo page, superseded by the sibling showcase |
| `INSTALLATION.md` | stale duplicate | Delete — duplicates the root `INSTALLATION.md` that ships in the tarball |

## Technical notes

- Classify before moving. The failure mode here is a bulk `git mv` that carries stale content into
  the vault, where it looks authoritative — `temp.md` and `internal-notes/INSTALLATION.md` are
  exactly that risk.
- `internal-notes/` is not in `package.json` `files`, so nothing here ships. The one exception in
  spirit is `INSTALLATION.md`, whose *root* twin does ship — which is why the unshipped copy must go
  rather than be moved.
- `PUBLISHING.md` is the only file with a live inbound reference from tooling (`Makefile:26`), so
  it must be moved and re-pointed in one commit or `make` prints a dead path.
- The `plans/README.md` reconciliation belongs here rather than in a plans story: the whole point of
  the migration is that no maintainer-facing index is a release behind reality. `plans/` stays where
  it is — the guideline keeps `docs/product/` for *what/why* and `plans/` for *how*.
- Some of these notes are the retrospective evidence EP-001…007 were written from. Move them; do not
  summarize and delete, or the epics lose their sources.

## Out of scope

- Writing the missing component pages — ST-056.
- Deleting stale component pages — ST-061.
- Rewriting the moved documents' content beyond the merges named above; a move is not an edit pass.
- `plans/` restructuring beyond the status-table reconciliation.
