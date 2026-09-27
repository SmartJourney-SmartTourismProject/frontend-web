import '@testing-library/jest-dom/vitest';

// Node's own global `localStorage` (present but unusable without a
// --localstorage-file flag) already exists on `global` before vitest's
// jsdom environment loads, so its populateGlobal() skips copying jsdom's
// real, working implementation over it - `window.localStorage` ends up
// pointing right back at the same broken Node global. Reach into vitest's
// underlying jsdom instance (exposed as `global.jsdom`) for the real one
// instead, or any store that persists to localStorage (see trip-store.ts)
// fails with "Cannot read properties of undefined".
const realWindow = (globalThis as { jsdom?: { window: Window } }).jsdom?.window;
if (realWindow) {
  Object.defineProperty(globalThis, 'localStorage', {
    value: realWindow.localStorage,
    configurable: true,
    writable: true,
  });
}
