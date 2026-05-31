import { extractCSS } from './extract.js';
import { transformCSS } from './transform.js';
import { extractTokens, tokensToJS } from './tokens.js';
import { emit } from './emit.js';

const header = `/**
 * nqui Design Tokens
 *
 * Auto-generated file — do not edit manually.
 * Regenerate with: npx nqui init-css
 */\n\n`;

/**
 * Reorder CSS to ensure :root and .dark come before @layer blocks
 */
function reorderCSS(css) {
  // Helper to extract complete block with nested braces
  function extractBlock(text, pattern) {
    const match = text.match(pattern);
    if (!match) return null;
    const start = match.index;
    let depth = 0;
    let i = start + match[0].indexOf('{');
    while (i < text.length) {
      if (text[i] === '{') depth++;
      if (text[i] === '}') {
        depth--;
        if (depth === 0) {
          return text.substring(start, i + 1);
        }
      }
      i++;
    }
    return null;
  }

  const rootBlock = extractBlock(css, /:root\s*\{/s) || '';
  const darkBlock = extractBlock(css, /\.dark\s*\{/s) || '';

  // Remove extracted blocks
  let remaining = css;
  if (rootBlock) remaining = remaining.replace(rootBlock, '');
  if (darkBlock) remaining = remaining.replace(darkBlock, '');

  // Extract @layer blocks
  const layerBaseMatches = [...remaining.matchAll(/@layer base\s*\{/g)];
  const layerBaseBlocks = layerBaseMatches.map(m => extractBlock(remaining, new RegExp(m[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 's'))).filter(Boolean).join('\n\n');

  const layerUtilitiesMatches = [...remaining.matchAll(/@layer utilities\s*\{/g)];
  const layerUtilitiesBlocks = layerUtilitiesMatches.map(m => extractBlock(remaining, new RegExp(m[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 's'))).filter(Boolean).join('\n\n');

  // Remove @layer blocks
  if (layerBaseBlocks) remaining = remaining.replace(layerBaseBlocks, '');
  if (layerUtilitiesBlocks) remaining = remaining.replace(layerUtilitiesBlocks, '');
  remaining = remaining.trim();

  // Reconstruct in correct order
  return [rootBlock, darkBlock, layerBaseBlocks, layerUtilitiesBlocks, remaining]
    .filter(Boolean)
    .join('\n\n')
    .trim();
}

/**
 * Run the complete pipeline: extract → transform → reorder → emit
 */
export async function runPipeline({
  root,
  outCss,
  outJs,
  tokensOnly,
  force,
  dryRun,
}) {
  const css = extractCSS(root);
  let transformed = await transformCSS(css, { tokensOnly });

  // Reorder CSS to ensure :root/.dark come before @layer blocks
  if (!tokensOnly) {
    transformed = reorderCSS(transformed);
  }

  emit(outCss, header + transformed, { force, dryRun });

  if (outJs) {
    const tokens = extractTokens(transformed);
    emit(outJs, tokensToJS(tokens), { force, dryRun });
  }
}

