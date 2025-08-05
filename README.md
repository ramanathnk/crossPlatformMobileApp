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
Go to IMDRA->android and edit the file named local.properties 
Enter the values of the android sdk location there like below:

sdk.dir=C:\\Users\\rkumarappan\\AppData\\Local\\Android\\Sdk

The default location of the android sdk is:
sdk.dir=C:\\Users\\<your-username>\\AppData\\Local\\Android\\Sdk



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

- `npm start` - Start the Expo development server
- `npm run android` - Start the app on Android
- `npm run ios` - Start the app on iOS (macOS only)
- `npm run web` - Start the app in web browser

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

1. Make sure all dependencies are installed: `npm install`
2. Clear the Expo cache: `expo start -c`
3. Restart the development server
4. Check the Expo documentation: https://docs.expo.dev/

---

Built with ❤️ using Expo and React Native


### Debug Build

To build an apk to deploy on Android devices (need a dev server running):
- Navigate to the android folder
   cd android

- run gradle build
   .\gradlew.bat assembleDebug


### Release Build

To build an apk to deploy on Android devices (no dev server needed):
- Navigate to the android folder
   cd android

- run gradle build
   .\gradlew.bat assembleRelease
