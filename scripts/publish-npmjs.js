#!/usr/bin/env node

/**
 * Publish to npmjs.com registry
 * Temporarily overrides publishConfig and .npmrc to use npmjs.com instead of GitHub Packages
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync, spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const packageJsonPath = join(rootDir, 'package.json');
const npmrcPath = join(rootDir, '.npmrc');

function printSslTroubleshooting() {
  console.error(`
💡 TLS / network (e.g. ERR_SSL_SSL\\TLS_ALERT_BAD_RECORD_MAC) is usually environmental:
   • Run publish again; transient failures often work on a second attempt
   • Disable VPN or try another network; corporate proxies and inspection break TLS
   • Update Node LTS; ensure no antivirus is MITM’ing npm traffic
   • Retry later if registry.npmjs.com is flaking
   • Set NPM_PUBLISH_RETRIES=5 for more attempts (default 3)
`);
}

function isVersionAlreadyPublished(pkgName, version, cwd) {
  try {
    const result = execSync(`npm view ${pkgName}@${version} version --registry=https://registry.npmjs.com`, {
      encoding: 'utf-8',
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
    return result === version;
  } catch (error) {
    const errText = `${error?.message || ''} ${error?.stderr?.toString?.() || ''}`;
    if (errText.includes('404') || errText.includes('E404')) {
      return false;
    }
    throw error;
  }
}

async function main() {
  // Read package.json
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

  // Save originals for restore
  const originalPublishConfig = packageJson.publishConfig;
  const originalDependencies = { ...packageJson.dependencies };

  // Remove workspace:* deps (npm doesn't support workspace: protocol).
  const workspaceDeps = ['@nqlib/nqcode', '@nqlib/nqappbuilder'];
  for (const name of workspaceDeps) {
    if (packageJson.dependencies?.[name] === 'workspace:*') {
      delete packageJson.dependencies[name];
      console.log(`   Removed ${name} (workspace dep)`);
    }
  }

  packageJson.publishConfig = {
    registry: 'https://registry.npmjs.com',
    access: 'public',
  };

  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

  let originalNpmrc = null;
  let npmrcExists = false;

  if (existsSync(npmrcPath)) {
    npmrcExists = true;
    originalNpmrc = readFileSync(npmrcPath, 'utf-8');
    const lines = originalNpmrc.split('\n');
    const modifiedLines = lines.map((line) => {
      if (line.trim().startsWith('@nqlib:registry=')) {
        return `# ${line} # Temporarily disabled for npmjs.com publish`;
      }
      return line;
    });
    writeFileSync(npmrcPath, modifiedLines.join('\n'));
    console.log('📝 Temporarily modified .npmrc');
  }

  try {
    console.log('🔐 Checking npm authentication...');
    try {
      const whoami = execSync('npm whoami --registry=https://registry.npmjs.com', {
        encoding: 'utf-8',
        cwd: rootDir,
        env: {
          ...process.env,
          npm_config_registry: 'https://registry.npmjs.com',
        },
      }).trim();
      console.log(`✅ Logged in as: ${whoami}`);
    } catch {
      console.error('❌ Not logged in to npmjs.com');
      console.error('💡 Please run: npm login --registry=https://registry.npmjs.com');
      console.error(
        '💡 Or create an access token at: https://www.npmjs.com/settings/YOUR_USERNAME/tokens'
      );
      throw new Error('Authentication required. Please login to npmjs.com first.');
    }

    const publishEnv = {
      ...process.env,
      npm_config_registry: 'https://registry.npmjs.com',
    };

    const pkgName = packageJson.name;
    const pkgVersion = packageJson.version;
    if (isVersionAlreadyPublished(pkgName, pkgVersion, rootDir)) {
      throw new Error(
        `Version ${pkgVersion} is already published for ${pkgName}. Bump package.json version before publishing (e.g. npm version patch --no-git-tag-version).`
      );
    }

    const maxAttempts = Math.min(
      5,
      Math.max(1, parseInt(process.env.NPM_PUBLISH_RETRIES || '3', 10) || 3)
    );

    const runPublish = () =>
      new Promise((resolve, reject) => {
        const child = spawn(
          'npm',
          ['publish', '--registry=https://registry.npmjs.com', '--access', 'public'],
          { stdio: 'inherit', cwd: rootDir, env: publishEnv, shell: false }
        );
        child.on('error', reject);
        child.on('close', (code) => {
          if (code === 0) resolve();
          else {
            const err = new Error(`npm publish exited with code ${code}`);
            err.status = code;
            reject(err);
          }
        });
      });

    console.log('📦 Publishing to npmjs.com...');
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await runPublish();
        lastError = null;
        break;
      } catch (e) {
        lastError = e;
        if (attempt < maxAttempts) {
          const wait = attempt * 2000;
          console.warn(
            `⚠️  Publish failed (attempt ${attempt}/${maxAttempts}). Retrying in ${wait / 1000}s (transient TLS/network often succeeds on retry)…`
          );
          await new Promise((r) => setTimeout(r, wait));
        }
      }
    }
    if (lastError) throw lastError;
    console.log('✅ Published to npmjs.com successfully!');
  } catch (error) {
    console.error('❌ Failed to publish to npmjs.com');
    if (error.message && error.message.includes('Authentication required')) {
      throw error;
    }
    if (error.message && error.message.includes('already published')) {
      console.error(`💡 ${error.message}`);
      throw error;
    }
    const errText = `${error.message || ''} ${(error.output && error.output.toString()) || ''}`;
    if (error.status === 404 || errText.includes('404')) {
      console.error('💡 Package not found. This might be the first publish.');
      console.error('💡 Make sure the @nqlib scope exists on npmjs.com');
      console.error('💡 For scoped packages, you need to own the scope or be added to it');
    }
    if (error.status === 401 || errText.includes('401')) {
      console.error(
        '💡 Authentication failed. Please login: npm login --registry=https://registry.npmjs.com'
      );
    }
    printSslTroubleshooting();
    throw error;
  } finally {
    if (originalPublishConfig) {
      packageJson.publishConfig = originalPublishConfig;
    } else {
      delete packageJson.publishConfig;
    }
    if (originalDependencies) {
      packageJson.dependencies = originalDependencies;
    }
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log('🔄 Restored package.json');
    if (npmrcExists && originalNpmrc !== null) {
      writeFileSync(npmrcPath, originalNpmrc);
      console.log('🔄 Restored .npmrc');
    }
  }
}

main().catch((e) => {
  if (e && e.message) console.error(e.message);
  process.exit(1);
});
