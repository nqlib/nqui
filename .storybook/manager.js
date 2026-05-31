import { addons } from "storybook/manager-api"
import { themes } from "storybook/theming"


// Listen for theme changes via localStorage polling
if (typeof window !== 'undefined') {
  let lastTheme = null

  // Create custom dark theme with proper background colors
  const customDarkTheme = {
    ...themes.dark,
    appBg: '#1f2937', // gray-800 for main background
    appContentBg: '#1f2937', // gray-800 for content areas
    barBg: '#111827', // gray-900 for bars
  }

  // Inject CSS to force dark backgrounds on all content areas
  // Use a more aggressive approach that targets all white backgrounds when dark theme is active
  const style = document.createElement('style')
  style.id = 'storybook-theme-overrides'
  style.textContent = `
    /* Universal dark theme override - apply to all elements when dark theme is active */
    body[data-color-mode="dark"] *,
    [data-color-mode="dark"] * {
      /* Override white backgrounds */
    }

    /* Target all common Storybook content areas */
    body[data-color-mode="dark"] main,
    body[data-color-mode="dark"] section,
    body[data-color-mode="dark"] article,
    body[data-color-mode="dark"] div,
    body[data-color-mode="dark"] [class*="os-host"],
    body[data-color-mode="dark"] [class*="os-content"],
    body[data-color-mode="dark"] [class*="os-viewport"],
    body[data-color-mode="dark"] [class*="sidebar-container"],
    body[data-color-mode="dark"] [class*="content"],
    body[data-color-mode="dark"] [class*="docs"],
    body[data-color-mode="dark"] [class*="markdown"],
    body[data-color-mode="dark"] [class*="sbdocs"],
    body[data-color-mode="dark"] [class*="toolbar"],
    body[data-color-mode="dark"] [class*="preview"],
    body[data-color-mode="dark"] [class*="controls"],
    body[data-color-mode="dark"] [data-testid="storybook-preview-wrapper"],
    body[data-color-mode="dark"] [class*="storybook-preview"],
    body[data-color-mode="dark"] [class*="storybook-docs"],
    body[data-color-mode="dark"] [class*="sbdocs-wrapper"],
    body[data-color-mode="dark"] [class*="sbdocs-content"],
    body[data-color-mode="dark"] [class*="sbdocs-preview"] {
      background-color: #1f2937 !important;
      color: #f9fafb !important;
    }

    /* Also check for Storybook's actual theme class structure */
    .os-host[data-color-mode="dark"],
    .os-content[data-color-mode="dark"],
    main[data-color-mode="dark"],
    section[data-color-mode="dark"] {
      background-color: #1f2937 !important;
      color: #f9fafb !important;
    }
  `
  document.head.appendChild(style)

  // #region agent log
  fetch('http://127.0.0.1:7253/ingest/dd1618ba-f7a7-49bb-8fc3-5befed63a2f3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'manager.js:css-injected',message:'CSS injected',data:{hasStyle:!!style},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'N'})}).catch(()=>{});
  // #endregion

  // Function to apply dark theme to DOM elements
  const applyDarkThemeToDOM = () => {
    // Wait for DOM to be ready
    const applyStyles = () => {
      // More comprehensive selector to catch all content areas
      const selectors = [
        'main',
        'section',
        'article',
        '[class*="content"]',
        '[class*="docs"]',
        '[class*="sbdocs"]',
        '[class*="toolbar"]',
        '[class*="preview"]',
        '[class*="os-host"]',
        '[class*="os-content"]',
        '[data-testid*="storybook"]'
      ]

      const allElements = document.querySelectorAll(selectors.join(', '))
      let appliedCount = 0

      allElements.forEach(el => {
        const computedStyle = window.getComputedStyle(el)
        const bgColor = computedStyle.backgroundColor

        // Check if element has white/light background
        const isWhite = bgColor === 'rgb(255, 255, 255)' ||
                       bgColor === 'white' ||
                       bgColor === 'rgba(0, 0, 0, 0)' && el.style.backgroundColor === 'white' ||
                       el.style.backgroundColor === 'white' ||
                       el.style.backgroundColor === '#ffffff' ||
                       bgColor.includes('255, 255, 255')

        if (isWhite) {
          el.style.setProperty('background-color', '#1f2937', 'important')
          el.style.setProperty('color', '#f9fafb', 'important')
          appliedCount++
        }
      })

      // #region agent log
      fetch('http://127.0.0.1:7253/ingest/dd1618ba-f7a7-49bb-8fc3-5befed63a2f3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'manager.js:applyDarkTheme',message:'Applied dark theme to DOM',data:{elementsFound:allElements.length,appliedCount,bodyDataColorMode:document.body.getAttribute('data-color-mode')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'O'})}).catch(()=>{});
      // #endregion
    }

    // Apply immediately and after delays to catch dynamically loaded content
    applyStyles()
    setTimeout(applyStyles, 100)
    setTimeout(applyStyles, 500)
    setTimeout(applyStyles, 1000)
  }

  // Check for theme changes every 100ms
  setInterval(() => {
    const currentTheme = window.localStorage.getItem('storybook-theme')
    if (currentTheme && currentTheme !== lastTheme && (currentTheme === 'dark' || currentTheme === 'light')) {
      lastTheme = currentTheme
      const storybookTheme = currentTheme === 'dark' ? customDarkTheme : themes.light
      addons.setConfig({ theme: storybookTheme })

      // Set data-color-mode attribute on body for CSS targeting
      if (currentTheme === 'dark') {
        document.body.setAttribute('data-color-mode', 'dark')
        document.body.classList.add('dark-theme')
        applyDarkThemeToDOM()

        // Keep applying periodically to catch new content
        const darkInterval = setInterval(() => {
          if (window.localStorage.getItem('storybook-theme') === 'dark') {
            document.body.setAttribute('data-color-mode', 'dark')
            applyDarkThemeToDOM()
          } else {
            clearInterval(darkInterval)
          }
        }, 500)
      } else {
        document.body.setAttribute('data-color-mode', 'light')
        document.body.classList.remove('dark-theme')
      }

      // #region agent log
      fetch('http://127.0.0.1:7253/ingest/dd1618ba-f7a7-49bb-8fc3-5befed63a2f3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'manager.js:theme-changed',message:'Theme changed',data:{currentTheme,bodyDataColorMode:document.body.getAttribute('data-color-mode')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'P'})}).catch(()=>{});
      // #endregion
    }
  }, 100)

  // Apply initial theme
  const initialTheme = window.localStorage.getItem('storybook-theme') || 'light'
  if (initialTheme === 'dark') {
    document.body.setAttribute('data-color-mode', 'dark')
    setTimeout(applyDarkThemeToDOM, 500)
  } else {
    document.body.setAttribute('data-color-mode', 'light')
  }

  // Use MutationObserver to catch dynamically added elements
  const observer = new MutationObserver((mutations) => {
    const currentTheme = window.localStorage.getItem('storybook-theme')
    if (currentTheme === 'dark') {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            const el = node
            const computedStyle = window.getComputedStyle(el)
            const bgColor = computedStyle.backgroundColor

            // Check if new element has white background
            if (bgColor === 'rgb(255, 255, 255)' || bgColor === 'white' || bgColor.includes('255, 255, 255')) {
              el.style.setProperty('background-color', '#1f2937', 'important')
              el.style.setProperty('color', '#f9fafb', 'important')
            }

            // Also check child elements
            const whiteChildren = el.querySelectorAll('main, section, article, [class*="content"], [class*="docs"]')
            whiteChildren.forEach(child => {
              const childStyle = window.getComputedStyle(child)
              if (childStyle.backgroundColor === 'rgb(255, 255, 255)' || childStyle.backgroundColor === 'white') {
                child.style.setProperty('background-color', '#1f2937', 'important')
                child.style.setProperty('color', '#f9fafb', 'important')
              }
            })
          }
        })
      })
    }
  })

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  })

  // #region agent log
  fetch('http://127.0.0.1:7253/ingest/dd1618ba-f7a7-49bb-8fc3-5befed63a2f3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'manager.js:observer-setup',message:'MutationObserver setup',data:{hasObserver:!!observer},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'Q'})}).catch(()=>{});
  // #endregion
}

// Set initial theme
addons.setConfig({
  theme: themes.light, // Default theme
  toolbar: {
    title: { hidden: false },
    zoom: { hidden: false },
    eject: { hidden: false },
    copy: { hidden: false },
    fullscreen: { hidden: false },
  },
})