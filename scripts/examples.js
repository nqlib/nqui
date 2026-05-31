import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { getPackageRoot } from './getPackageRoot.js';
import { findMainCssFile } from './framework.js';
import { askQuestion } from './wizard.js';

/**
 * Copy Next.js example files to user's project
 */
export async function copyNextJsExamples(framework, { force, sidebar }) {
  if (framework !== 'nextjs') {
    return;
  }

  const root = getPackageRoot();
  const examplesDir = join(root, 'scripts', 'examples');
  const cwd = process.cwd();

  // Determine app directory (src/app or app)
  const appDir = existsSync(join(cwd, 'src', 'app'))
    ? join(cwd, 'src', 'app')
    : join(cwd, 'app');

  // Choose examples based on sidebar flag
  const examples = sidebar
    ? [
        { src: 'nextjs-page-sidebar.tsx', dest: join(appDir, 'page.tsx'), name: 'page.tsx' },
        { src: 'nextjs-layout-sidebar.tsx', dest: join(appDir, 'layout.tsx'), name: 'layout.tsx' },
      ]
    : [
        { src: 'nextjs-page.tsx', dest: join(appDir, 'page.tsx'), name: 'page.tsx' },
        { src: 'nextjs-layout.tsx', dest: join(appDir, 'layout.tsx'), name: 'layout.tsx' },
      ];

  const copied = [];
  const existing = [];

  // Check which files exist
  for (const { dest, name } of examples) {
    if (existsSync(dest)) {
      existing.push({ dest, name });
    }
  }

  // Ask about overwriting if files exist and force is not set
  let shouldOverwrite = force;
  if (existing.length > 0 && !force) {
    const fileList = existing.map(e => e.name).join(' and ');
    const answer = await askQuestion(
      `\n⚠️  ${fileList} already exist(s). Overwrite? (y/n): `
    );
    shouldOverwrite = answer === 'y';
  }

  for (const { src, dest, name } of examples) {
    const srcPath = join(examplesDir, src);

    if (!existsSync(srcPath)) {
      console.warn(`⚠️  Example file not found: ${srcPath}`);
      continue;
    }

    if (existsSync(dest) && !shouldOverwrite) {
      console.log(`⏭️  Skipped: ${dest} (already exists)`);
      continue;
    }

    const content = readFileSync(srcPath, 'utf8');
    writeFileSync(dest, content, 'utf8');
    copied.push(dest);
    console.log(`✅ ${existsSync(dest) && shouldOverwrite ? 'Overwritten' : 'Created'}: ${dest}`);
  }

  if (copied.length > 0) {
    const deps = sidebar
      ? 'npm install @nqlib/nqui tw-animate-css next-themes react-router-dom'
      : 'npm install @nqlib/nqui tw-animate-css next-themes';
    console.log(`\n📝 Required dependencies for example files:`);
    console.log(`   ${deps}\n`);
    if (sidebar) {
      console.log(`   Note: 3-column layout uses Sidebar, TableOfContents; main.tsx includes ThemeProvider + BrowserRouter for Vite.\n`);
    }
  }

  return copied;
}

/**
 * Copy Vite example files to user's project
 */
export async function copyViteExamples(framework, { force, sidebar }) {
  if (framework !== 'vite') {
    return;
  }

  const root = getPackageRoot();
  const examplesDir = join(root, 'scripts', 'examples');
  const cwd = process.cwd();

  // Determine src directory
  const srcDir = existsSync(join(cwd, 'src')) ? join(cwd, 'src') : join(cwd, 'src');
  
  // Ensure src directory exists
  if (!existsSync(srcDir)) {
    console.warn('⚠️  src directory not found');
    return;
  }

  // Choose examples based on sidebar flag (3-column with TOC when sidebar; same files + main for ThemeProvider)
  const examples = [
    { src: 'vite-app.tsx', dest: join(srcDir, 'App.tsx'), name: 'App.tsx' },
    { src: 'vite-main.tsx', dest: join(srcDir, 'main.tsx'), name: 'main.tsx' },
  ];

  const copied = [];
  const existing = [];

  // Check which files exist
  for (const { dest, name } of examples) {
    if (existsSync(dest)) {
      existing.push({ dest, name });
    }
  }

  // Ask about overwriting if files exist and force is not set
  let shouldOverwrite = force;
  if (existing.length > 0 && !force) {
    const fileList = existing.map(e => e.name).join(' and ');
    const answer = await askQuestion(
      `\n⚠️  ${fileList} already exist(s). Overwrite? (y/n): `
    );
    shouldOverwrite = answer === 'y';
  }

  for (const { src, dest, name } of examples) {
    const srcPath = join(examplesDir, src);

    if (!existsSync(srcPath)) {
      console.warn(`⚠️  Example file not found: ${srcPath}`);
      continue;
    }

    if (existsSync(dest) && !shouldOverwrite) {
      console.log(`⏭️  Skipped: ${dest} (already exists)`);
      continue;
    }

    const content = readFileSync(srcPath, 'utf8');
    writeFileSync(dest, content, 'utf8');
    copied.push(dest);
    console.log(`✅ ${existsSync(dest) && shouldOverwrite ? 'Overwritten' : 'Created'}: ${dest}`);
  }

  if (copied.length > 0) {
    const deps = 'npm install @nqlib/nqui tw-animate-css next-themes react-router-dom';
    console.log(`\n📝 Required dependencies for example files:`);
    console.log(`   ${deps}`);
    console.log(`   Note: For Vite, wrap your app with ThemeProvider and BrowserRouter in main.tsx\n`);
  }

  return copied;
}
