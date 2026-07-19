---
id: ST-046
epic: EP-005
title: Release automation
status: backlog
priority: should
release: unset
breaking: false
scope: [.github/workflows, package.json, CHANGELOG.md, Makefile]
api: docs/architecture/overview.md
---

# ST-046 — Release automation

As the maintainer,
I want cutting a release to be one reviewed, repeatable operation instead of a local ritual,
so that the version, the CHANGELOG, the git tag and both registries can never disagree.

## Acceptance criteria

- [ ] A release workflow exists under `.github/workflows/` that publishes to npmjs.com **and**
      GitHub Packages from CI, triggered by a tag or a manual dispatch — today `ci.yml` is the only
      workflow and it never publishes
- [ ] The workflow runs the same gates as `verify:publish` (build, lint, test, tarball assertions)
      and the `size` budget check before publishing; it must not bypass `prepublishOnly`
- [ ] npm auth uses a repository secret token, never an interactive `npm login`; `make publish`
      stays available as the manual fallback and is documented as such
- [ ] The version bump and the `CHANGELOG.md` section are produced by the release step, not typed
      by hand — either changesets (`.changeset/`, none exists today) or an equivalent chosen and
      recorded in a decision note
- [ ] Each released version's CHANGELOG section lists the `ST-NNN` ids it closed, per §9 of
      `docs/product/agentic-coding-guideline.md`
- [ ] A git tag `vX.Y.Z` is pushed for every published version
- [ ] Publishing an already-published version fails loudly (the check in
      `scripts/publish-npmjs.js`) rather than being retried by the workflow
- [ ] `internal-notes/PUBLISHING.md` is rewritten to describe the automated path, keeping the manual
      Makefile route as the documented escape hatch

## Technical notes

Nothing is started. Current state: `Makefile` targets + `npm run publish:both`, run locally by the
maintainer, with `prepublishOnly → verify:publish` as the only mechanical gate (ST-044). Version
numbers and CHANGELOG entries are edited by hand.

`plans/README.md` surfaces "release automation via changesets" as direction option 2 — a
maintainer's call, not a bug. This story is the placeholder for that decision; it should not be
moved to `ready` until the tool choice is made, because the acceptance criteria for changesets and
for a hand-rolled tag workflow differ.

"Done" here means a maintainer can ship a version without running a publish command locally, and
that the published version, the tag and the CHANGELOG were produced by the same run.

## Out of scope

- CI test/lint job composition → EP-006.
- Deploying the showcase app (a separate repo, `../nqui-showcase`).
- Changing which registries are published to.
