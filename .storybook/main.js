import path from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'
import tailwindcss from '@tailwindcss/vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Custom alias resolver plugin - handles @/ imports with proper precedence
function aliasResolverPlugin(srcPath, indexPath) {
  const extensions = ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json']

  return {
    name: 'alias-resolver',
    enforce: 'pre',
    resolveId(source) {
      if (!source.startsWith('@/')) {
        return null
      }

      // Exact match for @/components - must check first
      if (source === '@/components') {
        return indexPath
      }

      // Handle @/components/... paths
      if (source.startsWith('@/components/')) {
        const rest = source.slice('@/components/'.length)
        const basePath = path.resolve(srcPath, 'components', rest)

        if (path.extname(basePath)) {
          if (existsSync(basePath)) {
            return basePath
          }
        } else {
          for (const ext of extensions) {
            const withExt = basePath + ext
            if (existsSync(withExt)) {
              return withExt
            }
          }
        }
        return basePath
      }

      // Handle other @/ paths (lib, hooks, etc.)
      const rest = source.slice(2)
      const basePath = path.resolve(srcPath, rest)

      if (path.extname(basePath)) {
        if (existsSync(basePath)) {
          return basePath
        }
      } else {
        for (const ext of extensions) {
          const withExt = basePath + ext
          if (existsSync(withExt)) {
            return withExt
          }
        }
      }
      return basePath
    },
  }
}

export default {
  stories: ['../src/stories/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-themes'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (config) => {
    // Ensure path alias is configured
    const srcPath = path.resolve(__dirname, '../src')
    const indexPath = path.resolve(srcPath, 'index.ts')

    config.resolve = config.resolve || {}

    // Ensure extensions are configured
    config.resolve.extensions = [
      ...(config.resolve.extensions || []),
      '.tsx',
      '.ts',
      '.jsx',
      '.js',
      '.mjs',
      '.json',
    ]

    // Use custom plugin for @/ alias resolution to ensure proper precedence
    // This handles exact matches (@/components) before prefix matches (@/components/...)
    if (!config.plugins) {
      config.plugins = []
    }
    config.plugins.unshift(aliasResolverPlugin(srcPath, indexPath))

    // Remove any existing @ aliases from Vite's native alias system to avoid conflicts
    config.resolve = config.resolve || {}
    const existingAliases = config.resolve.alias || {}
    const aliasArray = Array.isArray(existingAliases)
      ? existingAliases
      : Object.entries(existingAliases).map(([find, replacement]) => ({ find, replacement }))

    const filteredAliases = aliasArray.filter(alias => {
      const findStr = typeof alias.find === 'string' ? alias.find : String(alias.find)
      return findStr !== '@' && !findStr.startsWith('@/')
    })

    config.resolve.alias = filteredAliases

    // Add Tailwind CSS plugin for Storybook
    if (!config.plugins) {
      config.plugins = []
    }
    const hasTailwind = config.plugins.some(
      (plugin) => plugin && (plugin.name === 'tailwindcss' || plugin.constructor.name === 'TailwindCSS')
    )
    if (!hasTailwind) {
      config.plugins.push(tailwindcss())
    }

    // Ensure server is configured correctly - allow access to node_modules and parent directories
    config.server = config.server || {}
    const packageRoot = path.resolve(__dirname, '..')
    // Three levels up: .storybook -> packages/nqui -> repo root (pnpm often hoists deps here)
    const workspaceRoot = path.resolve(__dirname, '../../..')
    const workspaceNodeModules = path.resolve(workspaceRoot, 'node_modules')
    const packageNodeModules = path.resolve(packageRoot, 'node_modules')

    // Get existing allow list or default to empty array
    const existingAllow = config.server.fs?.allow || []

    config.server.fs = {
      ...config.server.fs,
      allow: [
        ...existingAllow,
        packageRoot,
        workspaceRoot,
        workspaceNodeModules,
        packageNodeModules,
        path.resolve(workspaceNodeModules, '.pnpm'),
        path.resolve(packageNodeModules, '.pnpm'),
        srcPath,
      ],
    }

    // Configure Vite to properly serve source files
    // Set root to package directory so Vite can resolve src/ paths
    config.root = path.resolve(__dirname, '..')

    return config
  },
}