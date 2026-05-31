import { readFileSync } from 'fs';
import { join } from 'path';
import { getPackageRoot } from './getPackageRoot.js';

export function printHelp() {
  const root = getPackageRoot();
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

  console.log(`
${pkg.name} v${pkg.version}

Usage:
  npx nqui init-css [output.css] [options]
  npx nqui-setup              Show post-install next steps

Options:
  --js            Generate JS token file
  --tokens-only   Extract only CSS variables
  --setup         Generate nqui-setup.css helper
  --local-copy    Generate local CSS copy instead of importing from library
  --wizard        Interactive installer
  --force         Overwrite existing files
  --dry-run       Preview output only
  --help, -h      Show help
  --version, -v   Show version

Examples:
  npx nqui init-css
  npx nqui init-css nqui/index.css
  npx nqui init-css --local-copy nqui/nqui.css
  npx nqui init-css --tokens-only --js
  npx nqui init-css --wizard
`);
}

