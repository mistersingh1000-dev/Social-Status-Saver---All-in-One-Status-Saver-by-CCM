# Social Status Saver - All in One Status Saver by CCM

## App Name
Social Status Saver - All in One Status Saver by CCM

## Overview
A mobile application built with Expo React Native that allows users to legally save and manage social media status videos and images. Supports WhatsApp, Instagram, Facebook, and Snapchat downloading using privacy-compliant methods.

## Architecture
- **Frontend**: Expo Router with file-based routing, React Native
- **Backend**: Express.js (TypeScript) for URL parsing and media downloading
- **Storage**: AsyncStorage for local persistence of saved media and download history

## Key Features
- **Home Dashboard**: Stats overview and quick access to all platforms
- **WhatsApp Status Viewer**: Instructions for accessing public WhatsApp statuses on Android
- **Link Downloader**: Paste URLs from Instagram, Facebook, Snapchat to download public media
- **Saved Media Gallery**: Grid view with platform/type filters
- **Settings**: Storage management, clear data, app info

## Project Structure
```
app/(tabs)/
  _layout.tsx       - Tab navigation with 5 tabs (Home, WhatsApp, Download, Saved, Settings)
  index.tsx         - Home dashboard
  whatsapp.tsx      - WhatsApp status info & saved statuses
  download.tsx      - URL-based downloader
  saved.tsx         - Media gallery with filters
  settings.tsx      - App settings and about

components/
  PlatformCard.tsx  - Platform card with icon and count
  MediaCard.tsx     - Media thumbnail card with delete action
  UrlInput.tsx      - URL input with paste and download buttons
  ErrorBoundary.tsx - App error boundary
  ErrorFallback.tsx - Error fallback UI

lib/
  storage.ts        - AsyncStorage CRUD for saved media and download history
  platforms.ts      - Platform detection from URLs
  useTheme.ts       - Theme hook using color scheme
  query-client.ts   - React Query + API request utilities

server/
  routes.ts         - POST /api/download (URL parser), GET /api/health
  index.ts          - Express server setup
```

## Backend API
- `POST /api/download` - Accepts a URL, fetches the page, parses og:video/og:image meta tags, downloads media and returns base64 data
- `GET /api/health` - Health check endpoint

## Dependencies
- expo-clipboard, expo-file-system, expo-media-library, expo-sharing
- @react-native-async-storage/async-storage
- expo-haptics for tactile feedback
- @expo/vector-icons (Ionicons) for all iconography

## Theme
- Dark navy background with emerald green accent (tint)
- Platform-specific colors: WhatsApp green, Instagram pink, Facebook blue, Snapchat yellow
