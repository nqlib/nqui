---
id: ST-007
epic: EP-001
title: Consumer brand override via init-css
status: done
priority: must
release: 0.7.2
breaking: false
scope: [scripts/init-css.js, scripts/templates/colors.css, docs, skills]
api: scripts/templates/colors.css
---

# ST-007 — Consumer brand override via `init-css`

As an app author installing nqui,
I want `npx @nqlib/nqui init-css` to drop a single editable brand file next to my imports,
so that I change brand color in one place instead of copying the whole token system.

## Acceptance criteria

- [x] `scripts/init-css.js` writes `nqui/index.css` containing
      `@import "@nqlib/nqui/styles";` followed by `@import "./colors.css";` — package styles
      first, brand override second, so cascade order is correct by construction.
- [x] It copies `scripts/templates/colors.css` verbatim to `<outDir>/colors.css`, where
      `<outDir>` is `dirname(output)` (default `nqui/`).
- [x] The template overrides only the primary ladder: `--primary-100 … --primary-600`, plus
      `--primary`, `--primary-foreground`, `--primary-hover`, in both `:root` and `.dark`.
- [x] The template default is blue, hue 240 (`--primary-500: oklch(0.52 0.20 240)` light,
      `oklch(0.515 0.168 240)` dark) — nqui's pre-0.7.2 brand primary, so upgraders keep the look
      they had.
- [x] Both the template header and the generated `nqui/index.css` header tell the consumer they
      can delete the `colors.css` import to keep the neutral package default.
- [x] The generated `nqui/nqui-setup.css` helper also carries the `colors.css` import, and the CLI
      prints "Edit `<dir>/colors.css` to match your brand" as step 3 of next steps.
- [x] `--dry-run` and `--force` are honoured for both emitted files; `--local-copy` opts out of the
      library-import path and runs the token pipeline instead.
- [x] The override path is documented in `docs/nqui-skills/THEMING.md` under "Brand color (the
      most common ask)".

## Technical notes

- The template overrides the *scale*, not the semantic mappings that read from it, which is why a
  brand swap propagates to every `bg-primary` surface without further edits.
- `--ring` is intentionally **not** in the template: focus stays neutral (see ST-001). A consumer
  who wants a branded ring has to opt in, and `THEMING.md` shows `--ring: var(--primary-500)` as
  the manual example.
- Library-import mode is the default (`useLibraryImport = !args['local-copy']`); the older full
  token-copy pipeline remains reachable for consumers who need to vendor the tokens.
- Shipped as "`init-css` copies `nqui/colors.css`" in 0.7.2 (`967d145`).

## Out of scope

- Overriding surfaces, radius or motion via the CLI — those stay manual CSS overrides.
- A theme-builder or palette-generator UI.
