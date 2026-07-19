---
id: ST-004
epic: EP-001
title: Z-index scale
status: done
priority: must
release: pre-baseline
breaking: false
scope: [src/styles/z-index.css, src/index.css, src/components, docs]
api: src/styles/z-index.css
---

# ST-004 — Z-index scale

As an app author composing modals, dropdowns and sticky headers,
I want a semantic z-index scale instead of a pile of `z-50`s,
so that stacking conflicts are resolved once in the library rather than in every consumer app.

## Acceptance criteria

- [x] `src/styles/z-index.css` defines the full scale on `:root`: `--z-base` 0,
      `--z-background` 0, `--z-content` 10, `--z-sticky-content` 15, `--z-sticky-page` 20,
      `--z-floating` 30, `--z-modal-backdrop` 40, `--z-modal` 50, `--z-popover` 60,
      `--z-tooltip` 70, `--z-debug` 9999.
- [x] The ordering invariants hold and are documented in-file: sticky-content < sticky-page <
      floating < modal-backdrop < modal < popover < tooltip — so a dropdown opened inside a
      dialog paints above it.
- [x] Every scale token is re-declared in the `@theme inline` block in `src/index.css` so
      `z-[var(--z-*)]` arbitrary values resolve in consumer builds.
- [x] Library internals reference the tokens, not raw numbers — e.g. the separator decorations
      and `.cn-toast` children use `z-index: var(--z-content)`, frosted-glass backdrops use
      `var(--z-background)`.
- [x] The file states the boundary explicitly: stacking only, **not** surface depth (that is
      `ELEVATION.md` and the surface tokens).
- [x] `docs/nqui-skills/THEMING.md` lists `--z-*` under tokens consumers should not restructure.

## Technical notes

- The file carries an in-source component mapping table recording the pre-refactor values each
  component used (`Dialog overlay z-50 → --z-modal-backdrop`, `Color picker z-[9999] →
  --z-popover`, etc.). It is reference documentation, not a to-do list.
- `--z-base` and `--z-background` are both 0 on purpose: they are semantically different roles
  (default stacking vs. decorative behind-content) that happen to share a value, so a consumer
  can retarget one without disturbing the other.
- `--z-debug` (9999) is development tooling only and is expected to outrank everything.

## Out of scope

- Portal/stacking-context bugs inside individual Radix primitives.
- Surface elevation and shadows — ST-002.
