---
id: ST-045
epic: EP-005
title: Style build and dist CSS verification
status: done
priority: must
release: pre-baseline
breaking: false
scope: [scripts/build-styles.js, scripts/verify-build.js, package.json, src/styles]
api: docs/architecture/overview.md
---

# ST-045 — Style build and dist CSS verification

As an app author who writes `@import "@nqlib/nqui/styles"`,
I want one self-contained stylesheet carrying every nqui token,
so that my build never has to resolve nqui-internal `./styles/*` paths and no token silently goes
missing between source and dist.

## Acceptance criteria

- [x] `scripts/build-styles.js` inlines every `src/styles/*.css` partial into `dist/styles.css` —
      `:root` merged in the order `z-index, motion, shadows, colors`, `.dark` from
      `shadows, colors` — so consumers never resolve a relative nqui path
- [x] `package.json` `exports["./styles"]` resolves `dist/styles.css` for `import`, `require` and
      `default`; `sideEffects: ["**/*.css"]` keeps it from being tree-shaken away
- [x] `copy:css` publishes the debug stylesheet as `dist/nqui.css`, exported as `./debug.css`
- [x] `scripts/verify-build.js` runs inside `build:lib` and fails the build on: a changed count of
      `@source inline()` directives, orphan `@source inline()` in the CSS body, any missing `:root`
      or `.dark` variable, any missing `.nqui-*` class, or any missing utility from
      `@source inline()`
- [x] It asserts the 11 elevation variables (`--z-base` … `--z-debug`) and the checked colour
      variables (`--primary-100…600`, `--background`, `--foreground`, `--card*`, `--popover*`)
      are present in the built CSS
- [x] It warns (without failing) on leftover `@import "tailwindcss"`, unbundled `@import "./styles/`,
      `@custom-variant` and framework-specific `@source` directives
- [x] `verify:publish` refuses to publish a tarball without `dist/styles.css` (ST-044)

## Technical notes

Predates the product-docs baseline — `build:styles` + `verify:build` were already wired into
`build:lib` before 0.7.0, hence `release: pre-baseline`.

The verifier compares *source partials against built output*, so it catches inlining regressions
(a partial dropped from `ROOT_PARTIALS`) but not authoring mistakes — a token missing from
`src/styles/colors.css` is invisible to it. Token semantics belong to EP-001.

Extra `:root`/`.dark` variables produce warnings, not errors, because the Tailwind `@theme inline`
block legitimately introduces derived names.

## Out of scope

- What the tokens mean or which values they take — EP-001.
- A size budget for `dist/styles.css` (`check-bundle-size.js` measures JS entries only, ST-039).
- Consumer-side CSS setup (`init-css`, `--sidebar`) → EP-007.
