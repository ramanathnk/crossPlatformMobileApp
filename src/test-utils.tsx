// test-utils.tsx
// Small helper to render components wrapped with a simple fake Redux store and NavigationContainer.
// Use renderWithProviders(ui, { preloadedState }) in tests that expect react-redux Provider.

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';

// A tiny fake store that implements the minimal methods Provider expects.
// getState returns the provided state; dispatch is a jest.fn(); subscribe returns a no-op unsubscribe.
export function createMockStore(preloadedState: any = {}) {
  const store = {
    getState: () => preloadedState,
    dispatch: jest.fn(),
    subscribe: () => () => {},
    replaceReducer: () => {},
  };
  return store;
}

type RenderWithProvidersOptions = RenderOptions & {
  preloadedState?: any;
  // If you want to pass a custom wrapper, you can extend this helper later
};

export function renderWithProviders(
  ui: ReactElement,
  { preloadedState = {}, ...renderOptions }: RenderWithProvidersOptions = {},
) {
  const store = createMockStore(preloadedState);

  function Wrapper({ children }: { children?: React.ReactNode }) {
    return (
      <Provider store={store as any}>
        <NavigationContainer>{children}</NavigationContainer>
      </Provider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper as any, ...renderOptions }),
    store,
  };
}
