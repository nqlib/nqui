---
id: ST-066
epic: EP-005
title: Prove packed types before public latest
status: review
priority: must
release: 0.7.10
breaking: false
scope: [scripts/verify-consumer-types.mjs, scripts/prove-showcase.mjs, scripts/verify-publish.mjs, Makefile, .github/workflows/ci.yml, docs/meta/publishing.md]
api: docs/meta/publishing.md
---

# ST-066 — Prove packed types before public latest

As the maintainer publishing `@nqlib/nqui`,
I want a consumer-shaped typecheck against the npm tarball before `latest` moves,
so that wrapping our own `forwardRef` in `ComponentProps` cannot ship three public patches
in a day (TabsList children / className / variant, 0.7.8–0.7.10).

## Acceptance criteria

- [x] After `build:lib`, `verify:consumer-types` packs the tarball, extracts it, and `tsc`s a
      fixture that uses `TabsList` `children`, `className`, `aria-label`, and `variant="line"`
      the way nqui-showcase does — against the packed `.d.ts`, not library source
- [x] `verify:publish` / `prepublishOnly` run that packed consumer check (CI does too)
- [x] `make prove-showcase` installs the tarball into sibling nqui-showcase, runs
      `pnpm typecheck` (`tsc -b`), then restores `package.json` + `pnpm-lock.yaml`
- [x] `make publish` runs `prove-showcase` when `../nqui-showcase` exists
- [x] `make publish-next` publishes with `--tag next`; `make promote` moves that version to
      `latest`. Docs state that `--tag next` is still public and **does not** hide the version
      from `^x.y.z` ranges — pack-and-prove is the real private gate
- [x] Public `TabsList` props extend Radix `List` plus an explicit `variant`, never
      `ComponentProps<typeof CoreTabsList>`

## Technical notes

In-repo tests using `ComponentProps<typeof EnhancedTabsList>` see the `.tsx` implementation.
`pnpm nqui:local` links the sibling repo. Vercel typechecks `node_modules/@nqlib/nqui/dist/*.d.ts`
with `skipLibCheck`. Those three are not the same.

`--tag next` only changes the default for a bare `npm install @nqlib/nqui`. A specifier of
`^0.7.9` still installs `0.7.10` if it exists on the registry. True isolation without a
private registry is: do not publish until `prove-showcase` passes, then publish `latest`.

## Out of scope

- ST-046 release automation / changesets
- Rewriting `@/` imports in every emitted `.d.ts` (tsc-alias)
- npm paid private packages

## Bugs
