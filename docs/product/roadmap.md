# Product roadmap

High-level direction. Detailed engineering plans live in [`plans/README.md`](../../plans/README.md).

## Current focus (2026)

1. **Dependency hygiene** — clean install, optional peers in subpath entries
2. **Postinstall consent** — stop silent mutation of consumer `package.json` / `.cursor/`
3. **Test + lint baseline** — scripts lint, CLI tests, component smoke tests
4. **CI hardening** — full typecheck, export validation, Node matrix
5. **Optional-peer entry restructure** — v0.7.0 breaking change (blocked on 003/004)

## Direction options (maintainer's call)

1. Deploy showcase app as live demo (biggest adoption lever)
2. Release automation via changesets
3. Consumer-facing theming guide for OKLCH ladder in `src/styles/colors.css`
4. Document or drop `react-grab` in showcase

## Docs + agent skills

- Consumer skill SOT: `skills/consumer/nqui/`
- Maintainer DoD: [`ai-contract.md`](./ai-contract.md)
- HTTP agent discovery: `public/.well-known/agent-skills/` (synced on build)
