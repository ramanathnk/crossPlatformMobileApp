// setupFilesAfterEnv — runs after the test framework is installed.
// Keep your existing setup here (jest-native, reanimated mocks, etc).
import '@testing-library/jest-native/extend-expect'

// Silence LogBox warnings
jest.mock('react-native/Libraries/LogBox/LogBox', () => ({
  ignoreLogs: jest.fn(),
  ignoreAllLogs: jest.fn(),
}));

// Optionally mock the expo StatusBar (safe no-op) to avoid RN internals entirely
// If you prefer the polyfill route, you can omit this mock.
jest.mock('expo-status-bar', () => {
  const React = require('react')
  return {
    StatusBar: (props) => React.createElement('StatusBar', props),
  }
})

// If you already mock reanimated / gesture-handler, keep those mocks here.
// (Your existing content can remain; this file just shows a recommended place
// for mocks that depend on the test framework.)