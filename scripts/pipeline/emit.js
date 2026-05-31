import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname } from 'path';

/**
 * Emit file with force and dry-run support
 */
export function emit(path, content, { force, dryRun }) {
  if (existsSync(path) && !force) {
    throw new Error(`File exists: ${path}. Use --force to overwrite.`);
  }

  if (dryRun) {
    console.log(`🧪 Dry-run: Would write ${path} (${content.length} bytes)`);
    return;
  }

  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, 'utf8');
  console.log(`✅ Created: ${path}`);
}

