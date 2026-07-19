---
id: ST-055
epic: EP-006
title: Re-enable the react-hooks lint rules
status: backlog
priority: could
release: unset
breaking: false
scope: [eslint.config.js, src/components, src/hooks]
---

# ST-055 — Re-enable the `react-hooks` lint rules

As a maintainer of `@nqlib/nqui`,
I want the react-hooks correctness rules switched back on,
so that stale-closure and effect-ordering bugs are caught by lint instead of by a consumer's
production app.

## Acceptance criteria

- [ ] The violation count is measured and recorded per rule before any code changes, e.g.
      `pnpm exec eslint src --rule '{"react-hooks/exhaustive-deps":"warn"}'` — plan 003 Step 6 left
      this "not measured".
- [ ] The maintainer decision is recorded in this story: re-enable all at once, or ratchet rule by
      rule starting with the cheapest.
- [ ] The second config block in `eslint.config.js` no longer blanket-disables the eight rules
      `react-hooks/set-state-in-effect`, `preserve-manual-memoization`, `refs`, `immutability`,
      `use-memo`, `incompatible-library`, `purity`, `exhaustive-deps` — each is either `error`, or
      still off with a one-line comment saying why and what would re-enable it.
- [ ] Every violation is fixed at the call site, not silenced with a bare
      `// eslint-disable-next-line`; any surviving disable carries a `-- <reason>` clause.
- [ ] `pnpm run lint` still exits 0 under `--max-warnings 0`, so re-enabling a rule cannot be
      half-done.
- [ ] `pnpm test` is green after the fixes, and any behavior change found while fixing a dependency
      array is logged under the owning component story's `## Bugs`.

## Technical notes

- No public API doc, but this is the check most likely to surface **real consumer-visible bugs**:
  every rule here is a correctness rule, not a style rule, and they cover the whole exported
  component tree plus `src/hooks/*`.
- Current state, verified: `eslint.config.js` extends `reactHooks.configs.flat.recommended` in the
  first `**/*.{ts,tsx}` block, then a second block turns all eight rules **off** — the recommended
  set is loaded and then neutralized.
- CI runs `--max-warnings 0`, so a rule cannot be re-enabled at `warn` as a soft landing; either it
  is off, or the tree is clean. That is the whole reason plan 003 scoped this out and only planned to
  measure it.
- Plan 003's Step 6 explicitly says re-enabling is a **separate maintainer decision**, and
  `plans/README.md` finding #9 records the same. Treat this story as blocked on that decision, not on
  engineering effort.
- Known adjacent finding from the audit: Sidebar's `useCallback` misses a `_setOpen` dependency —
  harmless because the setter is stable, but it will be one of the first violations reported.

## Out of scope

- `react-refresh/only-export-components`, deliberately off and unrelated to correctness.
- Adding lint coverage to `scripts/` — ST-048.
- Refactoring a component's architecture because a rule is inconvenient; if a fix needs a redesign,
  file it as a story under the owning epic.
