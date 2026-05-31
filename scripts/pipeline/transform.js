import postcss from 'postcss';
import { extractTokens } from './tokens.js';

// Dynamic import for PostCSS config (ESM compatibility)
let postcssConfig = null;

async function loadPostcssConfig() {
  if (postcssConfig) return postcssConfig;

  // Try to load postcss.config.mjs
  try {
    const configModule = await import('../postcss.config.mjs');
    postcssConfig = configModule.default;
    return postcssConfig;
  } catch (err) {
    // Fallback: use basic plugins
    const postcssImport = (await import('postcss-import')).default;
    const discardComments = (await import('postcss-discard-comments')).default;
    postcssConfig = {
      plugins: [
        postcssImport(),
        discardComments({ removeAll: true }),
      ],
    };
    return postcssConfig;
  }
}

/**
 * Transform CSS using PostCSS pipeline
 * If tokensOnly is true, returns only CSS variables in :root block
 */
export async function transformCSS(css, { tokensOnly }) {
  // Remove Tailwind v4 specific directives before PostCSS processing
  // These are not standard CSS and will cause PostCSS to fail
  const cleanedCss = css
    .replace(/@source\s+[^;]+;?\s*\n/g, '')
    .replace(/@custom-variant\s+[^;]+;?\s*\n/g, '')
    .replace(/@theme\s+inline\s*\{[\s\S]*?\}\s*/g, '');

  const config = await loadPostcssConfig();
  const result = await postcss(config.plugins).process(cleanedCss, { from: undefined });

  if (!tokensOnly) return result.css.trim();

  const tokens = extractTokens(result.css);
  return `:root {\n${Object.entries(tokens)
    .map(([k, v]) => `  --${k}: ${v};`)
    .join('\n')}\n}`;
}

