# Tact Mobile

A React Native (Expo) mobile application for workplace communication coaching.

**Say what you mean, without the mean.**

## Features

### Tact (Tone Coach)
- Analyze messages for tone and communication effectiveness
- Get AI-powered suggestions for improvement
- Score your messages on a 0-100 scale
- See highlighted feedback on specific words/phrases
- Receive rewritten alternatives for improvement

### Parallax (Decision Helper)
- Devil's advocate chat for workplace situations
- 3-phase process: Input → Strategy → Execution
- Get multiple strategy options with risk levels
- Receive dos and don'ts for chosen approach
- Generate draft messages based on your strategy

## Tech Stack

- **Framework:** React Native (Expo SDK 52+)
- **Styling:** NativeWind (Tailwind for RN)
- **Navigation:** Expo Router (File-based)
- **Animations:** React Native Reanimated
- **State Management:** Zustand
- **Storage:** AsyncStorage
- **Icons:** Lucide React Native

## iOS Design

This app follows iOS 26+ design guidelines with:
- Native tab bar with blur effects
- Liquid glass card components
- Haptic feedback throughout
- Dark/Light theme support
- Smooth spring animations

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator or physical device
- Backend server deployed (see parent project)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS
npm run ios
```

### Environment Setup

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_API_URL=https://your-backend-url.vercel.app
```

## Project Structure

```
mobile-app/
├── app/                    # Expo Router screens
│   ├── _layout.tsx        # Root layout with providers
│   ├── index.tsx          # Entry redirect
│   └── (tabs)/            # Tab navigation
│       ├── _layout.tsx    # Tab bar configuration
│       ├── index.tsx      # Tact screen
│       ├── parallax.tsx   # Parallax screen
│       ├── history.tsx    # History screen
│       └── settings.tsx   # Settings screen
├── components/
│   ├── ui/                # Shared UI components
│   │   ├── GlassCard.tsx
│   │   ├── Button.tsx
│   │   ├── TextInput.tsx
│   │   └── ...
│   ├── tact/              # Tact-specific components
│   │   ├── TactMeter.tsx
│   │   └── SmartText.tsx
│   └── parallax/          # Parallax-specific components
├── hooks/                 # Custom React hooks
│   ├── useTheme.ts
│   └── useHaptics.ts
├── store/                 # Zustand stores
│   └── useAppStore.ts
├── lib/                   # Utilities
│   └── api.ts            # API service
├── types/                 # TypeScript definitions
│   └── index.ts
└── assets/               # Images, fonts, etc.
```

## User Flows

### Tact Flow
1. User enters message text
2. Selects receiver type (Boss, Coworker, etc.)
3. Selects intended tone (Professional, Direct, etc.)
4. Taps "Analyze Tone"
5. Views score, summary, and suggestions
6. Can copy improved message to clipboard

### Parallax Flow
1. User describes their situation
2. AI analyzes and presents 2-3 strategy options
3. User selects preferred approach
4. Views dos/don'ts for execution
5. Can generate draft message
6. Can refine draft in Tact

## API Endpoints

The app communicates with a backend server:

- `POST /api/analyze` - Analyze message tone
- `POST /api/parallax/chat` - Start Parallax session
- `POST /api/parallax/draft` - Generate draft from strategy

See parent project for backend implementation.

## Theming

Supports automatic, light, and dark themes:

```typescript
const { isDark, colors, setTheme } = useTheme();

// Available colors:
colors.background      // Main background
colors.text           // Primary text
colors.textSecondary  // Secondary text
colors.accent         // Brand color (orange)
colors.success        // Green
colors.warning        // Amber
colors.error          // Red
```

## Building for Production

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## License

Personal use only. See parent project for full terms.
