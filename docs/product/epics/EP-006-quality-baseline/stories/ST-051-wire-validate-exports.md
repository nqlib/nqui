---
id: ST-051
epic: EP-006
title: Wire validate-exports into scripts and CI
status: ready
priority: should
release: unset
breaking: false
scope: [scripts/validate-exports.mjs, package.json, .github/workflows/ci.yml]
---

# ST-051 — Wire `validate-exports` into scripts and CI

As a maintainer of `@nqlib/nqui`,
I want the barrel-vs-source export check to run automatically and to actually inspect the real
barrels,
so that a renamed or deleted component export fails CI instead of failing in a consumer's build.

## Acceptance criteria

- [ ] `package.json` gains `"verify:exports": "node scripts/validate-exports.mjs"` and
      `.github/workflows/ci.yml` runs it as a named step in the `verify` job, after Build library.
- [ ] The check is no longer vacuous: it resolves the barrel chain `src/index.ts` →
      `src/components/index.ts` → `src/components/ui/*`, instead of only matching
      `export { … } from "./components/ui/<x>"` literals in `src/index.ts` (of which there are
      **zero** — `src/index.ts` is 24 lines of `export *`).
- [ ] A deliberately broken barrel entry (rename an export in `src/components/ui/button.tsx` without
      updating the barrel) makes `pnpm run verify:exports` exit 1; reverting makes it exit 0. Record
      this negative test in the PR.
- [ ] `export *` re-exports are handled — either resolved transitively or reported as an explicit
      "unverifiable" count, never silently passed over.
- [ ] Subpath entries under `src/entries/*.ts` (calendar, carousel, command, debug, dnd, drawer,
      sonner, sortable) are covered by the same check or explicitly declared out of its scope in the
      script's header comment.
- [ ] `pnpm run verify:exports` exits 0 on `main` and prints how many exports it verified, so a
      future regression to zero coverage is visible.

## Technical notes

- No public API doc of its own. The check protects **the export surface itself** —
  `src/index.ts`, `src/components/index.ts` and `src/entries/*.ts`, the seam defined in
  §6 of the agentic coding guideline.
- Current state, verified: `scripts/validate-exports.mjs` exists, is referenced by **no npm script
  and no CI step**, and is imported by nothing. It does `process.exit(1)` on mismatch, so the exit
  code is already correct.
- It is also **vacuously green**. Its `exportRegex` only matches
  `export {…} from "./components/ui/…"` in `src/index.ts`; that file re-exports via
  `export * from "./lib" | "./hooks" | "./components"`, so the regex matches nothing, the error list
  stays empty and it prints "All exports are valid!". Wiring it in without fixing the parsing buys a
  green step and no coverage — do both in this story.
- Plan 004 Step 3 accepted the shallow version as "wiring is the goal"; its maintenance note already
  recommends extending it. Consider replacing the regex with a Vitest test that imports the built
  `dist/` and asserts the expected named exports — reuses the ST-049 harness, survives refactors.

## Out of scope

- Asserting every `package.json` `exports` map entry has a matching dist file, and that every bare
  import in `dist/*.js` is declared — those are EP-005 invariants, enforced by
  `scripts/verify-build.js` and `src/test/dist-guard.test.ts`.
- Changing any actual export — this story only adds the check.
