import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const uiDir = join(rootDir, 'src/components/ui');
const indexFile = join(rootDir, 'src/index.ts');

// Read index.ts to find all export statements
const indexContent = readFileSync(indexFile, 'utf-8');

// Extract export statements
const exportRegex = /export\s+{([^}]+)}\s+from\s+["']\.\/components\/ui\/([^"']+)["']/g;
const exports = [];
let match;

while ((match = exportRegex.exec(indexContent)) !== null) {
  const exportsList = match[1].split(',').map(e => e.trim());
  const filePath = match[2];
  exports.push({ file: filePath, exports: exportsList });
}

console.log('🔍 Validating exports...\n');

const errors = [];

for (const { file, exports: expectedExports } of exports) {
  // Try .tsx first, then .ts
  let filePath = join(uiDir, `${file}.tsx`);
  if (!filePath.includes('.')) {
    filePath = join(uiDir, `${file}.tsx`);
  }

  try {
    // Check if file exists, try .ts if .tsx doesn't exist
    let fileContent;
    try {
      fileContent = readFileSync(filePath, 'utf-8');
    } catch (e) {
      if (e.code === 'ENOENT') {
        filePath = join(uiDir, `${file}.ts`);
        fileContent = readFileSync(filePath, 'utf-8');
      } else {
        throw e;
      }
    }

    // Extract actual exports from the file
    const actualExportRegex = /export\s+{([^}]+)}\s+from|export\s+(?:const|function|class|type|interface)\s+(\w+)/g;
    const actualExports = new Set();

    // Check for named exports in export { ... } statements
    const namedExportRegex = /export\s+{([^}]+)}/g;
    let namedMatch;
    while ((namedMatch = namedExportRegex.exec(fileContent)) !== null) {
      const exports = namedMatch[1].split(',').map(e => e.trim().split(/\s+as\s+/)[0].trim());
      exports.forEach(exp => actualExports.add(exp));
    }

    // Check for direct exports: export function/const/class
    const directExportRegex = /export\s+(?:const|function|class|type|interface)\s+(\w+)/g;
    let directMatch;
    while ((directMatch = directExportRegex.exec(fileContent)) !== null) {
      actualExports.add(directMatch[1]);
    }

    // Check for default exports that might be re-exported
    const defaultExportRegex = /export\s+default\s+(\w+)/;
    const defaultMatch = defaultExportRegex.exec(fileContent);
    if (defaultMatch) {
      actualExports.add(defaultMatch[1]);
    }

    // Validate each expected export
    for (const expected of expectedExports) {
      // Handle type exports and aliases, skip empty strings
      const exportName = expected.split(/\s+as\s+/)[0].trim();

      if (!exportName || exportName === '') continue;

      if (!actualExports.has(exportName)) {
        errors.push({
          file,
          missing: exportName,
          available: Array.from(actualExports).sort()
        });
      }
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      errors.push({ file, error: 'File not found' });
    } else {
      errors.push({ file, error: err.message });
    }
  }
}

if (errors.length > 0) {
  console.log('❌ Found export errors:\n');
  errors.forEach(({ file, missing, available, error }) => {
    if (error) {
      console.log(`  ${file}: ${error}`);
    } else {
      console.log(`  ${file}: Missing export "${missing}"`);
      if (available && available.length > 0) {
        console.log(`    Available exports: ${available.join(', ')}`);
      }
    }
  });
  process.exit(1);
} else {
  console.log('✅ All exports are valid!');
  process.exit(0);
}

