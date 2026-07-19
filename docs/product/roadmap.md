# Product roadmap

Direction only. Tracking lives in [`README.md`](./README.md) (epics and stories); technical
blueprints live in [`plans/README.md`](../../plans/README.md).

## Where 0.7.x got to

0.7.0–0.7.3 delivered most of the 2026 audit backlog: dependency hygiene, subpath entries for every
optional peer, publish hardening, a neutral primary default with consumer brand override, motion
tokens, and the ToggleGroup layout contract. See EP-005 and EP-001.

## Next — the open gaps, by epic

1. **Ship drag & drop** ([EP-004](epics/EP-004-drag-and-drop/epic.md)) — Phases 0–2 are built and
   verified but uncommitted and unreleased. Blocking question: the keyboard-move UX (ST-034).
2. **Close the packaging gaps** ([EP-005](epics/EP-005-packaging-entries-publishing/epic.md)) —
   postinstall consent (ST-043) is the one audit finding with zero code movement; `cmdk`'s optional
   flag (ST-041) and the missing `./resizable` / `./table` entries follow.
3. **Make green mean something** ([EP-006](epics/EP-006-quality-baseline/epic.md)) — wire the
   orphaned `validate-exports`, put skill validation and drift detection in CI, then close the test
   gap on form controls and overlays.
4. **Stop shipping misleading docs** ([EP-007](epics/EP-007-docs-vault-agent-skills/epic.md)) —
   remove doc pages for components that no longer exist (they ship in the npm tarball), document the
   undocumented ones, and migrate `internal-notes/` into the vault.

## Direction options (maintainer's call, no epic yet)

- Deploy **nqui-showcase** as a live demo (catalog at `/catalog`).
- Release automation via changesets (drafted as EP-005 ST-046).
- A consumer-facing theming guide for the OKLCH ladder in `src/styles/colors.css`.
- Decide the fate of `react-grab` in nqui-showcase.

## Docs + agent skills

- Consumer skill SOT: `skills/consumer/nqui/`
- Maintainer DoD: [`ai-contract.md`](./ai-contract.md)
- HTTP agent discovery: `public/.well-known/agent-skills/` (synced on build)
