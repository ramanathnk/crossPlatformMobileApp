# IMDRA - Expo React Native App

A modern React Native application built with Expo and TypeScript.

## 🚀 Getting Started

### Prerequisites

- Node.js (v20)
- npm
- Android SDK(v36)
- Expo CLI (optional, but recommended)
- Expo Go app on your mobile device for testing

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd IMDRA
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Setting up the Android SDK for the project

To tell the project the android sdk location:
Go to IMDRA->android and create/edit the file named local.properties
Edit <your-username> in the line below to include your username/
Enter the values of the android sdk location there like below:

The default location of the android sdk is:
sdk.dir=C:\\Users\\<your-username>\\AppData\\Local\\Android\\Sdk

### Running tests

Run tests with the command

```bash
npm test
```

### Development

To start the development server:

```bash
npm start
```

This will start the Expo development server. You can then:

- Press `a` to open on Android device/emulator
- Press `i` to open on iOS simulator (macOS only)
- Press `w` to open in web browser
- Scan the QR code with Expo Go app on your mobile device

### Available Scripts

- `npx expo start` - Start the Expo development server
- `npx expo start -c` - Start the Expo development server after clearing cache
- `npx expo run:android` - Start the app on Android
- `npx expo run:ios` - Start the app on iOS (macOS only)
- `npx expo run:web` - Start the app in web browser

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Development Tools**:
  - VS Code with React Native Tools
  - Expo Tools extension
  - ES7+ React/Redux/React-Native snippets

## 📱 Features

- TypeScript support for better development experience
- Expo SDK for rapid development
- Cross-platform compatibility (iOS, Android, Web)
- Hot reloading for faster development

## 🏗️ Project Structure

```
├── App.tsx                # Main app component
├── app.json               # Expo configuration
├── assets/                # Static assets (images, fonts, etc.)
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── index.ts              # Entry point
```

## 🤝 Development Guidelines

- Use TypeScript for all components and functions
- Follow React Native best practices
- Use Expo SDK components when possible
- Implement proper error handling and loading states
- Use functional components with React hooks
- Follow consistent code formatting and naming conventions

## 📝 License

This project is private and confidential.

## 🆘 Troubleshooting

If you encounter any issues:

1. Install expo first : `npm install expo`
2. Make sure all dependencies are installed: `npx expo install`
3. Clear the Expo cache: `npx expo start -c`
4. Restart the development server
5. Check the Expo documentation: https://docs.expo.dev/

---

Built with ❤️ using Expo and React Native

### Pre Build

Run Pre-build after these situations:

- After changing app.json (scheme, android.package, icons, splash, permissions).

- After installing/upgrading native modules (e.g., react-native-svg, expo-secure-store).

- After upgrading Expo SDK.

# Generate only Android

npx expo prebuild -p android

# Regenerate from scratch (cleans native dirs)

npx expo prebuild -p android --clean

# Don’t install npm pods during prebuild

npx expo prebuild -p android --no-install

### Debug Build

To build an apk to deploy on Android devices (need a dev server running):

- Navigate to the android folder
  cd android

- run gradle build
  .\gradlew assembleDebug

### Release Build

To build an apk to deploy on Android devices (no dev server needed):

- Navigate to the android folder
  cd android

- run gradle build
  .\gradlew assembleRelease

### Typical Workflow

npx expo prebuild -p android
cd android;
.\gradlew clean;
.\gradlew assembleDebug # or assembleRelease

# or run directly

npx expo run:android
