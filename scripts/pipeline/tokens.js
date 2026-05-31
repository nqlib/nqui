import postcss from 'postcss';

/**
 * Extract CSS variables (tokens) from CSS
 */
export function extractTokens(css) {
  const tokens = {};
  const root = postcss.parse(css);

  root.walkDecls((decl) => {
    if (decl.prop.startsWith('--')) {
      tokens[decl.prop.slice(2)] = decl.value;
    }
  });

  return tokens;
}

/**
 * Convert tokens object to JS export
 */
export function tokensToJS(tokens) {
  return `export const tokens = ${JSON.stringify(tokens, null, 2)};`;
}

