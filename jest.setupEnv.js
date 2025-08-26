// Very small early setup file for Jest (put at project root).
// This runs BEFORE modules are loaded. Use this to polyfill global APIs
// that React Native internals (StatusBar) expect.

if (typeof global.setImmediate === 'undefined') {
  // minimal polyfill using setTimeout
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  global.setImmediate = (fn, ...args) => setTimeout(fn, 0, ...args);
}
if (typeof global.clearImmediate === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  global.clearImmediate = (id) => clearTimeout(id);
}

// Ensure EXPO_OS is defined early if expo modules check it during require()
process.env.EXPO_OS = process.env.EXPO_OS || 'web';