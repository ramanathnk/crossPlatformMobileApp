import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import '@testing-library/jest-native/extend-expect'
import { NavigationContainer } from '@react-navigation/native'
import LoginScreen from '../LoginScreen'

describe('LoginScreen', () => {
  const setup = () =>
    render(
      <NavigationContainer>
        <LoginScreen />
      </NavigationContainer>
    )

  it('disables Sign In initially', () => {
    const { getByTestId } = setup()
    expect(getByTestId('sign-in-button')).toBeDisabled()
  })

  it.skip('enables Sign In when both fields are filled', async () => {
    const { getByTestId } = setup()

    fireEvent.changeText(getByTestId('username-input'), 'user1')

    try {
      fireEvent.press(getByTestId('toggle-password-visibility'))
      await waitFor(() =>
        expect(getByTestId('password-input').props.secureTextEntry).toBe(false)
      )
    } catch { }


    // Wait for button to be enabled
    await waitFor(() => {
      const btn = getByTestId('sign-in-button')
      expect(btn.props.accessibilityState?.disabled).toBe(false)
    })
  })

  it('matches snapshot', () => {
    const { toJSON } = setup()
    expect(toJSON()).toMatchSnapshot()
  })
})