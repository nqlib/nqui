import { join } from 'path';
import { detectFramework, findMainCssFile } from './framework.js';

/**
 * Generate setup helper content with framework-specific imports
 */
export function generateSetupContent(framework, nquiCssPath, useLibraryImport = true) {
  const mainCssFile = findMainCssFile(framework);
  const mainCssDir = mainCssFile.split('/').slice(0, -1).join('/');
  const nquiFileName = nquiCssPath.split('/').pop();
  const nquiDir = nquiCssPath.split('/').slice(0, -1).join('/') || 'nqui';

  // Calculate relative path
  let relativeImport;
  let relativeColorsImport;
  if (useLibraryImport) {
    // Import directly from library package
    relativeImport = '@nqlib/nqui/styles';
    if (mainCssDir === 'app' || mainCssDir === 'src/app') {
      relativeColorsImport = '../' + nquiDir + '/colors.css';
    } else if (mainCssDir === 'src') {
      relativeColorsImport = '../' + nquiDir + '/colors.css';
    } else if (mainCssDir === nquiDir) {
      relativeColorsImport = './colors.css';
    } else {
      relativeColorsImport = './' + nquiDir + '/colors.css';
    }
  } else {
    // Import from local file
  if (mainCssDir === 'app' || mainCssDir === 'src/app') {
      // From app/globals.css or src/app/globals.css to nqui/index.css or nqui/nqui.css
    relativeImport = '../nqui/' + nquiFileName;
  } else if (mainCssDir === 'src') {
      // From src/index.css to nqui/index.css or nqui/nqui.css
    relativeImport = '../nqui/' + nquiFileName;
  } else if (mainCssDir === nquiCssPath.split('/').slice(0, -1).join('/')) {
    // Same directory
    relativeImport = './' + nquiFileName;
  } else {
    // Default: use path from project root
    relativeImport = './' + nquiCssPath;
    }
  }

  const base = `/* ═══════════════════════════════════════════════════
   nqui – Recommended Tailwind & Import Setup
   Add these lines to the TOP of your main CSS file
   ═══════════════════════════════════════════════════ */

@import "tailwindcss";
`;

  const extras = {
    nextjs: `
/* Next.js + Tailwind CSS v4 – required source directives */
@source "./**/*.{js,ts,jsx,tsx,mdx}";
@source "../components/**/*.{js,ts,jsx,tsx,mdx}";
@source "../node_modules/@nqlib/nqui/dist/**/*.js";

@import "tw-animate-css";

/* Better dark mode handling */
@custom-variant dark (&:is(.dark *));
`,
    vite: `
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));
`,
    'create-react-app': `
@import "tw-animate-css";
`,
    remix: `
@import "tw-animate-css";
`,
    generic: `
@import "tw-animate-css";
`,
  };

  const finalImport = useLibraryImport
    ? `\n/* Import nqui design tokens */\n@import "${relativeImport}";\n@import "${relativeColorsImport}";\n`
    : `\n/* Import nqui design tokens */\n@import "${relativeImport}";\n`;

  const viteTailwindSources =
    framework === 'vite'
      ? `
/* Tailwind v4: scan app + nqui dist when utilities from the package are missing (see INSTALLATION.md §2c) */
@source "./**/*.{js,ts,jsx,tsx,mdx}";
@source "../components/**/*.{js,ts,jsx,tsx,mdx}";
@source "../node_modules/@nqlib/nqui/dist/**/*.js";
`
      : '';

  return base + (extras[framework] || extras.generic) + finalImport + viteTailwindSources;
}

