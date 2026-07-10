# Maintainer Definition of Done

Checklist for changes to **this repository**. External app integration is covered by the [consumer skill](../../skills/consumer/nqui/SKILL.md).

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
- [ ] `npm run verify:publish` passes
- [ ] Dual-registry publish tested if changing publish scripts

## Verification commands

```bash
npm run sync:skills && npm run skill:validate
npm run lint && npm run test && npm run build
```
