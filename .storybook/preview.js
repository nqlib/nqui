import React from "react"
import { withThemeByClassName } from '@storybook/addon-themes'
import { themes } from 'storybook/theming'
import { addons } from 'storybook/preview-api'
import "../src/index.css"
import "../src/styles/colors.css"

// Listen to globals changes and sync manager theme
const channel = addons.getChannel()
if (channel) {
  // Initialize body background on load
  if (typeof document !== 'undefined') {
    document.body.style.backgroundColor = '#f3efe7' // warm paper (light theme)
  }

  channel.on('updateGlobals', (globals) => {
    const theme = globals?.globals?.theme
    if (theme === 'dark' || theme === 'light') {
      // Store theme in localStorage for manager to read
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('storybook-theme', theme)
      }

      // Apply theme class to document body for full preview background
      if (typeof document !== 'undefined') {
        document.body.classList.remove('dark', 'light')
        if (theme === 'dark') {
          document.body.classList.add('dark')
          document.body.style.backgroundColor = '#111827' // gray-900
        } else {
          document.body.classList.add('light')
          document.body.style.backgroundColor = '#f3efe7' // warm paper (~ :root --background)
        }
      }
    }
  })
}


const preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Configure themes for both manager UI and preview
    themes: {
      default: 'light',
      target: 'html', // Apply class to <html> element
      list: [
        {
          name: 'light',
          class: 'light',
          color: '#f3efe7',
          theme: themes.light,
        },
        {
          name: 'dark',
          class: 'dark',
          color: '#0a0a0a',
          theme: themes.dark,
        },
      ],
    },
    viewport: {
      options: {
        mobile: {
          name: "Mobile",
          styles: {
            width: "375px",
            height: "667px",
          },
        },
        tablet: {
          name: "Tablet",
          styles: {
            width: "768px",
            height: "1024px",
          },
        },
        desktop: {
          name: "Desktop",
          styles: {
            width: "1280px",
            height: "800px",
          },
        },
        wide: {
          name: "Wide",
          styles: {
            width: "1920px",
            height: "1080px",
          },
        },
      }
    },
    layout: "centered",
    docs: {
      toc: true,
    },
    a11y: {
      config: {
        rules: [
          {
            id: "color-contrast",
            enabled: true,
          },
        ],
      },
    },
  },

  decorators: [
    // Apply CSS class to preview for Tailwind dark mode
    withThemeByClassName({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
      parentSelector: 'html', // Apply class to <html> element for Tailwind
    }),
    (Story, context) => {
      return React.createElement('div', {
        className: 'p-4 min-h-screen'
      },
        React.createElement(Story)
      )
    },
  ],

  tags: ["autodocs"],

  initialGlobals: {
    viewport: {
      value: "desktop",
      isRotated: false
    },

    theme: 'light'
  }
}

export default preview