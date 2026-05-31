import { StrictMode, useEffect, type ReactNode } from "react"
import { createRoot } from "react-dom/client"
import { ThemeProvider, useTheme } from "next-themes"

if (import.meta.env.DEV) {
  import("react-grab")
}

import "./index.css"
// Import debug tools CSS for showcase app
import "./components/debug/debug.css"
import App from "./App.tsx"

/** Migrate legacy stored values not in the showcase theme list. */
function ThemePreferenceMigration({ children }: { children: ReactNode }) {
  const { theme, setTheme } = useTheme()
  useEffect(() => {
    if (theme === "system") {
      setTheme("light")
    }
  }, [theme, setTheme])
  return <>{children}</>
}

// #region DEBUG: CSS Render Timing
// Measure when first CSS rule becomes available
const checkCSSLoaded = () => {
  const time = performance.now();
  const sheetCount = document.styleSheets.length;
  console.log(`[CSS TIMING] ${sheetCount} stylesheets loaded at ${time.toFixed(2)}ms`);
  
  // Check for Inter font loading
  if (document.fonts) {
    document.fonts.ready.then(() => {
      console.log(`[CSS TIMING] Fonts ready at ${performance.now().toFixed(2)}ms`);
    });
  }
};
// Check immediately and after DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkCSSLoaded, { once: true });
} else {
  checkCSSLoaded();
}
// Listen for HMR updates to see CSS reload times
if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', () => {
    console.log('[CSS TIMING] HMR: CSS about to reload');
  });
  import.meta.hot.on('vite:afterUpdate', () => {
    console.log(`[CSS TIMING] HMR: CSS reloaded in ${performance.now() % 1000}ms`);
  });
}
// #endregion

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      themes={["light", "dark"]}
    >
      <ThemePreferenceMigration>
        <App />
      </ThemePreferenceMigration>
    </ThemeProvider>
  </StrictMode>
)
