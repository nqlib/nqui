#!/usr/bin/env node

/**
 * Build script to extract CSS for package export
 *
 * Generates dist/styles.css with only nqui CSS variables (no framework-specific directives)
 * This file is used for package export: import "@nqlib/nqui/styles"
 *
 * All src/styles/*.css partials are inlined — consumers must not resolve ./styles/* paths.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = resolve(__dirname, '..');
const indexCssPath = join(projectRoot, 'src', 'index.css');
const stylesDir = join(projectRoot, 'src', 'styles');
const outputPath = join(projectRoot, 'dist', 'styles.css');

/** :root merge order — later files must not override earlier token definitions unintentionally. */
const ROOT_PARTIALS = ['z-index.css', 'motion.css', 'shadows.css', 'colors.css'];
const DARK_PARTIALS = ['shadows.css', 'colors.css'];
const COMPONENTS_PARTIALS = ['z-index.css'];

function extractLayerBlock(css, layerName) {
  const layerStart = css.indexOf(`@layer ${layerName}`);
  if (layerStart === -1) return '';
  const firstBrace = css.indexOf('{', layerStart);
  if (firstBrace === -1) return '';
  let depth = 1;
  let i = firstBrace + 1;
  while (i < css.length && depth > 0) {
    const ch = css[i];
    if (ch === '{') depth++;
    if (ch === '}') depth--;
    i++;
  }
  if (depth !== 0) return '';
  return css.slice(firstBrace + 1, i - 1).trim();
}

function extractRootContent(css) {
  const match = css.match(/:root\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/s);
  return match ? match[1].trim() : '';
}

function extractDarkContent(css) {
  const match = css.match(/\.dark\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/s);
  return match ? match[1].trim() : '';
}

/** @layer base content outside :root / .dark (e.g. prefers-reduced-motion). */
function extractBaseExtras(css) {
  const baseLayer = extractLayerBlock(css, 'base');
  if (!baseLayer) return '';
  return baseLayer
    .replace(/:root\s*\{[^}]+(?:\{[^}]*\}[^}]*)*\}/gs, '')
    .replace(/\.dark\s*\{[^}]+(?:\{[^}]*\}[^}]*)*\}/gs, '')
    .trim();
}

function readPartial(filename) {
  const path = join(stylesDir, filename);
  if (!existsSync(path)) {
    throw new Error(`Style partial not found: ${path}`);
  }
  return readFileSync(path, 'utf-8');
}

function mergeRootSections(...sections) {
  return sections.filter(Boolean).join('\n\n    ');
}

