#!/usr/bin/env node

/**
 * Verification script to compare source CSS files with built dist/styles.css
 * Ensures no content is missing or broken during the build process
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = resolve(__dirname, '..');
const indexCssPath = join(projectRoot, 'src', 'index.css');
const colorsCssPath = join(projectRoot, 'src', 'styles', 'colors.css');
const zIndexCssPath = join(projectRoot, 'src', 'styles', 'z-index.css');
const motionCssPath = join(projectRoot, 'src', 'styles', 'motion.css');
const shadowsCssPath = join(projectRoot, 'src', 'styles', 'shadows.css');
const builtCssPath = join(projectRoot, 'dist', 'styles.css');

function extractCSSVariables(css, selector = ':root') {
  const regex = new RegExp(`${selector}\\s*\\{([^}]+(?:\\{[^}]*\\}[^}]*)*)\\}`, 's');
  const match = css.match(regex);
  if (!match) return [];
  
  const content = match[1];
  const varRegex = /--[\w-]+:\s*[^;]+;/g;
  return content.match(varRegex) || [];
}

function extractSourceInlineDirectives(css) {
  return css
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('@source inline('));
}

function extractCustomClasses(css) {
  // Extract custom CSS classes (e.g., .nqui-button-gradient)
  const classRegex = /\.nqui-[\w-]+\s*\{[^}]*\}/g;
  return css.match(classRegex) || [];
}

function extractUtilities(css) {
  // Extract utility classes from @source inline() directives
  // Format: @source inline("class1 class2 class3");
  // Need to handle parentheses in class names like rgba(0,0,0,0.125)
  const utilities = new Set();
  
  // Match @source inline("...") with proper handling of nested quotes/parens
  // Use a more robust approach: find @source inline( then match until ); with proper quote handling
  const sourceRegex = /@source\s+inline\(/g;
  let match;
  
  while ((match = sourceRegex.exec(css)) !== null) {
    const start = match.index + match[0].length;
    let pos = start;
    let inQuotes = false;
    let quoteChar = null;
    let depth = 1; // Track nested parentheses
    
    // Find the matching closing ); accounting for quotes and nested parens
    while (pos < css.length && depth > 0) {
      const char = css[pos];
      
      if (!inQuotes && (char === '"' || char === "'")) {
        inQuotes = true;
        quoteChar = char;
      } else if (inQuotes && char === quoteChar) {
        inQuotes = false;
        quoteChar = null;
      } else if (!inQuotes) {
        if (char === '(') depth++;
        else if (char === ')') depth--;
      }
      
      pos++;
    }
    
    if (depth === 0) {
      // Extract content between inline( and )
      const content = css.substring(start, pos - 1).trim();
      
      // Check if it's a single quoted string
      const singleStringMatch = content.match(/^["']([^"']+)["']$/);
      if (singleStringMatch) {
        // Split by spaces to get individual classes
        const classes = singleStringMatch[1].split(/\s+/).filter(Boolean);
        classes.forEach(cls => utilities.add(cls));
      } else {
        // Fallback: extract all quoted strings (old format)
        const utilRegex = /["']([^"']+)["']/g;
        let utilMatch;
        while ((utilMatch = utilRegex.exec(content)) !== null) {
          const quotedContent = utilMatch[1];
          if (quotedContent.includes(' ')) {
            // Space-separated classes in one string
            quotedContent.split(/\s+/).forEach(cls => utilities.add(cls));
          } else {
            utilities.add(quotedContent);
          }
        }
      }
    }
  }
  
  return Array.from(utilities);
}

function compareArrays(source, built, name) {
  const sourceSet = new Set(source);
  const builtSet = new Set(built);
  
  const missing = source.filter(item => !builtSet.has(item));
  const extra = built.filter(item => !sourceSet.has(item));
  
  return { missing, extra, sourceCount: source.length, builtCount: built.length };
}

function main() {
  console.log('🔍 Verifying build integrity...\n');
  
  if (!existsSync(builtCssPath)) {
    console.error('❌ Built CSS file not found. Run build first.');
    process.exit(1);
  }
  
  // Read all source files
  const indexCss = readFileSync(indexCssPath, 'utf-8');
  const colorsCss = readFileSync(colorsCssPath, 'utf-8');
  const zIndexCss = readFileSync(zIndexCssPath, 'utf-8');
  const motionCss = readFileSync(motionCssPath, 'utf-8');
  const shadowsCss = readFileSync(shadowsCssPath, 'utf-8');
  const builtCss = readFileSync(builtCssPath, 'utf-8');
  
  let hasErrors = false;
  let hasWarnings = false;
  
  // 1. Check @source inline() directives (count all directives, not comment-prefixed pairs)
  console.log('1️⃣  Checking @source inline() directives...');
  const sourceInlineSource = extractSourceInlineDirectives(indexCss);
  const sourceInlineBuilt = extractSourceInlineDirectives(builtCss);

  if (sourceInlineSource.length !== sourceInlineBuilt.length) {
    console.error(
      `   ❌ Mismatch: Source has ${sourceInlineSource.length}, Built has ${sourceInlineBuilt.length}`
    );
    hasErrors = true;
  } else {
    console.log(`   ✅ All ${sourceInlineSource.length} @source inline() directives preserved`);
  }

  // No orphan @source directives in the CSS body (after @theme inline)
  const themeSplit = builtCss.split('@theme inline');
  if (themeSplit.length > 1) {
    const bodyAfterTheme = themeSplit.slice(1).join('@theme inline');
    const orphanSources = extractSourceInlineDirectives(bodyAfterTheme);
    if (orphanSources.length > 0) {
      console.error(
        `   ❌ Found ${orphanSources.length} orphan @source inline() in CSS body (should only be in header)`
      );
      hasErrors = true;
    } else {
      console.log('   ✅ No orphan @source inline() directives in CSS body');
    }
  }
  
  // 2. Check CSS variables from :root
  console.log('\n2️⃣  Checking :root CSS variables...');
  const rootVarsIndex = extractCSSVariables(indexCss, ':root');
  const rootVarsColors = extractCSSVariables(colorsCss, ':root');
  const rootVarsZIndex = extractCSSVariables(zIndexCss, ':root');
  const rootVarsMotion = extractCSSVariables(motionCss, ':root');
  const rootVarsShadows = extractCSSVariables(shadowsCss, ':root');
  const rootVarsBuilt = extractCSSVariables(builtCss, ':root');
  
  const allRootVars = [
    ...rootVarsIndex,
    ...rootVarsColors,
    ...rootVarsZIndex,
    ...rootVarsMotion,
    ...rootVarsShadows,
  ];
  const rootComparison = compareArrays(
    allRootVars.map(v => v.split(':')[0].trim()),
    rootVarsBuilt.map(v => v.split(':')[0].trim()),
    'root variables'
  );
  
  if (rootComparison.missing.length > 0) {
    console.error(`   ❌ Missing ${rootComparison.missing.length} variables:`);
    rootComparison.missing.slice(0, 10).forEach(v => console.error(`      - ${v}`));
    if (rootComparison.missing.length > 10) {
      console.error(`      ... and ${rootComparison.missing.length - 10} more`);
    }
    hasErrors = true;
  }
  
  if (rootComparison.extra.length > 0) {
    console.warn(`   ⚠️  Extra ${rootComparison.extra.length} variables (may be intentional):`);
    rootComparison.extra.slice(0, 5).forEach(v => console.warn(`      + ${v}`));
    if (rootComparison.extra.length > 5) {
      console.warn(`      ... and ${rootComparison.extra.length - 5} more`);
    }
    hasWarnings = true;
  }
  
  if (rootComparison.missing.length === 0 && rootComparison.extra.length === 0) {
    console.log(`   ✅ All ${rootComparison.sourceCount} :root variables preserved`);
  }
  
  // 3. Check CSS variables from .dark
  console.log('\n3️⃣  Checking .dark CSS variables...');
  const darkVarsIndex = extractCSSVariables(indexCss, '\\.dark');
  const darkVarsColors = extractCSSVariables(colorsCss, '\\.dark');
  const darkVarsBuilt = extractCSSVariables(builtCss, '\\.dark');
  
  const allDarkVars = [...darkVarsIndex, ...darkVarsColors];
  const darkComparison = compareArrays(
    allDarkVars.map(v => v.split(':')[0].trim()),
    darkVarsBuilt.map(v => v.split(':')[0].trim()),
    'dark variables'
  );
  
  if (darkComparison.missing.length > 0) {
    console.error(`   ❌ Missing ${darkComparison.missing.length} variables:`);
    darkComparison.missing.slice(0, 10).forEach(v => console.error(`      - ${v}`));
    if (darkComparison.missing.length > 10) {
      console.error(`      ... and ${darkComparison.missing.length - 10} more`);
    }
    hasErrors = true;
  }
  
  if (darkComparison.extra.length > 0) {
    console.warn(`   ⚠️  Extra ${darkComparison.extra.length} variables (may be intentional):`);
    darkComparison.extra.slice(0, 5).forEach(v => console.warn(`      + ${v}`));
    if (darkComparison.extra.length > 5) {
      console.warn(`      ... and ${darkComparison.extra.length - 5} more`);
    }
    hasWarnings = true;
  }
  
  if (darkComparison.missing.length === 0 && darkComparison.extra.length === 0) {
    console.log(`   ✅ All ${darkComparison.sourceCount} .dark variables preserved`);
  }
  
  // 4. Check custom CSS classes
  console.log('\n4️⃣  Checking custom CSS classes...');
  const customClassesSource = extractCustomClasses(indexCss);
  const customClassesBuilt = extractCustomClasses(builtCss);
  
  const classComparison = compareArrays(
    customClassesSource.map(c => {
      const match = c.match(/\.([\w-]+)\s*\{/);
      return match ? match[1] : '';
    }).filter(Boolean),
    customClassesBuilt.map(c => {
      const match = c.match(/\.([\w-]+)\s*\{/);
      return match ? match[1] : '';
    }).filter(Boolean),
    'custom classes'
  );
  
  if (classComparison.missing.length > 0) {
    console.error(`   ❌ Missing ${classComparison.missing.length} classes:`);
    classComparison.missing.forEach(c => console.error(`      - .${c}`));
    hasErrors = true;
  }
  
  if (classComparison.missing.length === 0) {
    console.log(`   ✅ All ${classComparison.sourceCount} custom classes preserved`);
  }
  
  // 5. Check utility classes from @source inline()
  console.log('\n5️⃣  Checking utility classes in @source inline()...');
  const utilitiesSource = extractUtilities(indexCss);
  const utilitiesBuilt = extractUtilities(builtCss);
  
  const utilComparison = compareArrays(utilitiesSource, utilitiesBuilt, 'utilities');
  
  if (utilComparison.missing.length > 0) {
    console.error(`   ❌ Missing ${utilComparison.missing.length} utilities:`);
    utilComparison.missing.slice(0, 20).forEach(u => console.error(`      - ${u}`));
    if (utilComparison.missing.length > 20) {
      console.error(`      ... and ${utilComparison.missing.length - 20} more`);
    }
    hasErrors = true;
  }
  
  if (utilComparison.missing.length === 0) {
    console.log(`   ✅ All ${utilComparison.sourceCount} utility classes preserved`);
  }
  
  // 6. Check for critical patterns that should be present
  console.log('\n6️⃣  Checking critical patterns...');
  const criticalPatterns = [
    { name: '@source inline() directives', pattern: /@source\s+inline\(/g },
    { name: ':root block', pattern: /:root\s*\{/ },
    { name: '.dark block', pattern: /\.dark\s*\{/ },
    // Viewport lock (html, body, #root) was intentionally removed from base styles (see CHANGELOG 0.3.3); use AppLayout for opt-in lock.
  ];
  
  criticalPatterns.forEach(({ name, pattern }) => {
    const matches = builtCss.match(pattern);
    if (!matches || matches.length === 0) {
      console.error(`   ❌ Missing: ${name}`);
      hasErrors = true;
    } else {
      console.log(`   ✅ Found: ${name} (${matches.length} occurrences)`);
    }
  });
  
  // 6b. Check specific elevation variables
  console.log('\n6️⃣b Checking elevation variables...');
  const elevationVars = [
    '--z-base', '--z-background', '--z-content', '--z-sticky-content',
    '--z-sticky-page', '--z-floating', '--z-modal-backdrop', '--z-modal',
    '--z-popover', '--z-tooltip', '--z-debug'
  ];
  
  const missingElevation = elevationVars.filter(v => !builtCss.includes(v + ':'));
  if (missingElevation.length > 0) {
    console.error(`   ❌ Missing elevation variables: ${missingElevation.join(', ')}`);
    hasErrors = true;
  } else {
    console.log(`   ✅ All ${elevationVars.length} elevation variables present`);
  }
  
  // 6c. Check specific color variables
  console.log('\n6️⃣c Checking color variables...');
  const colorVars = [
    '--primary-100', '--primary-200', '--primary-300', '--primary-400',
    '--primary-500', '--primary-600', '--background', '--foreground',
    '--card', '--card-foreground', '--popover', '--popover-foreground'
  ];
  
  const missingColors = colorVars.filter(v => !builtCss.includes(v + ':'));
  if (missingColors.length > 0) {
    console.error(`   ❌ Missing color variables: ${missingColors.join(', ')}`);
    hasErrors = true;
  } else {
    console.log(`   ✅ All ${colorVars.length} checked color variables present`);
  }
  
  // 7. Check for unwanted patterns that should NOT be present
  console.log('\n7️⃣  Checking for unwanted patterns...');
  const unwantedPatterns = [
    { name: '@import directives', pattern: /@import\s+["']tailwindcss["']/ },
    { name: 'unbundled ./styles imports', pattern: /@import\s+["']\.\/styles\// },
    { name: '@custom-variant directives', pattern: /@custom-variant/ },
    { name: 'Framework-specific @source', pattern: /@source\s+["']/ },
  ];
  
  unwantedPatterns.forEach(({ name, pattern }) => {
    const matches = builtCss.match(pattern);
    if (matches && matches.length > 0) {
      console.warn(`   ⚠️  Found ${matches.length} ${name} (should be removed)`);
      hasWarnings = true;
    } else {
      console.log(`   ✅ No ${name} found`);
    }
  });
  
  // Summary
  console.log('\n' + '='.repeat(60));
  if (hasErrors) {
    console.error('❌ VERIFICATION FAILED: Issues found in built CSS');
    process.exit(1);
  } else if (hasWarnings) {
    console.warn('⚠️  VERIFICATION PASSED with warnings');
    process.exit(0);
  } else {
    console.log('✅ VERIFICATION PASSED: All checks passed');
    process.exit(0);
  }
}

main();
