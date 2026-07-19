---
id: ST-044
epic: EP-005
title: Dual-registry publish with pre-publish verification
status: done
priority: must
release: 0.7.0
breaking: false
scope: [scripts/verify-publish.mjs, scripts/publish-npmjs.js, Makefile, package.json]
api: docs/architecture/overview.md
---

# ST-044 — Dual-registry publish with pre-publish verification

As the maintainer publishing `@nqlib/nqui`,
I want the tarball contents asserted and both registries driven by scripts,
so that publishing is a repeatable operation rather than a remembered ritual with hand-inspected
output.

## Acceptance criteria

- [x] `prepublishOnly` runs `verify:publish` (`scripts/verify-publish.mjs`), so no publish path can
      skip the gate
- [x] `verify:publish` runs `build:lib`, `lint` and `test`, then asserts `npm pack --dry-run --json`
      contains `README.md`, `dist/nqui.es.js`, `dist/nqui.cjs.js`, `dist/index.d.ts`,
      `dist/styles.css`, `scripts/templates/colors.css`
- [x] It fails on any tarball path containing `..` (nothing escapes the package root) and prints the
      file count on success
- [x] `package.json` `files` limits the tarball to `dist`, `scripts`, `docs`, `README.md`,
      `INSTALLATION.md`; `publishConfig` pins `registry.npmjs.com` with `access: public`
- [x] `publish:npm` (`scripts/publish-npmjs.js`) checks `npm whoami`, refuses to republish an
      existing version, retries transient failures (`NPM_PUBLISH_RETRIES`, default 3, max 5), and
      restores `package.json` + `.npmrc` in a `finally` block
- [x] `publish:github` targets `npm.pkg.github.com`; `publish:both` runs GitHub then npmjs
- [x] `Makefile` wraps the ritual: `make login`, `whoami`, `version` (local vs. published),
      `verify`, `publish` (with optional `OTP=`), `publish-github`, `publish-both`

## Technical notes

`publish-npmjs.js` temporarily rewrites `publishConfig` and comments out the `@nqlib:registry=` line
in `.npmrc` so npm does not resolve the scope to GitHub Packages, then restores both. The swap is
non-atomic — an interrupted run leaves a modified `package.json`/`.npmrc`; deliberately accepted
(maintainer-only exposure, `plans/README.md` "considered and rejected").

`make publish` depends on `whoami`, so an unauthenticated publish fails before any build work.
Runbook: `internal-notes/PUBLISHING.md`.

Gap this story does not close: version bumping and CHANGELOG entries are still manual, and there is
no CI publish path — ST-046.

## Out of scope

- Provenance/attestation, npm 2FA policy, GitHub Packages retention.
- Anything automating the version bump or release notes — ST-046.
