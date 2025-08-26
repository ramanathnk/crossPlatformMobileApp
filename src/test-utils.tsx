// test-utils.tsx
// Small helper to render components wrapped with a simple fake Redux store and NavigationContainer.
// Use renderWithProviders(ui, { preloadedState }) in tests that expect react-redux Provider.

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import type { Store, Dispatch, AnyAction, Observable } from 'redux';

type StateShape = Record<string, unknown>;

/**
 * Create a minimal mock Redux store that satisfies the structural requirements of
 * react-redux's Provider and TypeScript's Store type. This mock is intentionally
 * tiny: getState returns the supplied preloaded state, dispatch is a jest.fn(),
 * subscribe returns a no-op unsubscribe, replaceReducer is a no-op, and the
 * observable symbol is implemented to satisfy the Store interface.
 */
export function createMockStore(preloadedState: StateShape = {}): Store<StateShape, AnyAction> {
  const dispatchMock: Dispatch<AnyAction> = jest.fn() as unknown as Dispatch<AnyAction>;

  const observable: Observable<StateShape> = {
    subscribe: () => ({
      unsubscribe: () => {},
    }),
    [Symbol.observable]: function () {
      // return the observable itself; using `this` avoids referencing the variable
      return this as unknown as Observable<StateShape>;
    },
  };

  const store: Store<StateShape, AnyAction> = {
    getState: () => preloadedState,
    dispatch: dispatchMock,
    subscribe: () => {
      // no-op subscribe; return an unsubscribe function
      return () => {};
    },
    replaceReducer: () => {},
    [Symbol.observable]: () => observable,
  };

  return store;
}

type RenderWithProvidersOptions = RenderOptions & {
  preloadedState?: StateShape;
  // If you want to pass a custom wrapper, you can extend this helper later
};

export function renderWithProviders(
  ui: ReactElement,
  { preloadedState = {}, ...renderOptions }: RenderWithProvidersOptions = {},
) {
  const store = createMockStore(preloadedState);

  function Wrapper({ children }: { children?: React.ReactNode }) {
    return (
      <Provider store={store}>
        <NavigationContainer>{children}</NavigationContainer>
      </Provider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    store,
  };
}
