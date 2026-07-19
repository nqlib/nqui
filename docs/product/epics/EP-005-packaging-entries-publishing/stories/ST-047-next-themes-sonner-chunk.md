---
id: ST-047
epic: EP-005
title: Split next-themes out of the sonner chunk
status: backlog
priority: should
release: unset
breaking: false
scope: [src/components/ui/sonner.tsx, vite.config.ts, package.json, src/entries/sonner.ts, docs]
api: docs/components/README.md
---

# ST-047 — Split `next-themes` out of the sonner chunk

As an app author using `next-themes` and `@nqlib/nqui/sonner`,
I want the Toaster to read my own theme provider,
so that toasts follow the app's light/dark state instead of a bundled copy of `next-themes` that
can never see my `ThemeProvider`.

## Acceptance criteria

- [ ] Reproduce first: a consumer app with its own `next-themes` `ThemeProvider` toggling dark mode,
      asserting whether `Toaster` picks the theme up — record the result before changing anything
- [ ] `next-themes` is not inlined into `dist/sonner.es.js`: either externalized in
      `vite.config.ts` `rollupOptions.external`, or `useTheme` is dropped in favour of reading the
      `.dark` class / a `theme` prop
- [ ] If externalized: `next-themes` moves from `dependencies` to `peerDependencies` with
      `peerDependenciesMeta.optional = true`, and `src/entries/sonner.ts`'s header comment lists it
      alongside `sonner`
- [ ] The Toaster still renders correctly for consumers who use **no** theme provider (class-based
      dark mode only) — no crash, no unresolved import
- [ ] `src/test/dist-guard.test.ts` gains a signature check so `next-themes` source can never be
      re-inlined into any chunk
- [ ] `sonner.es.js` stays inside its 5 KB gzip budget (`pnpm run size`)
- [ ] The sonner doc page and consumer skill state how theme detection works and what the consumer
      must install; `sync:skills` + `skill:validate` run in the same PR

## Technical notes

A **deferred finding**, not a confirmed bug: `plans/005-optional-peer-entry-restructure.md`
("Explicitly deferred") and `plans/README.md` both record that `src/components/ui/sonner.tsx`
imports `next-themes`, which is a hard `dependency` and is *not* in `rollupOptions.external`, so it
gets bundled into the sonner chunk. A bundled copy is a different module instance from the
consumer's, so its React context is separate and `useTheme()` would return defaults. Flagged as
candidate plan 006.

Investigation comes first — if the reproduction shows theme detection actually works (e.g. because
`next-themes` also writes a `class`/`data-theme` attribute the toaster reads), close this story and
record the finding rather than externalizing anything.

Moving `next-themes` to a peer is consumer-observable install surface, hence a story per §8's
decision ladder even though no export changes.

## Out of scope

- Toaster props, positioning or styling — EP-002.
- The rest of the token/theming model — EP-001.
- Any other bundled-vs-externalized dependency decision.
