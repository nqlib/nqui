#!/usr/bin/env node

/**
 * nqui CSS initialization CLI
 *
 * Usage:
 *   npx nqui init-css [output.css] [options]
 */

import minimist from 'minimist';
import { resolve, dirname } from 'path';
import { readFileSync, existsSync } from 'fs';
import { getPackageRoot } from './getPackageRoot.js';
import { printHelp } from './help.js';
import { runPipeline } from './pipeline/index.js';
import { wizard, askAboutExamples } from './wizard.js';
import { detectFramework, findMainCssFile } from './framework.js';
import { generateSetupContent } from './setup-helper.js';
import { copyNextJsExamples, copyViteExamples } from './examples.js';
import { emit } from './pipeline/emit.js';

// Guard: if first arg is a subcommand, user has old package (main bin was init-css). Redirect.
const firstArg = process.argv[2];
const subcommands = ['init-cursor', 'init-skills', 'install-peers', 'init-debug', 'init-debug-css', 'setup'];
if (subcommands.includes(firstArg)) {
  console.error(`
❌ Outdated @nqlib/nqui — "npx @nqlib/nqui ${firstArg}" routed to init-css.

   Fix: npm install @nqlib/nqui@latest
   Then: npx @nqlib/nqui ${firstArg}

   Or run the binary directly: npm exec nqui-init-skills (for init-skills), etc.
`);
  process.exit(1);
}

// Filter out command names from argv (so they are never used as output path)
const commandNames = ['init-css', 'init-skills', 'nqui', 'nqui-init-css'];
const filteredArgs = process.argv.slice(2).filter(arg => !commandNames.includes(arg));

const args = minimist(filteredArgs, {
  boolean: ['js', 'tokens-only', 'force', 'dry-run', 'wizard', 'setup', 'help', 'version', 'local-copy', 'sidebar'],
  alias: { h: 'help', v: 'version' },
});

if (args.help) {
  printHelp();
  process.exit(0);
}

if (args.version) {
  const root = getPackageRoot();
  const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
  console.log(pkg.version);
  process.exit(0);
}

// Prevent subcommand names or bare filenames from becoming output path (would e.g. create init-skills or root nqui-setup.css)
const rawOutput = args._[0] || 'nqui/index.css';
const output = !rawOutput || rawOutput === 'init-skills' || rawOutput === 'init-cursor' || !dirname(rawOutput)
  ? 'nqui/index.css'
  : rawOutput;

/**
 * Generate index.css that imports from library package
 */
function generateIndexCssContent() {
  return `/* nqui Design System
 *
 * This file imports nqui styles from the library package.
 * Import this file in your main CSS file (e.g. globals.css)
 *
 * Usage in your globals.css:
 *   @import "./nqui/index.css";
 */

@import "@nqlib/nqui/styles";
`;
}

(async () => {
  try {
    const root = getPackageRoot();
    const framework = detectFramework();
    const wiz = args.wizard ? await wizard() : {};

    const outCssPath = resolve(process.cwd(), output);
    const useLibraryImport = !args['local-copy']; // Default to library import

    if (useLibraryImport) {
      // Create index.css that imports from library
      const indexCssContent = generateIndexCssContent();
      emit(outCssPath, indexCssContent, { force: args.force, dryRun: args['dry-run'] });
    } else {
      // Original behavior: generate local copy
      await runPipeline({
        root,
        outCss: outCssPath,
        outJs: args.js || wiz.js
          ? resolve(process.cwd(), output.replace('.css', '.tokens.js'))
          : null,
        tokensOnly: args['tokens-only'] || wiz.tokensOnly,
        force: args.force,
        dryRun: args['dry-run'],
      });
    }

    // Generate setup helper file (always, unless dry-run). Always under nqui/ to avoid writing to project root.
    if (!args['dry-run'] && (args.setup || !args['tokens-only'])) {
      const setupContent = generateSetupContent(framework, output, useLibraryImport);
      const setupDir = dirname(output) || 'nqui';
      const setupPath = resolve(process.cwd(), setupDir, 'nqui-setup.css');
      emit(setupPath, setupContent, { force: args.force, dryRun: false });

      const mainCssFile = findMainCssFile(framework);

      console.log(`\n📝 Next steps:`);
      console.log(`   1. Copy the contents of ${setupDir}/nqui-setup.css`);
      console.log(`   2. Paste them at the VERY TOP of your main CSS file`);
      console.log(`      (e.g. ${mainCssFile})\n`);
    }

    // Copy examples: when --sidebar and --force, auto-enable so nqui:init is non-interactive
    let shouldCopyExamples = wiz.copyExamples;
    let useSidebar = wiz.sidebarLayout || args.sidebar;
    if (!args.wizard && (framework === 'nextjs' || framework === 'vite')) {
      if (args.sidebar && args.force) {
        shouldCopyExamples = true;
        useSidebar = true;
      } else if (!args['dry-run'] && !shouldCopyExamples) {
        shouldCopyExamples = await askAboutExamples(framework, useSidebar);
        if (shouldCopyExamples) {
          const sidebarAnswer = await askQuestion('\n🎨 Use sidebar layout (recommended for apps)? (y/n): ');
          useSidebar = sidebarAnswer === 'y' || sidebarAnswer === 'yes';
        }
      }
    }

    // Copy example files if requested
    if (!args['dry-run'] && shouldCopyExamples) {
      let copied;
      if (framework === 'nextjs') {
        copied = await copyNextJsExamples(framework, { force: args.force, sidebar: useSidebar });
      } else if (framework === 'vite') {
        copied = await copyViteExamples(framework, { force: args.force, sidebar: useSidebar });
      }
      if (copied && copied.length === 0) {
        // Files were skipped (user said no to overwrite)
        console.log('\n⏭️  Example files skipped. Run with --force to overwrite existing files.\n');
      }
    }

    if (!args['dry-run']) {
      console.log(`\n✅ nqui installed successfully`);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
