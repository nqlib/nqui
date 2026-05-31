import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isLibrary = mode === "library"

  if (isLibrary) {
    // Library build configuration
    return {
      plugins: [react()], // No tailwindcss plugin for library (consumers handle it)
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "./src"),
        },
      },
      optimizeDeps: {
        // Exclude heavy dependencies from pre-bundling (they're externalized)
        exclude: [
          "shiki",
          "@shikijs/transformers",
          "@codesandbox/sandpack-react",
        ],
      },
      build: {
        lib: {
          entry: {
            index: path.resolve(__dirname, "src/index.ts"),
            carousel: path.resolve(__dirname, "src/entries/carousel.ts"),
            command: path.resolve(__dirname, "src/entries/command.ts"),
            sortable: path.resolve(__dirname, "src/entries/sortable.ts"),
            calendar: path.resolve(__dirname, "src/entries/calendar.ts"),
            sonner: path.resolve(__dirname, "src/entries/sonner.ts"),
            drawer: path.resolve(__dirname, "src/entries/drawer.ts"),
            debug: path.resolve(__dirname, "src/entries/debug.ts"),
          },
          fileName: (format, entryName) =>
            entryName === "index" ? `nqui.${format}.js` : `${entryName}.${format}.js`,
          formats: ["es", "cjs"],
        },
        rollupOptions: {
          external: [
            "react",
            "react-dom",
            "react/jsx-runtime",
            // Core peer dependencies
            "@radix-ui/react-slot",
            "class-variance-authority",
            "clsx",
            "tailwind-merge",
            // Externalize heavy optional dependencies
            // Install by consumers only if using the corresponding components
            "shiki",
            "@shikijs/transformers",
            "@codesandbox/sandpack-react",
            "cmdk",
            "@dnd-kit/core",
            "@dnd-kit/modifiers",
            "@dnd-kit/sortable",
            "@dnd-kit/utilities",
            "embla-carousel-react",
            "@tanstack/react-table",
            "react-day-picker",
            "date-fns",
            "sonner",
            "vaul",
            "react-resizable-panels",
          ],
          output: {
            globals: {
              react: "React",
              "react-dom": "ReactDOM",
            },
          },
        },
        outDir: "dist",
        emptyOutDir: true,
        // Increase chunk size warning limit
        chunkSizeWarningLimit: 1000,
      },
    }
  }

  // App/showcase build configuration
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom"],
    },
    optimizeDeps: {
      include: ["react", "react-dom"],
    },
    server: {
      host: "0.0.0.0", // Allow access from network devices (phone, etc.)
      port: 3000,
    },
    build: {
      outDir: "dist-app",
      emptyOutDir: true,
    },
  }
})
