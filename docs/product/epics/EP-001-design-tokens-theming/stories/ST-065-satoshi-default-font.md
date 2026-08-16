---
id: ST-065
epic: EP-001
title: Ship Satoshi as the library default sans
status: review
priority: should
release: 0.7.8
breaking: false
scope: [src/index.css, src/fonts, scripts/build-styles.js, scripts/verify-build.js, docs/nqui-skills/THEMING.md, docs/nqui-skills/nqui-design-system/SKILL.md, CHANGELOG.md]
api: src/index.css
---

# ST-065 — Ship Satoshi as the library default sans

As an app author importing `@nqlib/nqui/styles`,
I want the package to load Satoshi and set `--font-sans` to it,
so that a consumer who does nothing else gets the same face as the showcase
instead of an Inter token with no font file (system fallback).

## Acceptance criteria

- [x] `src/fonts/` vendors Satoshi Variable + Variable Italic (woff2 only) and
      the Fontshare FFL (`LICENSE-Satoshi.txt`).
- [x] `src/index.css` declares `@font-face` for Satoshi (wght 300–900, roman +
      italic, `font-display: swap`) and `--font-sans: "Satoshi", system-ui, sans-serif`.
- [x] `pnpm run build:styles` copies those files to `dist/fonts/` and leaves the
      `@font-face` `url("./fonts/…")` paths intact in `dist/styles.css`.
- [x] `@fontsource-variable/inter` is removed from the package. Published CSS
      no longer names Inter.
- [x] `verify:build` fails if the woff2 files or Satoshi `@font-face` are missing.
- [x] `THEMING.md` documents the default face and how to override `--font-sans`.
- [x] Design-system skill typography line names Satoshi, not Inter Variable.
- [x] CHANGELOG `[Unreleased]` records the visual default change.

## Technical notes

- Inter was never in the published tarball: `build-styles.js` stripped
  `@import "@fontsource-variable/inter"` and the package listed it only as a
  devDependency. `--font-sans: 'Inter Variable'` therefore resolved to the
  consumer's `sans-serif` fallback unless they installed Inter themselves.
- Variable woff2 is ~42KB roman + ~43KB italic. Static cuts are not shipped.
- Satoshi is Indian Type Foundry / Fontshare FFL. The license is copied next
  to the files. Consumers who want a different face override `--font-sans`
  after `@import "@nqlib/nqui/styles"`; the woff2 still downloads with styles.
- Visual default change, not an export-surface break (`breaking: false`).

## Out of scope

- A separate `@nqlib/nqui/fonts` export to skip the download when overriding.
- Replacing the showcase's local `src/assets/Satoshi` tree (it can stop
  declaring `@font-face` once the library ships the files).
