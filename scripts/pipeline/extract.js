import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Extract CSS from package
 * Handles both published (dist/styles.css) and local development (src/index.css + src/styles/colors.css)
 */
export function extractCSS(root) {
  const dist = join(root, 'dist', 'styles.css');
  const srcIndex = join(root, 'src', 'index.css');
  const srcColors = join(root, 'src', 'styles', 'colors.css');

  // If published package, use dist/styles.css
  if (existsSync(dist)) {
    return readFileSync(dist, 'utf8');
  }

  // Local development: merge index.css and colors.css
  if (existsSync(srcIndex) && existsSync(srcColors)) {
    let indexCss = readFileSync(srcIndex, 'utf8');
    let colorsCss = readFileSync(srcColors, 'utf8');

    // Extract :root and .dark from colors.css (wrapped in @layer base)
    const colorsRootMatch = colorsCss.match(/@layer base\s*\{\s*:root\s*\{([\s\S]*?)\}\s*\.dark\s*\{([\s\S]*?)\}\s*\}/s);

    let colorsRootContent = '';
    let colorsDarkContent = '';

    if (colorsRootMatch) {
      colorsRootContent = colorsRootMatch[1].trim();
      colorsDarkContent = colorsRootMatch[2].trim();
    } else {
      // Fallback: try to extract without @layer base wrapper
      const rootMatch = colorsCss.match(/:root\s*\{([\s\S]*?)\}/s);
      const darkMatch = colorsCss.match(/\.dark\s*\{([\s\S]*?)\}/s);
      if (rootMatch) colorsRootContent = rootMatch[1].trim();
      if (darkMatch) colorsDarkContent = darkMatch[1].trim();
    }

    // Extract from index.css
    const indexRootMatch = indexCss.match(/:root\s*\{([\s\S]*?)\}/s);
    const indexDarkMatch = indexCss.match(/\.dark\s*\{([\s\S]*?)\}/s);

    const indexRoot = indexRootMatch ? indexRootMatch[1].trim() : '';
    const indexDark = indexDarkMatch ? indexDarkMatch[1].trim() : '';

    // Merge: colors first, then index
    const mergedRoot = [colorsRootContent, indexRoot].filter(Boolean).join('\n\n');
    const mergedDark = [colorsDarkContent, indexDark].filter(Boolean).join('\n\n');

    // Clean up imports and Tailwind v4 directives we don't want in standalone file
    indexCss = indexCss
      .replace(/@import\s+["']tailwindcss["'];?\s*\n/g, '')
      .replace(/@import\s+["']tw-animate-css["'];?\s*\n/g, '')
      .replace(/@import\s+["'].*shadcn.*["'];?\s*\n/g, '')
      .replace(/@import\s+["'].*@fontsource-variable\/inter["'];?\s*\n/g, '')
      .replace(/@import\s+["'].*\/colors\.css["'];?\s*\n/g, '')
      .replace(/\/\*\s*Import enhanced color system\s*\*\//g, '')
      .replace(/@source\s+[^;]+;?\s*\n/g, '')
      .replace(/@custom-variant\s+[^;]+;?\s*\n/g, '')
      .replace(/@theme\s+inline\s*\{[\s\S]*?\}\s*/g, '');

    // Helper function to extract complete CSS block (handles nested braces)
    function extractBlock(css, pattern) {
      const match = css.match(pattern);
      if (!match) return null;
      const start = match.index;
      let depth = 0;
      let i = start + match[0].indexOf('{');
      while (i < css.length) {
        if (css[i] === '{') depth++;
        if (css[i] === '}') {
          depth--;
          if (depth === 0) {
            return css.substring(start, i + 1);
          }
        }
        i++;
      }
      return null;
    }

    // Extract blocks using brace counting
    const existingRoot = extractBlock(indexCss, /:root\s*\{/s) || '';
    const existingDark = extractBlock(indexCss, /\.dark\s*\{/s) || '';
    const layerBaseMatch = indexCss.match(/@layer base\s*\{/g);
    const layerBaseBlocks = layerBaseMatch ? layerBaseMatch.map(m => extractBlock(indexCss, new RegExp(m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 's'))).filter(Boolean).join('\n\n') : '';
    const layerUtilitiesMatch = indexCss.match(/@layer utilities\s*\{/g);
    const layerUtilitiesBlocks = layerUtilitiesMatch ? layerUtilitiesMatch.map(m => extractBlock(indexCss, new RegExp(m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 's'))).filter(Boolean).join('\n\n') : '';

    // Remove extracted blocks to get remaining content
    let remainingCss = indexCss;
    if (existingRoot) remainingCss = remainingCss.replace(existingRoot, '');
    if (existingDark) remainingCss = remainingCss.replace(existingDark, '');
    if (layerBaseBlocks) remainingCss = remainingCss.replace(layerBaseBlocks, '');
    if (layerUtilitiesBlocks) remainingCss = remainingCss.replace(layerUtilitiesBlocks, '');
    remainingCss = remainingCss.trim();

    // Create :root and .dark blocks from merged content (prefer merged over existing)
    const rootBlock = mergedRoot ? `:root {\n${mergedRoot}\n}` : existingRoot;
    const darkBlock = mergedDark ? `.dark {\n${mergedDark}\n}` : existingDark;

    // Reconstruct in correct order: :root, .dark, then @layer blocks, then rest
    // This is critical because @layer base uses @apply which needs CSS variables to be defined first
    const reorderedCss = [
      rootBlock,
      darkBlock,
      layerBaseBlocks,
      layerUtilitiesBlocks,
      remainingCss
    ].filter(Boolean).join('\n\n');

    return reorderedCss.trim();
  }

  throw new Error('No CSS source found. Expected dist/styles.css or src/index.css + src/styles/colors.css');
}