function extractStandaloneCSS() {
  if (!existsSync(indexCssPath)) {
    throw new Error(`Source CSS file not found: ${indexCssPath}`);
  }

  const hitAreaCssPath = join(stylesDir, 'hit-area.css');
  let hitAreaCss = '';
  if (existsSync(hitAreaCssPath)) {
    hitAreaCss = readFileSync(hitAreaCssPath, 'utf-8').trimEnd();
  }

  let indexCss = readFileSync(indexCssPath, 'utf-8');

  const partialRoots = ROOT_PARTIALS.map((file) => {
    const css = readPartial(file);
    return extractRootContent(css);
  });

  const partialDarks = DARK_PARTIALS.map((file) => {
    const css = readPartial(file);
    return extractDarkContent(css);
  });

  const baseExtras = ROOT_PARTIALS.map((file) => extractBaseExtras(readPartial(file)))
    .filter(Boolean)
    .join('\n\n');

  const componentLayerContent = COMPONENTS_PARTIALS.map((file) =>
    extractLayerBlock(readPartial(file), 'components')
  )
    .filter(Boolean)
    .join('\n\n');

  // Extract @source inline() directives BEFORE stripping index.css
  const sourceInlineRegex =
    /\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\/\s*@source\s+inline\("[^"]*"\)\s*;/g;
  const sourceInlineMatches = indexCss.match(sourceInlineRegex) || [];

  const sourceInlineDirectives = sourceInlineMatches
    .map((directive) => {
      const commentMatch = directive.match(/(\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\/)/);
      const comment = commentMatch ? commentMatch[1] : '';

      const classRegex = /"([^"]+)"/g;
      const classes = [];
      let match;
      while ((match = classRegex.exec(directive)) !== null) {
        classes.push(match[1]);
      }

      if (classes.length > 0) {
        const formatted = `@source inline("${classes.join(' ')}");`;
        return comment ? `${comment}\n${formatted}` : formatted;
      }

      return directive;
    })
    .join('\n\n');

  indexCss = indexCss
    .replace(/@import\s+["']tailwindcss["'];?\s*\n/g, '')
    .replace(/@import\s+["']tw-animate-css["'];?\s*\n/g, '')
    .replace(/@import\s+["']shadcn\/tailwind\.css["'];?\s*\n/g, '')
    .replace(/@import\s+["']@fontsource-variable\/inter["'];?\s*\n/g, '')
    .replace(/@import\s+["']\.\/styles\/[^"']+["'];?\s*(?:\/\*[^*]*\*\/\s*)?\n/g, '')
    .replace(/\/\*\s*Token system[\s\S]*?\*\/\s*\n/g, '')
    .replace(/\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\/\s*@source\s+inline\("[^"]*"\)\s*;/g, '')
    .replace(/@source\s+(?!inline\()[^;]+;?\s*\n/g, '')
    .replace(/@custom-variant\s+[^\n]+;\s*\n/g, '');

  if (hitAreaCss) {
    indexCss = indexCss.replace(
      /@theme inline\s*\{/,
      `/* Hit-area — https://bazza.dev/craft/2026/hit-area */\n${hitAreaCss}\n\n@theme inline {`
    );
  }

  const indexRootContent = extractRootContent(indexCss);
  const indexDarkContent = extractDarkContent(indexCss);

  const mergedRootContent = mergeRootSections(...partialRoots, indexRootContent);
  const mergedDarkContent = mergeRootSections(...partialDarks, indexDarkContent);

  if (indexRootContent) {
    indexCss = indexCss.replace(
      /:root\s*\{[^}]+(?:\{[^}]*\}[^}]*)*\}/s,
      `:root {\n    ${mergedRootContent}\n}`
    );
  }

  if (indexDarkContent) {
    indexCss = indexCss.replace(
      /\.dark\s*\{[^}]+(?:\{[^}]*\}[^}]*)*\}/s,
      `.dark {\n    ${mergedDarkContent}\n}`
    );
  }

  // Remove duplicate @layer base blocks (identical copies)
  const lines = indexCss.split('\n');
  let inLayerBase = false;
  let layerBaseStart = -1;
  let braceCount = 0;
  const layerBaseBlocks = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('@layer base')) {
      if (!inLayerBase) {
        inLayerBase = true;
        layerBaseStart = i;
        braceCount = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
      } else {
        braceCount += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
      }
    } else if (inLayerBase) {
      braceCount += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
      if (braceCount === 0) {
        layerBaseBlocks.push({ start: layerBaseStart, end: i });
        inLayerBase = false;
      }
    }
  }

  if (layerBaseBlocks.length > 1) {
    const firstBlock = layerBaseBlocks[0];
    const firstBlockContent = lines.slice(firstBlock.start, firstBlock.end + 1).join('\n');

    const allIdentical = layerBaseBlocks.every((block) => {
      const blockContent = lines.slice(block.start, block.end + 1).join('\n');
      return blockContent === firstBlockContent;
    });

    if (allIdentical) {
      for (let i = layerBaseBlocks.length - 1; i > 0; i--) {
        const block = layerBaseBlocks[i];
        lines.splice(block.start, block.end - block.start + 1);
      }
      indexCss = lines.join('\n');
    }
  }

  let combinedCss = indexCss;
  if (combinedCss.includes(':root') && !combinedCss.includes('nqui Color System')) {
    const rootIndex = combinedCss.indexOf(':root');
    combinedCss =
      combinedCss.slice(0, rootIndex) +
      '/* ============================================\n' +
      '   nqui Color System & Design Tokens\n' +
      '   ============================================ */\n\n' +
      combinedCss.slice(rootIndex);
  }

  if (baseExtras) {
    combinedCss += '\n\n/* Base layer extras (motion, etc.) */\n@layer base {\n' + baseExtras + '\n}\n';
  }

  if (componentLayerContent) {
    combinedCss +=
      '\n\n/* Component surface styles (from src/styles/z-index.css) */\n@layer components {\n' +
      componentLayerContent +
      '\n}\n';
  }

  combinedCss = combinedCss.replace(/\n{4,}/g, '\n\n\n');

  const header = `/* nqui Design System CSS
 *
 * This file contains ALL design tokens, CSS variables, and color scales from nqui.
 * It includes everything the library needs to style components correctly.
 *
 * IMPORTANT: This file does NOT include Tailwind CSS imports or framework-specific directives.
 * You must have Tailwind CSS configured in your project and add the appropriate imports.
 *
 * This file includes:
 * - All CSS variables (--primary, --background, --foreground, etc.)
 * - Complete color scales (100-600) for all semantic colors
 * - Light and dark mode support
 * - Z-index, motion, and shadow tokens
 * - Base layer styles
 * - Utility animations
 * - Hit-area @utility blocks (inlined from src/styles/hit-area.css)
 * - @source inline() directives for zero-config Tailwind utility generation
 * - .nqui-card / .nqui-elevated component classes
 *
 * Generated by: npm run build:lib
 * Do not edit manually
 */

`;

  const sourceInlineSection = sourceInlineDirectives
    ? `/* Tailwind utility declarations - zero-config setup\n` +
      ` * These @source inline() directives ensure all nqui utilities are generated\n` +
      ` * without requiring consumers to add @source directives in their CSS.\n` +
      ` */\n\n${sourceInlineDirectives}\n\n`
    : '';

  return header + sourceInlineSection + combinedCss;
}

function assertNoStyleImports(css) {
  if (/@import\s+["']\.\/styles\//.test(css)) {
    throw new Error(
      'dist/styles.css still contains @import "./styles/..." — partials must be fully inlined before publish.'
    );
  }
}

function main() {
  try {
    const distDir = dirname(outputPath);
    if (!existsSync(distDir)) {
      throw new Error(`Dist directory not found: ${distDir}. Run build first.`);
    }

    const standaloneCss = extractStandaloneCSS();
    assertNoStyleImports(standaloneCss);
    writeFileSync(outputPath, standaloneCss, 'utf-8');
    console.log(`✅ Generated ${outputPath}`);
  } catch (error) {
    console.error('❌ Error generating styles.css:', error.message);
    process.exit(1);
  }
}

main();
