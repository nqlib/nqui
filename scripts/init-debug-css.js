#!/usr/bin/env node

/**
 * nqui debug CSS initialization script
 *
 * Copies the debug CSS file to the user's project.
 * Usage: npx nqui init-debug-css [target-path]
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get the project root (where package.json is)
const projectRoot = resolve(__dirname, '..');
const cssSourcePath = join(projectRoot, 'dist', 'nqui.css');

// Default target paths for common frameworks
const defaultTargets = {
  nextjs: 'app/globals.css', // or styles/globals.css
  vite: 'src/index.css',
  remix: 'app/root.css',
  'create-react-app': 'src/index.css',
};

function findProjectType() {
  // Check for framework-specific files
  if (existsSync(join(process.cwd(), 'next.config.js')) ||
      existsSync(join(process.cwd(), 'next.config.ts'))) {
    return 'nextjs';
  }
  if (existsSync(join(process.cwd(), 'vite.config.js')) ||
      existsSync(join(process.cwd(), 'vite.config.ts'))) {
    return 'vite';
  }
  if (existsSync(join(process.cwd(), 'remix.config.js'))) {
    return 'remix';
  }
  if (existsSync(join(process.cwd(), 'src', 'index.css'))) {
    return 'create-react-app';
  }
  return null;
}

function main() {
  const args = process.argv.slice(2);
  const targetPath = args[0];

  // Check if CSS source exists
  if (!existsSync(cssSourcePath)) {
    console.error('❌ Error: nqui.css not found in dist folder.');
    console.error('   Please run "npm run build:lib" first to build the library.');
    process.exit(1);
  }

  let finalTargetPath;

  if (targetPath) {
    // User provided a custom path
    finalTargetPath = resolve(process.cwd(), targetPath);
  } else {
    // Auto-detect project type
    const projectType = findProjectType();

    if (projectType) {
      const defaultPath = defaultTargets[projectType];
      finalTargetPath = resolve(process.cwd(), defaultPath);
      console.log(`📦 Detected ${projectType} project`);
      console.log(`   Using default path: ${defaultPath}`);
    } else {
      // Fallback: create a new CSS file
      finalTargetPath = resolve(process.cwd(), 'nqui-debug.css');
      console.log('⚠️  Could not detect project type.');
      console.log(`   Creating standalone file: nqui-debug.css`);
      console.log('   You can import this file manually in your app.');
    }
  }

  // Read the CSS file
  const cssContent = readFileSync(cssSourcePath, 'utf-8');

  // Create target directory if it doesn't exist
  const targetDir = dirname(finalTargetPath);
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  // Check if target file exists
  if (existsSync(finalTargetPath)) {
    console.log(`⚠️  File already exists: ${finalTargetPath}`);
    console.log('   The CSS will be appended to the existing file.');

    // Append import statement instead of overwriting
    const existingContent = readFileSync(finalTargetPath, 'utf-8');
    const importStatement = '\n\n/* nqui debug tools CSS - imported via init script */\n';

    if (!existingContent.includes('nqui-debug') && !existingContent.includes('data-debug-panel')) {
      writeFileSync(finalTargetPath, existingContent + importStatement + cssContent, 'utf-8');
      console.log(`✅ Appended nqui debug CSS to: ${finalTargetPath}`);
    } else {
      console.log('   CSS already imported. Skipping...');
    }
  } else {
    // Create new file
    writeFileSync(finalTargetPath, cssContent, 'utf-8');
    console.log(`✅ Created: ${finalTargetPath}`);
  }

  // Provide next steps
  console.log('\n📝 Next steps:');
  console.log('   1. Import the CSS in your app entry point:');
  console.log(`      import './${finalTargetPath.replace(process.cwd() + '/', '')}'`);
  console.log('   2. Use DebugPanel in your app:');
  console.log('      import { DebugPanel } from "@nqlib/nqui"');
  console.log('      // Or tree-shake debug out of production: import { DebugPanel } from "@nqlib/nqui/debug"');
  console.log('   3. Add <DebugPanel /> to your root layout (panel is inactive until the user opens it).');
  console.log('      Wrapping in process.env.NODE_ENV or import.meta.env.DEV is optional.');
  console.log('\n✨ Done!');
}

main();

