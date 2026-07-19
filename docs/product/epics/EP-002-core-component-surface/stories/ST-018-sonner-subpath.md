---
id: ST-018
epic: EP-002
title: Toaster behind ./sonner
status: done
priority: should
release: 0.7.0
breaking: true
scope: [src/entries/sonner.ts, src/components/ui/sonner.tsx, package.json, docs]
api: docs/components/nqui-toaster.md
---

# ST-018 — Toaster behind `./sonner`

As an app author who doesn't show toasts,
I want the Toaster on its own subpath,
so that `sonner` is not a required install or a main-bundle cost.

## Acceptance criteria

- [x] `src/entries/sonner.ts` exports `Toaster` plus the compatibility aliases `EnhancedSonner`,
      `EnhancedToaster` and `CoreToaster` — all four resolve to the same component in
      `src/components/ui/sonner.tsx`.
- [x] `package.json` `exports["./sonner"]` maps types / import / require to
      `dist/entries/sonner.d.ts`, `dist/sonner.es.js`, `dist/sonner.cjs.js`.
- [x] `Toaster` is **not** re-exported from `src/components/index.ts`; only a pointer comment
      remains.
- [x] `sonner` is declared in `peerDependencies` and marked `"optional": true` in
      `peerDependenciesMeta`.
- [x] The default toast is pill-shaped, and the default `normal` toast uses an inverted surface
      (`--foreground` fill on `--background` text) so it reads as a notification layer rather than
      a card.
- [x] `docs/components/nqui-toaster.md` records the subpath (`@nqlib/nqui/sonner` re-exports the
      same `Toaster`) and the alias equivalence.
- [x] CHANGELOG 0.7.0 lists the root-import break with the before/after import line.
- [ ] `docs/components/nqui-toaster.md`'s Import block shows the subpath rather than the root.

## Technical notes

- The `toast()` function itself is **not** re-exported by nqui — consumers import it from `sonner`
  directly. The doc page's `import { Toaster, toast } from "@nqlib/nqui"` line is wrong on both
  counts (root entry, and `toast` was never an nqui export) and needs correcting.
- `EnhancedSonner` / `EnhancedToaster` / `CoreToaster` are **compatibility aliases, not an
  Enhanced/Core pair** — there is a single implementation. They exist so pre-0.7 imports keep
  resolving; ST-009's convention does not apply here.
- `Toaster` is a singleton mounted once near the app root; it has no per-call surface of its own.

## Breaking changes

| Before | After |
|---|---|
| `import { Toaster } from "@nqlib/nqui"` | `import { Toaster } from "@nqlib/nqui/sonner"` |

CHANGELOG migration line: *Toaster now imports from `@nqlib/nqui/sonner`; install `sonner` only if
you use it.*

## Out of scope

- Wrapping or re-exporting `toast()` — the consumer calls sonner's API directly.
- Entry emission and publish verification — EP-005.
