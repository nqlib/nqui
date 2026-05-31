import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * Detect the framework type of the current project
 */
export function detectFramework() {
  const cwd = process.cwd();

  if (
    existsSync(join(cwd, 'next.config.js')) ||
    existsSync(join(cwd, 'next.config.ts')) ||
    existsSync(join(cwd, 'app')) ||
    existsSync(join(cwd, 'src', 'app'))
  ) {
    return 'nextjs';
  }

  if (
    existsSync(join(cwd, 'vite.config.js')) ||
    existsSync(join(cwd, 'vite.config.ts'))
  ) {
    return 'vite';
  }

  if (existsSync(join(cwd, 'remix.config.js'))) {
    return 'remix';
  }

  if (existsSync(join(cwd, 'src', 'index.css'))) {
    return 'create-react-app';
  }

  return 'generic';
}

/**
 * Find the main CSS file for a framework
 */
export function findMainCssFile(framework) {
  const cwd = process.cwd();

  switch (framework) {
    case 'nextjs':
      // Check src/app first, then app
      if (existsSync(join(cwd, 'src', 'app', 'globals.css'))) {
        return 'src/app/globals.css';
      }
      if (existsSync(join(cwd, 'app', 'globals.css'))) {
        return 'app/globals.css';
      }
      return 'app/globals.css'; // default
    case 'vite':
    case 'create-react-app':
      if (existsSync(join(cwd, 'src', 'index.css'))) {
        return 'src/index.css';
      }
      return 'src/index.css'; // default
    case 'remix':
      if (existsSync(join(cwd, 'app', 'root.css'))) {
        return 'app/root.css';
      }
      return 'app/root.css'; // default
    default:
      return 'index.css';
  }
}

