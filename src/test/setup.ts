import '@testing-library/jest-dom/vitest'

// jsdom does not implement ResizeObserver, which several components (tabs'
// sliding pill, badge overflow, etc.) rely on. Provide a no-op so those
// components can mount under test.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
}
