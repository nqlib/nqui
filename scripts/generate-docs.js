/**
 * Generates downloadable documentation files for nqui.
 * 
 * Outputs:
 * - INSTALL.md: Installation instructions
 * - COMPONENTS.md: All component documentation bundled
 * 
 * Usage:
 *   node scripts/generate-docs.js
 *   node scripts/generate-docs.js --install
 *   node scripts/generate-docs.js --components
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOCS_DIR = join(__dirname, '../docs');
/** Maintainer-only notes; not under docs/ so they are not shipped in the npm `docs` bundle. */
const INTERNAL_NOTES_DIR = join(__dirname, '../internal-notes');
const OUTPUT_DIR = join(__dirname, '../dist/docs');

// Ensure output directory exists
import { mkdirSync, rmSync } from 'fs';

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function readDoc(filePath) {
  try {
    return readFileSync(filePath, 'utf-8');
  } catch (e) {
    return null;
  }
}

function generateInstallDoc() {
  const installPath = join(INTERNAL_NOTES_DIR, 'INSTALLATION.md');
  let content = readDoc(installPath);
  
  if (!content) {
    console.error('Could not find INSTALLATION.md');
    return null;
  }
  
  // Add header
  const header = `# @nqlib/nqui Installation Guide

> Generated for LLM consumption. Use this file to understand how to install and set up nqui.

`;
  
  return header + content;
}

function generateComponentsDoc() {
  // Read the main README for shared conventions
  const readmePath = join(DOCS_DIR, 'components/README.md');
  let readmeContent = readDoc(readmePath);
  
  if (!readmeContent) {
    console.error('Could not find README.md');
    return null;
  }
  
  // Extract sections from README that are useful for implementation
  // (Prerequisites, Shared Conventions, When to Use tables)
  const sectionsToKeep = [
    '# nqui Component Instructions',
    '## Prerequisites',
    '## Shared Conventions',
    '## When to Use',
    '## AI Implementation Checklist'
  ];
  
  // Build the content
  let content = `# @nqlib/nqui Component Reference

> Generated for LLM consumption. Use this file when implementing nqui components.

**Import:** \`import { X } from "@nqlib/nqui"\`  
**CSS:** \`@import "@nqlib/nqui/styles"\` (via \`npx @nqlib/nqui init-css\`)

---

`;
  
  // Add the main sections from README
  let currentSection = '';
  const lines = readmeContent.split('\n');
  
  for (const line of lines) {
    // Track current section
    if (line.startsWith('##')) {
      currentSection = line;
    }
    
    // Keep specific sections
    if (sectionsToKeep.some(s => line.includes(s) || currentSection.includes(s.replace('## ', '').replace('# ', '')))) {
      content += line + '\n';
    }
  }
  
  // Add component docs
  content += '\n---\n\n## Component Documentation\n\n';
  
  const componentsDir = join(DOCS_DIR, 'components');
  const files = readdirSync(componentsDir)
    .filter(f => f.startsWith('nqui-') && f.endsWith('.md'))
    .sort();
  
  for (const file of files) {
    const componentPath = join(componentsDir, file);
    const componentContent = readDoc(componentPath);
    
    if (componentContent) {
      // Extract the relevant part (without frontmatter if present)
      let docContent = componentContent;
      
      // Remove frontmatter
      if (docContent.startsWith('---')) {
        const endOfFm = docContent.indexOf('---', 3);
        if (endOfFm !== -1) {
          docContent = docContent.substring(endOfFm + 3);
        }
      }
      
      // Clean up and add
      docContent = docContent.trim();
      content += docContent + '\n\n---\n\n';
    }
  }
  
  return content;
}

function main() {
  const args = process.argv.slice(2);
  const generateInstall = args.includes('--install') || args.length === 0;
  const generateComponents = args.includes('--components') || args.length === 0;
  
  ensureDir(OUTPUT_DIR);
  
  console.log('Generating nqui documentation...\n');
  
  if (generateInstall) {
    const installDoc = generateInstallDoc();
    if (installDoc) {
      const outputPath = join(OUTPUT_DIR, 'INSTALL.md');
      writeFileSync(outputPath, installDoc);
      console.log(`Generated: ${outputPath}`);
    }
  }
  
  if (generateComponents) {
    const componentsDoc = generateComponentsDoc();
    if (componentsDoc) {
      const outputPath = join(OUTPUT_DIR, 'COMPONENTS.md');
      writeFileSync(outputPath, componentsDoc);
      console.log(`Generated: ${outputPath}`);
    }
  }
  
  console.log('\nDone!');
}

main();
