# Publish `@nqlib/nqui` to npm

Repo root **is** the published package (`@nqlib/nqui`). Do not publish from a subfolder.

## Package

- Path: `.` (repo root)
- Name: `@nqlib/nqui`
- Registry: `https://registry.npmjs.com`

## Steps

1. Read `package.json` `version`. If that version is already on npm, bump patch/minor first.

2. Check npm auth:
   ```bash
   make whoami
   ```
   If unauthorized, web login and **wait for the user to finish in the browser**:
   ```bash
   make login
   ```

3. Prove packed types (required — in-repo tests are not this gate):
   ```bash
   make verify
   make prove-showcase
   ```

4. Publish **latest** only after prove-showcase passes:
   ```bash
   make publish
   ```
   If publish fails with `EOTP`, retry with authenticator code:
   ```bash
   make publish OTP=CODE
   ```

   Optional canary (still public; `^` ranges will install it):
   ```bash
   make publish-next
   make promote          # after showcase pnpm build against that exact version
   ```

5. Confirm:
   ```bash
   make version
   npm view @nqlib/nqui version --registry=https://registry.npmjs.com
   ```

6. GitHub Packages (optional):
   ```bash
   make publish-github
   # or both registries:
   make publish-both
   ```

## Do not

- Skip `verify:publish` / `prepublishOnly` / `prove-showcase`
- Treat `pnpm nqui:local` in nqui-showcase as a publish gate
- Commit temporary `.npmrc` changes from `publish-npmjs.js` (script restores automatically)

## Reference

- Gate: `scripts/verify-publish.mjs` + `scripts/verify-consumer-types.mjs`
- Showcase prove: `scripts/prove-showcase.mjs`
- npm publish wrapper: `scripts/publish-npmjs.js`
- Checklist: `docs/meta/publishing.md`
