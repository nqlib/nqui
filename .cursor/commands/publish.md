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

3. Optional full gate (publish runs this via `prepublishOnly` too):
   ```bash
   make verify
   ```

4. Publish:
   ```bash
   make publish
   ```
   If publish fails with `EOTP`, retry with authenticator code:
   ```bash
   make publish OTP=CODE
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

- Skip `verify:publish` / `prepublishOnly`
- Commit temporary `.npmrc` changes from `publish-npmjs.js` (script restores automatically)

## Reference

- Gate: `scripts/verify-publish.mjs`
- npm publish wrapper: `scripts/publish-npmjs.js`
- Checklist: `internal-notes/PUBLISHING.md`
