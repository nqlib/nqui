import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

/**
 * Robust package root detection that works with npx
 * Uses fileURLToPath for Windows compatibility
 */
export function getPackageRoot() {
  const __filename = fileURLToPath(import.meta.url);
  let dir = dirname(__filename);

  while (dir !== '/' && dir !== '') {
    const pkgPath = join(dir, 'package.json');
    if (existsSync(pkgPath)) {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
      if (pkg.name === '@nqlib/nqui') return dir;
    }
    const parentDir = dirname(dir);
    if (parentDir === dir) break; // Reached root
    dir = parentDir;
  }

  throw new Error('Could not locate @nqlib/nqui package root');
}

