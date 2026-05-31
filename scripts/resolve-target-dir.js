/**
 * Resolves the best directory to write .cursor/ into.
 * Prefers a directory where node_modules/@nqlib/nqui exists (so docs path works).
 *
 * Used by init-cursor and post-install for monorepo support.
 */

import { existsSync, readFileSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';

function hasNquiInNodeModules(dir) {
  return existsSync(resolve(dir, 'node_modules/@nqlib/nqui'));
}

function hasNquiInPackageJson(dir) {
  try {
    const pkg = JSON.parse(readFileSync(resolve(dir, 'package.json'), 'utf8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    return !!deps['@nqlib/nqui'];
  } catch {
    return false;
  }
}

function findWorkspaceRoot(startDir) {
  let dir = resolve(startDir);
  for (let i = 0; i < 20; i++) {
    if (existsSync(resolve(dir, 'pnpm-workspace.yaml'))) return dir;
    const pkgPath = resolve(dir, 'package.json');
    if (existsSync(pkgPath) && readFileSync(pkgPath, 'utf8').includes('"workspaces"')) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

function getWorkspacePackageDirs(workspaceRoot) {
  const dirs = [];
  const candidates = ['packages', 'apps', 'packages/*', 'apps/*'];
  for (const base of ['packages', 'apps']) {
    const basePath = resolve(workspaceRoot, base);
    if (!existsSync(basePath)) continue;
    try {
      const entries = readdirSync(basePath, { withFileTypes: true });
      for (const e of entries) {
        if (e.isDirectory()) {
          const pkgDir = resolve(basePath, e.name);
          if (existsSync(resolve(pkgDir, 'package.json'))) {
            dirs.push(pkgDir);
          }
        }
      }
    } catch {}
  }
  return dirs;
}

function isNquiSourceDir(dir) {
  // Must NOT be inside node_modules (that means we're installed as a dep, not dev source)
  if (resolve(dir).includes('node_modules')) return false;
  return existsSync(resolve(dir, 'docs/components/README.md')) &&
    existsSync(resolve(dir, 'package.json')) &&
    readFileSync(resolve(dir, 'package.json'), 'utf8').includes('"name": "@nqlib/nqui"');
}

function findProjectRootFromNodeModules(startDir) {
  let dir = resolve(startDir);
  for (let i = 0; i < 20; i++) {
    if (existsSync(resolve(dir, 'node_modules/@nqlib/nqui'))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

/**
 * Returns the directory where .cursor/ should be written.
 * Prefers a dir with node_modules/@nqlib/nqui so docs path resolves.
 *
 * @param {string} startDir - Usually process.cwd()
 * @returns {string} Absolute path to target directory
 */
export function resolveTargetDir(startDir) {
  let cwd = resolve(startDir);

  // 0. Running from node_modules (postinstall as dep) -> use host project root
  if (cwd.includes('node_modules')) {
    const projectRoot = findProjectRootFromNodeModules(cwd);
    if (projectRoot) return projectRoot;
  }

  // 1. Current dir has nqui in node_modules -> use it
  if (hasNquiInNodeModules(cwd)) return cwd;

  // 2. Current dir is nqui source (developing the library) -> use it
  if (isNquiSourceDir(cwd)) return cwd;

  // 3. Current dir has nqui in package.json (might be hoisted) -> use it
  if (hasNquiInPackageJson(cwd)) return cwd;

  // 4. Monorepo: find a workspace package that has nqui
  const workspaceRoot = findWorkspaceRoot(cwd);
  if (workspaceRoot) {
    const pkgDirs = getWorkspacePackageDirs(workspaceRoot);
    for (const dir of pkgDirs) {
      if (hasNquiInNodeModules(dir) || hasNquiInPackageJson(dir)) {
        return dir;
      }
    }
  }

  // 5. Fallback: use cwd (rule created; docs path may need manual fix)
  return cwd;
}
