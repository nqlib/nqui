import { createInterface } from 'readline';
import { detectFramework } from './framework.js';

/**
 * Create readline interface for prompts
 */
function createRL() {
  return createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

/**
 * Ask a question and return the answer
 */
export async function askQuestion(question) {
  const rl = createRL();
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

/**
 * Interactive wizard for CLI options
 */
export async function wizard() {
  const ask = (question) => askQuestion(question);

  const tokensOnly = (await ask('Extract tokens only? (y/n): ')) === 'y';
  const js = (await ask('Generate JS tokens? (y/n): ')) === 'y';

  const framework = detectFramework();
  let copyExamples = false;
  let sidebarLayout = false;

  if (framework === 'nextjs' || framework === 'vite') {
    copyExamples = (await ask(`\nCopy ${framework} example files? (y/n): `)) === 'y';
    if (copyExamples) {
      sidebarLayout = (await ask('\nUse sidebar layout (recommended for apps)? (y/n): ')) === 'y';
    }
  }

  return { tokensOnly, js, copyExamples, sidebarLayout };
}

/**
 * Ask about copying examples (used in default mode)
 */
export async function askAboutExamples(framework, useSidebar = false) {
  if (framework !== 'nextjs' && framework !== 'vite') {
    return false;
  }

  const layoutType = useSidebar ? 'sidebar' : 'basic';
  const answer = await askQuestion(`\n📦 Copy ${framework} example files (${layoutType} layout)? (y/n): `);
  return answer === 'y' || answer === 'yes';
}

