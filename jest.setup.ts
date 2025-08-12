import '@testing-library/jest-native/extend-expect'

// define EXPO_OS so babel-preset-expo won’t warn
process.env.EXPO_OS = 'android'

// mock secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}))

// mock react-navigation so useNavigation() never crashes
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native')
  return {
    ...actual,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack:   jest.fn(),
    }),
  }
})