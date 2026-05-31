# Publishing Guide

This guide covers publishing to both **npmjs.com** (public, no auth needed) and **GitHub Packages** (requires GitHub account).

## Prerequisites

1. **Build the library**
  ```bash
   npm run build:lib
  ```
   Verify `dist/` folder contains all required files.
2. **Authentication** (only needed for GitHub Packages)
  - GitHub Personal Access Token with `write:packages` permission
  - For npmjs.com: Create account at npmjs.com and run `npm login`

## Publishing Options

### Option 1: Publish to npmjs.com (Recommended for Public Use)

**Why:** Anyone can install without authentication - works like `npm install react`

**Important:** Scoped packages (`@nqlib/nqui`) require either:

- An npm organization (paid, $7/month) - Create at: [https://www.npmjs.com/org/create](https://www.npmjs.com/org/create)
- OR use your username scope: `@ctesibius/nqui` (free)
- OR publish unscoped: `nqui` (free, but name must be available)

**Steps:**

1. **Set up scope** (if using `@nqlib` scope):
  - Create npm organization: [https://www.npmjs.com/org/create](https://www.npmjs.com/org/create)
  - Organization name: `nqlib`
  - Requires paid plan ($7/month per user)
2. **Enable 2FA on npmjs.com** (required for publishing)
  - Go to: [https://www.npmjs.com/settings/[your-username]/security](https://www.npmjs.com/settings/[your-username]/security)
  - Enable "Two-factor authentication"
  - Follow the setup instructions (use an authenticator app like Google Authenticator or Authy)
  - **OR** create a granular access token with "publish" permission and "bypass 2FA" enabled:
    - Go to: [https://www.npmjs.com/settings/[your-username]/tokens](https://www.npmjs.com/settings/[your-username]/tokens)
    - Click "Generate New Token" → "Granular Access Token"
    - Select "Publish" permission
    - Enable "Bypass 2FA" (if available)
    - Copy the token (you'll only see it once!)
3. **Login to npmjs.com** (one-time setup or when credentials expire)
  ```bash
   cd packages/nqui
   npm login --registry=https://registry.npmjs.com
  ```
  - Username: Your npmjs.com username
  - Password: Your npmjs.com password (or use the granular token as password if using token)
  - Email: Your npmjs.com email
  - OTP: Enter your 2FA code if prompted (if using 2FA)
   **Verify login:**
4. **Update version** (if needed)
  ```bash
   npm version patch   # 0.1.0 → 0.1.1
   npm version minor   # 0.1.0 → 0.2.0
   npm version major   # 0.1.0 → 1.0.0
  ```
5. **Publish**
  ```bash
   npm run publish:npm
   # or
   npm publish --registry=https://registry.npmjs.com --access=public
  ```

**Users install with:**

```bash
npm install @nqlib/nqui
```

No `.npmrc` or token needed! ✅

---

### Option 2: Publish to GitHub Packages

**Why:** Good for organization packages, version control integration

**Steps:**

1. **Setup authentication** (one-time setup)
  **Option A: Using `.npmrc` file (Recommended)**
   Ensure `.npmrc` exists in the project root (`/Users/bnguyen/Desktop/Github/nqui/.npmrc`):
   **Before publishing, copy `.npmrc` to the package directory:**
   **Option B: Interactive login**
  - Username: Your GitHub username
  - Password: Your GitHub Personal Access Token (not password!)
  - Email: Your GitHub email
   **Verify authentication:**
2. **Update version** (if needed)
  ```bash
   npm version patch
  ```
3. **Publish**
  ```bash
   cd packages/nqui
   # If using .npmrc method, ensure it's copied first:
   cp ../../.npmrc .npmrc

   npm run publish:github
   # or
   npm publish --registry=https://npm.pkg.github.com
  ```
   **Note:** The `.npmrc` file in `packages/nqui/` is gitignored and won't be committed.

**Users install with:**

```bash
# Create .npmrc in their project
echo "@nqlib:registry=https://npm.pkg.github.com" > .npmrc

# Authenticate (they need their own GitHub token)
npm login --registry=https://npm.pkg.github.com

# Install
npm install @nqlib/nqui
```

⚠️ **Note:** Users need GitHub account + token even for public packages.

---

### Option 3: Publish to Both Registries

**Best of both worlds:** Maximum accessibility

**Steps:**

1. **Setup authentication for both registries**
  **For GitHub Packages:**
   **For npmjs.com:**
2. **Update version** (if needed)
  ```bash
   npm version patch
  ```
3. **Publish to both**
  ```bash
   cd packages/nqui
   npm run publish:both
  ```
   This will:
  - Publish to GitHub Packages first
  - Then publish to npmjs.com

**Users can choose:**

- **npmjs.com**: `npm install @nqlib/nqui` (no auth needed)
- **GitHub Packages**: Requires GitHub token (see Option 2)

---

### Publishing to Missing Registry Only

If you've already published to one registry, you can publish the same version to the other:

**Already on GitHub Packages, need npmjs.com:**

```bash
npm run publish:npm
```

**Already on npmjs.com, need GitHub Packages:**

```bash
npm run publish:github
```

**Note:** Different registries can have the same version number - they're independent.

---

### Republishing After a Bad Release

If a version had bugs (e.g. init-cursor routed to wrong script, skills not working):

1. **Bump version** and fix the code:
  ```bash
   cd packages/nqui
   npm version patch   # 0.4.1 → 0.4.2
  ```
2. **Publish the fixed version** (same as normal):
  ```bash
   npm run publish:both
   # or npm run publish:npm / publish:github
  ```
3. **Optional: Deprecate the bad version** (npm only):
  ```bash
   npm deprecate @nqlib/nqui@0.4.1 "Use 0.4.2 instead. See changelog."
  ```
4. **Unpublish** (rare, npm restrictions apply): See [Unpublishing](#unpublishing) below.

**Recommendation:** Usually deprecate + publish patch. Unpublish only for security issues.

---

## Unpublishing

### npmjs.com

**Rules:**

- **Within 72 hours of publish**: You can unpublish. The version is then available for re-publish.
- **After 72 hours**: Unpublish is disallowed. Versions are permanently locked. Use deprecation instead.

**Unpublish a specific version** (within 72 hours):

```bash
cd packages/nqui
npm unpublish @nqlib/nqui@0.4.1 --force --registry=https://registry.npmjs.com
npm unpublish @nqlib/nqui@0.4.7 --registry=https://registry.npmjs.org --@nqlib:registry=https://registry.npmjs.org
```

**Unpublish entire package** (within 72 hours, removes all versions):

```bash
npm unpublish @nqlib/nqui --force --registry=https://registry.npmjs.com
```

**After 72 hours – deprecate instead:**

```bash
npm deprecate @nqlib/nqui@0.4.1 "Superseded by 0.4.2. Use npm install @nqlib/nqui@0.4.2"
```

### GitHub Packages

**Rules:**

- You can delete any version at any time.
- Deleted versions can be re-published (unlike npm).

**Delete via GitHub UI:**

1. Go to your repo → **Packages** (right sidebar) or `https://github.com/ORG/REPO/packages`
2. Click the package `nqui`
3. **Manage package** → **Delete package** (entire package) or **Manage versions** → delete specific versions

**Delete via GitHub API** (for automation):

```bash
# Requires GITHUB_TOKEN with delete:packages
curl -X DELETE -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/orgs/nqlib/packages/npm/nqui/versions/VERSION_ID"
```

(Get `VERSION_ID` from the package page or API.)

---

## Version Management

The `npm version` command automatically:

- Updates `package.json` version
- Creates a git tag
- Commits the change

**Version types:**

- `patch`: Bug fixes (0.1.0 → 0.1.1)
- `minor`: New features, backward compatible (0.1.0 → 0.2.0)
- `major`: Breaking changes (0.1.0 → 1.0.0)

---

## Verification

After publishing, verify:

**npmjs.com:**

- Visit: `https://www.npmjs.com/package/@nqlib/nqui`
- Test install: `npm install @nqlib/nqui` (in a fresh project)

**GitHub Packages:**

- Visit: `https://github.com/nqlib/nqui/packages`
- Check package visibility settings

---

## Troubleshooting

### "401 Unauthorized" (GitHub Packages)

- Verify token has `write:packages` permission
- Check token hasn't expired
- Ensure you're authenticated: `npm whoami --registry=https://npm.pkg.github.com`

### "403 Forbidden" (GitHub Packages)

- Verify repository ownership matches package scope (`@nqlib`)
- Check package visibility settings in GitHub

### "404 Not Found - Scope not found" (npmjs.com)

- The scope `@nqlib` doesn't exist on npmjs.com
- **Solution 1**: Create an npm organization named `nqlib` at [https://www.npmjs.com/org/create](https://www.npmjs.com/org/create) (requires paid plan)
- **Solution 2**: Change package name to `@ctesibius/nqui` (uses your username scope, free)
- **Solution 3**: Publish as unscoped package `nqui` (check name availability first)

### "403 Forbidden - Two-factor authentication required" (npmjs.com)

- **Enable 2FA** on your npmjs.com account:
  - Visit: [https://www.npmjs.com/settings/[your-username]/security](https://www.npmjs.com/settings/[your-username]/security)
  - Enable "Two-factor authentication"
- **OR** use a granular access token:
  - Visit: [https://www.npmjs.com/settings/[your-username]/tokens](https://www.npmjs.com/settings/[your-username]/tokens)
  - Create a token with "Publish" permission
  - Use the token as your password when logging in

### "404 Not Found" (npmjs.com)

- Ensure package name is available (scoped packages like `@nqlib/nqui` are always available)
- Verify you're logged in: `npm whoami`

### "Package name already exists" (npmjs.com)

- Someone else owns that name
- Use a different scope or name

---

## Access Control Summary

### npmjs.com

- ✅ **Public packages**: Anyone can install, no authentication needed
- ✅ **Private packages**: Requires paid npm account
- ✅ **Scoped packages** (`@nqlib/nqui`): Always available, no name conflicts

### GitHub Packages

- ⚠️ **Public packages**: Anyone can install, but requires GitHub account + token
- 🔒 **Private packages**: Requires explicit access grant
- 📦 **Package visibility**: Inherits from repository visibility by default

---

## Recommended Workflow

For maximum accessibility:

1. **Publish to npmjs.com** (primary)
  - Zero friction for users
  - Standard npm experience
2. **Also publish to GitHub Packages** (optional)
  - For users who prefer GitHub ecosystem
  - Better integration with GitHub Actions/CI

**Complete workflow:**

```bash
# 1. Navigate to package directory
cd packages/nqui

# 2. Setup authentication
cp ../../.npmrc .npmrc  # For GitHub Packages
npm login --registry=https://registry.npmjs.com  # For npmjs.com (if not already logged in)

# 3. Update version and publish
npm version patch
npm run publish:both
```

**Quick reference - Login commands:**

```bash
# Login to npmjs.com
cd packages/nqui
npm login --registry=https://registry.npmjs.com

# Login to GitHub Packages (alternative to .npmrc)
cd packages/nqui
npm login --registry=https://npm.pkg.github.com

# Verify authentication
npm whoami --registry=https://registry.npmjs.com
npm whoami --registry=https://npm.pkg.github.com
```

---

## Security Notes

- ✅ **DO**: Use `npm login` (stores credentials securely)
- ✅ **DO**: Use environment variables in CI/CD
- ❌ **DON'T**: Commit tokens to git
- ❌ **DON'T**: Share tokens publicly
- ✅ **DO**: Add `.npmrc` to `.gitignore` (already done)

