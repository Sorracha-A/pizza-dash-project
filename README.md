# Pizza Dash

Pizza Dash is a location-based mobile game that integrates real-world physical activity with digital gameplay. The application transforms everyday walking into an essential component of its core gameplay loop, requiring players to physically navigate to locations to complete virtual pizza deliveries.

## File Structure

The application follows a component-based architecture organized into distinct layers:

```
.
├── App.tsx
├── Gemfile
├── Gemfile.lock
├── README.md
├── android
│   ├── app
│   │   ├── build.gradle
│   │   ├── debug.keystore
│   │   ├── proguard-rules.pro
│   │   └── src
│   ├── build
│   │   └── generated
│   ├── build.gradle
│   ├── gradle
│   │   └── wrapper
│   ├── gradle.properties
│   ├── gradlew
│   ├── gradlew.bat
│   └── settings.gradle
├── app.json
├── babel.config.js
├── data
│   ├── Participant1.json
│   ├── Participant2.json
│   ├── Participant3.json
│   ├── Participant4.json
│   ├── Participant5.json
│   ├── visualization.py
│   └── visualize.py
├── index.js
├── ios
│   ├── PizzaDash
│   │   ├── AppDelegate.h
│   │   ├── AppDelegate.mm
│   │   ├── Images.xcassets
│   │   ├── Info.plist
│   │   ├── LaunchScreen.storyboard
│   │   ├── PrivacyInfo.xcprivacy
│   │   └── main.m
│   ├── PizzaDash.xcodeproj
│   │   ├── project.pbxproj
│   │   ├── project.xcworkspace
│   │   └── xcshareddata
│   ├── PizzaDash.xcworkspace
│   │   ├── contents.xcworkspacedata
│   │   ├── xcshareddata
│   │   └── xcuserdata
│   ├── PizzaDashTests
│   │   ├── Info.plist
│   │   └── PizzaDashTests.m
│   ├── Podfile
│   ├── Podfile.lock
│   ├── Pods
│   │   ├── DoubleConversion
│   │   ├── Headers
│   │   ├── Local Podspecs
│   │   ├── Manifest.lock
│   │   ├── Pods.xcodeproj
│   │   ├── RCT-Folly
│   │   ├── SocketRocket
│   │   ├── Target Support Files
│   │   ├── boost
│   │   ├── fmt
│   │   ├── glog
│   │   ├── hermes-engine
│   │   └── hermes-engine-artifacts
│   └── build
│       ├── Debug-iphoneos
│       ├── EagerLinkingTBDs
│       ├── ExplicitPrecompiledModules
│       ├── PizzaDash.build
│       ├── Pods.build
│       ├── XCBuildData
│       └── generated
├── jest.config.js
├── metro.config.js
├── package-lock.json
├── package.json
├── patches
│   └── react-native-tab-view+3.5.2.patch
├── src
│   ├── assets
│   │   ├── fonts
│   │   ├── images
│   │   └── sounds
│   ├── components
│   │   ├── BackgroundMusic.tsx
│   │   ├── CurrencyDisplay.tsx
│   │   └── LevelDisplay.tsx
│   ├── helper
│   │   └── playSoundEffect.tsx
│   ├── navigation
│   │   ├── AppNavigator.tsx
│   │   ├── RootStackParams.ts
│   │   └── TabParamList.ts
│   ├── screens
│   │   ├── CustomizationScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── DevMenuScreen.tsx
│   │   ├── LandingScreen.tsx
│   │   ├── MapScreen.tsx
│   │   ├── OptionScreen.tsx
│   │   ├── OrderScreen.tsx
│   │   └── PizzaMakingGame.tsx
│   ├── store
│   │   ├── useCurrencyStore.ts
│   │   ├── useCustomizationStore.ts
│   │   ├── useExperienceStore.ts
│   │   ├── useGameSettingsStore.ts
│   │   ├── useLocationStore.ts
│   │   ├── useOrderStore.ts
│   │   └── useVolumeStore.ts
│   └── utils
├── tsconfig.json
└── vendor
    └── bundle
        └── ruby

```

## Build Instructions

### Requirements

* React Native 0.75.4
* Node.js ≥ 18
* Xcode 15+ (iOS development)
* iOS device for testing (iOS 14.0+)
* macOS for building iOS version
* Packages: Listed in `package.json`

### Build Steps

1. Navigate to the project directory
```bash
cd PizzaDash
```

2. Install dependencies
```bash
npm install
```

3. Install iOS dependencies
```bash
cd ios
pod install
cd ..
```

4. Start Metro bundler
```bash
npx react-native start
```

5. Build and run on iOS simulator
```bash
npx react-native run-ios
```

For physical device deployment:
1. Open the project in Xcode by opening `ios/PizzaDash.xcworkspace`
2. Connect your iOS device
3. Select your device in the device dropdown
4. Click Run (or Cmd+R)

### Test Steps

The application requires real-world movement to test most features. To properly test the application:

1. Launch the application on a physical iOS device
2. Allow location permissions when prompted
3. Navigate to the Dashboard screen to verify step tracking functionality
4. Go to the Map screen to check if nearby restaurants are displayed
5. Test the order system by accepting a delivery and walking to a restaurant location
6. Complete the pizza-making mini-game within proximity of the restaurant
7. Deliver the order to the customer location

For development testing purposes, use the Developer Menu (accessed by tapping 5 times on the currency display in the Customization screen) to add currency and experience points.

## Features

* Real-time GPS tracking and navigation
* Step counting and fitness metrics
* Dynamic order generation system
* Pizza-making mini-game
* Progression system with experience points and currency
* Customizable vehicles and characters
* Historical step data visualization

## Known Limitations

* Only available for iOS devices
* Requires physical movement for core gameplay elements
* Restaurant data depends on OpenStreetMap coverage in user's area
* Step counting accuracy varies by device model
* "Make Pizza" button UI can be confusing for new users
