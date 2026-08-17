# Maintainer Definition of Done

Checklist for changes to **this repository**. External app integration is covered by the [consumer skill](../../skills/consumer/nqui/SKILL.md).

## Story gate (before the checklists below)

- [ ] The work has a home — a story in [`epics/`](./epics/), or it is below the story line (see the [decision ladder](./README.md#the-decision-ladder--what-needs-a-story))
- [ ] Acceptance criteria ticked as completed; `status: review` — **never `done`** (a human closes stories)
- [ ] The epic's story table matches the story's status
- [ ] Bugs logged as a dated line under the owning story's `## Bugs`

## Library changes (`nqui-dev`)

- [ ] Component follows existing patterns in `src/components/`
- [ ] Exports updated in `src/index.ts` or appropriate `src/entries/` subpath
- [ ] Optional peers not imported from main entry (see plan 005)
- [ ] `npm run lint` passes
- [ ] `npm run test` passes
- [ ] `npm run build:lib` succeeds; `verify:build` passes
- [ ] New component has `docs/components/nqui-<name>.md` + README table row
- [ ] CHANGELOG updated for user-visible changes

## Docs / skills changes (`nqui-docs`)

- [ ] Consumer skill edits only in `skills/consumer/nqui/` (not synced copies)
- [ ] `npm run sync:skills && npm run skill:validate` passes
- [ ] Component docs match actual props/exports in source
- [ ] No maintainer-only content in consumer skill

## Publish

- [ ] Version bumped appropriately
- [ ] `pnpm run verify:publish` passes (includes packed consumer types)
- [ ] `make prove-showcase` passes against sibling nqui-showcase
- [ ] Dual-registry publish tested if changing publish scripts

## Verification commands

```bash
npm run sync:skills && npm run skill:validate
npm run lint && npm run test && npm run build
```
