---
id: ST-043
epic: EP-005
title: Postinstall consent — stop silent consumer mutation
status: ready
priority: must
release: unset
breaking: true
scope: [scripts/post-install.js, README.md, INSTALLATION.md, CHANGELOG.md]
api: docs/architecture/overview.md
---

# ST-043 — Postinstall consent — stop silent consumer mutation

As an app author running `npm install @nqlib/nqui`,
I want the install to write nothing into my repository,
so that adding a UI library never reformats my `package.json` or drops IDE config I did not ask
for.

## Acceptance criteria

- [ ] `scripts/post-install.js` computes
      `npm_lifecycle_event === "postinstall" && NQUI_POSTINSTALL_SETUP !== "1"` and performs **no
      filesystem writes** in that mode — no `addNquiInitScript()`, no `writeCursorRule()`
- [ ] Explicit invocation (`npx nqui-setup`, `npx @nqlib/nqui setup`, `node scripts/post-install.js`)
      keeps the current behavior: adds the `nqui:init` script and writes
      `.cursor/rules/nqui-components.mdc`
- [ ] `NQUI_POSTINSTALL_SETUP=1` re-enables writes during the lifecycle hook, and is documented
- [ ] The banner no longer claims writes that did not happen: the
      `✅ Added "nqui:init" script…` and `Skills written to: …` lines print only when those writes
      occurred; postinstall mode prints a "run `npx nqui-setup` to apply setup (no files were
      modified)" line instead
- [ ] `addNquiInitScript`'s `catch` warns via `console.warn` instead of `return false` swallowing
      the error
- [ ] Temp-dir check: a tab-indented consumer `package.json` is byte-identical after
      `npm_lifecycle_event=postinstall node scripts/post-install.js`, and no `.cursor/` is created
- [ ] The `postinstall` hook itself stays in `package.json` (it still prints guidance), and
      `scripts/init-cursor.js` / `cli.js` / `resolve-target-dir.js` are untouched
- [ ] `README.md` and `INSTALLATION.md` describe print-only postinstall; `CHANGELOG.md` records the
      behavior change

## Technical notes

`plans/002-postinstall-consent.md` designs this and is **not implemented**. At HEAD the script still
re-serializes the consumer's `package.json` with `JSON.stringify(pkg, null, 2)` (normalizing their
indentation), injects an `nqui:init` script, then calls
`writeCursorRule(resolveTargetDir(process.cwd()))` — unconditionally, on every consumer install.
The only guard is the `CI === 'true' | '1'` early exit, which must stay.

The distinction to encode is *lifecycle hook vs. user-initiated command*, not CI vs. local. Same
file serves both via the `nqui-setup` bin entry and the `setup` subcommand.

Maintenance rule to carry forward: any future `writeFileSync`/`mkdirSync` in this script must sit
behind the gate. Reviewers reject anything outside it.

## Breaking changes

Consumers upgrading no longer get `nqui:init` or `.cursor/` rules automatically. Migration line:
run `npx nqui-setup` once, or set `NQUI_POSTINSTALL_SETUP=1` to keep the old behavior.

## Out of scope

- `install-peers`, `init-css`, `init-skills` behavior — they are already explicit commands.
- Automated tests for the two modes; add them once EP-006's script-test harness exists.
